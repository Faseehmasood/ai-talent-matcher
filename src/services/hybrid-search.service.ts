import mongoose from "mongoose"
import connectDB from "@/src/lib/db"
import {
  ResumeChunk,
  ResumeSectionType,
} from "@/src/models/resume-chunk.model"
import { User } from "@/src/models/users.model"
import {
  embedTextChunks,
  dotProductSimilarity,
  EMBEDDING_MODEL_VERSION,
} from "@/src/lib/gemini"
import {
  parseResumePdf,
  computeResumeSha256,
  ParsedResumeResult,
} from "@/src/services/pdf-parser.service"
import { escapeRegex } from "@/src/lib/validations"

export interface IngestResumeInput {
  buffer: Buffer
  candidateId: string
  candidateName: string
  applicationId?: string
  jobId?: string
}

export interface IngestResumeOutput {
  resumeHash: string
  chunksStored: number
  cacheHit: boolean
  extractedGithubUsername: string
  extractedLinks: string[]
  ocrUsed: boolean
  promptInjectionDetected: boolean
}

export interface CandidateHybridMatch {
  candidateId: string
  semanticSimilarityPercent: number
  rrfScore: number
  matchedSection: ResumeSectionType
  matchedSnippet: string
  matchedKeywords: string[]
  extractedGithubUsername?: string
}

export interface HybridSearchResponse {
  matches: Map<string, CandidateHybridMatch>
  orderedCandidateIds: string[]
  searchMode: "atlas_hybrid_rrf" | "in_memory_hybrid_fallback"
}

const RRF_K = 60

/**
 * Idempotently parses a PDF resume, checks for existing SHA-256 cached embeddings,
 * generates 768-d vectors via text-embedding-004 on cache miss, and stores ResumeChunks.
 */
export async function ingestCandidateResumeChunks(
  input: IngestResumeInput
): Promise<IngestResumeOutput> {
  await connectDB()

  const resumeHash = computeResumeSha256(input.buffer)
  const candidateObjectId = new mongoose.Types.ObjectId(input.candidateId)
  const applicationObjectId = input.applicationId
    ? new mongoose.Types.ObjectId(input.applicationId)
    : undefined
  const jobObjectId = input.jobId
    ? new mongoose.Types.ObjectId(input.jobId)
    : undefined

  // 1. Check SHA-256 idempotency cache for this candidate + embeddingModel
  const existingChunks = await ResumeChunk.find({
    candidateId: candidateObjectId,
    resumeHash,
    embeddingModel: EMBEDDING_MODEL_VERSION,
  })
    .sort({ chunkIndex: 1 })
    .lean()

  if (existingChunks.length > 0) {
    // Update applicationId / jobId references on cached chunks so job-scoped filters work
    if (applicationObjectId || jobObjectId) {
      await ResumeChunk.updateMany(
        {
          candidateId: candidateObjectId,
          resumeHash,
        },
        {
          $set: {
            ...(applicationObjectId ? { applicationId: applicationObjectId } : {}),
            ...(jobObjectId ? { jobId: jobObjectId } : {}),
          },
        }
      )
    }

    return {
      resumeHash,
      chunksStored: existingChunks.length,
      cacheHit: true,
      extractedGithubUsername:
        existingChunks[0].extractedGithubUsername || "",
      extractedLinks: existingChunks[0].extractedLinks || [],
      ocrUsed: false,
      promptInjectionDetected: false,
    }
  }

  // 2. Parse PDF layout, links, and section-aware chunks
  const parsed: ParsedResumeResult = await parseResumePdf(
    input.buffer,
    input.candidateName
  )

  if (parsed.chunks.length === 0) {
    return {
      resumeHash,
      chunksStored: 0,
      cacheHit: false,
      extractedGithubUsername: parsed.extractedGithubUsername,
      extractedLinks: parsed.extractedLinks,
      ocrUsed: parsed.ocrUsed,
      promptInjectionDetected: parsed.promptInjectionDetected,
    }
  }

  // 3. Batch-embed all resume chunks in a single API round-trip
  const chunkTexts = parsed.chunks.map((c) => c.chunkText)
  const embeddings = await embedTextChunks(chunkTexts, "RETRIEVAL_DOCUMENT")

  // 4. Bulk upsert chunks atomically
  const bulkOps = parsed.chunks.map((chunk, idx) => ({
    updateOne: {
      filter: {
        candidateId: candidateObjectId,
        resumeHash,
        chunkIndex: chunk.chunkIndex,
      },
      update: {
        $set: {
          applicationId: applicationObjectId,
          candidateId: candidateObjectId,
          jobId: jobObjectId,
          resumeHash,
          sectionType: chunk.sectionType,
          chunkIndex: chunk.chunkIndex,
          chunkText: chunk.chunkText,
          embedding: embeddings[idx],
          embeddingModel: EMBEDDING_MODEL_VERSION,
          extractedLinks: parsed.extractedLinks,
          extractedGithubUsername: parsed.extractedGithubUsername,
        },
      },
      upsert: true,
    },
  }))

  await ResumeChunk.bulkWrite(bulkOps)

  return {
    resumeHash,
    chunksStored: parsed.chunks.length,
    cacheHit: false,
    extractedGithubUsername: parsed.extractedGithubUsername,
    extractedLinks: parsed.extractedLinks,
    ocrUsed: parsed.ocrUsed,
    promptInjectionDetected: parsed.promptInjectionDetected,
  }
}

/**
 * Extracts clean query tokens for BM25 keyword scoring and UI highlighting.
 */
export function tokenizeSearchQuery(query: string): string[] {
  const stopWords = new Set([
    "and",
    "or",
    "the",
    "for",
    "with",
    "in",
    "of",
    "to",
    "a",
    "an",
    "on",
    "at",
    "by",
    "who",
    "has",
    "have",
  ])

  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[\s,;+|/()[\]]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !stopWords.has(t))
    )
  )
}

function cleanSnippetText(rawChunkText: string): string {
  return rawChunkText.replace(/^\[Candidate:[^\]]+\]\s*/i, "").trim()
}

function extractMatchedKeywords(text: string, queryTokens: string[]): string[] {
  const lower = text.toLowerCase()
  return queryTokens.filter((token) => lower.includes(token))
}

interface RawChunkCandidate {
  _id: string
  candidateId: string
  sectionType: ResumeSectionType
  chunkText: string
  extractedGithubUsername?: string
  vectorScore?: number
  bm25Score?: number
}

/**
 * Attempts native MongoDB Atlas $vectorSearch + $search (BM25) aggregation.
 * Returns null if the cluster does not have Atlas Search indexes configured.
 */
async function tryAtlasNativeHybridSearch(
  queryVector: number[],
  rawQuery: string,
  jobId?: string
): Promise<{
  vectorResults: RawChunkCandidate[]
  bm25Results: RawChunkCandidate[]
} | null> {
  try {
    const vectorFilter: Record<string, unknown> = {
      embeddingModel: EMBEDDING_MODEL_VERSION,
    }
    if (jobId) {
      vectorFilter.jobId = new mongoose.Types.ObjectId(jobId)
    }

    const vectorPipeline: mongoose.PipelineStage[] = [
      {
        $vectorSearch: {
          index: "resume_vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 40,
          filter: vectorFilter,
        },
      } as unknown as mongoose.PipelineStage,
      {
        $project: {
          _id: 1,
          candidateId: 1,
          sectionType: 1,
          chunkText: 1,
          extractedGithubUsername: 1,
          vectorScore: { $meta: "vectorSearchScore" },
        },
      },
    ]

    const bm25Pipeline: mongoose.PipelineStage[] = [
      {
        $search: {
          index: "resume_bm25_index",
          text: {
            query: rawQuery,
            path: "chunkText",
            fuzzy: { maxEdits: 1, prefixLength: 2 },
          },
        },
      } as unknown as mongoose.PipelineStage,
      ...(jobId
        ? [{ $match: { jobId: new mongoose.Types.ObjectId(jobId) } }]
        : []),
      { $limit: 40 },
      {
        $project: {
          _id: 1,
          candidateId: 1,
          sectionType: 1,
          chunkText: 1,
          extractedGithubUsername: 1,
          bm25Score: { $meta: "searchScore" },
        },
      },
    ]

    const [vectorDocs, bm25Docs] = await Promise.all([
      ResumeChunk.aggregate(vectorPipeline),
      ResumeChunk.aggregate(bm25Pipeline).catch(() => []),
    ])

    if (vectorDocs.length === 0 && bm25Docs.length === 0) {
      const totalChunks = await ResumeChunk.countDocuments()
      if (totalChunks > 0) {
        // Chunks exist in MongoDB, but Atlas Search index is not built or active yet
        return null
      }
    }

    return {
      vectorResults: vectorDocs.map((d) => ({
        _id: d._id.toString(),
        candidateId: d.candidateId.toString(),
        sectionType: d.sectionType as ResumeSectionType,
        chunkText: d.chunkText,
        extractedGithubUsername: d.extractedGithubUsername,
        vectorScore: Number(d.vectorScore) || 0,
      })),
      bm25Results: bm25Docs.map((d) => ({
        _id: d._id.toString(),
        candidateId: d.candidateId.toString(),
        sectionType: d.sectionType as ResumeSectionType,
        chunkText: d.chunkText,
        extractedGithubUsername: d.extractedGithubUsername,
        bm25Score: Number(d.bm25Score) || 0,
      })),
    }
  } catch {
    return null
  }
}

/**
 * Computes BM25-inspired lexical score over a text document for the given query tokens.
 */
function computeInMemoryBm25Score(
  text: string,
  queryTokens: string[],
  avgDocLength: number
): number {
  if (queryTokens.length === 0) return 0
  const lower = text.toLowerCase()
  const docLen = Math.max(lower.length, 1)
  const k1 = 1.2
  const b = 0.75

  let score = 0
  for (const token of queryTokens) {
    const escaped = escapeRegex(token)
    const regex = new RegExp(escaped, "gi")
    const matches = lower.match(regex)
    const tf = matches ? matches.length : 0
    if (tf > 0) {
      const numerator = tf * (k1 + 1)
      const denominator =
        tf + k1 * (1 - b + b * (docLen / Math.max(avgDocLength, 100)))
      score += numerator / denominator
    }
  }
  return score
}

/**
 * Executes Hybrid RAG Search ($vectorSearch + BM25 with Reciprocal Rank Fusion k=60)
 * and automatically falls back to in-memory vector dot-product + BM25 scoring when
 * running on a local/M0 MongoDB cluster without Atlas Vector Search indexes configured.
 */
export async function hybridCandidateSearch(params: {
  query: string
  jobId?: string
  fetchArchived?: boolean
  limit?: number
}): Promise<HybridSearchResponse> {
  await connectDB()

  const trimmedQuery = params.query.trim()
  const queryTokens = tokenizeSearchQuery(trimmedQuery)
  const limit = params.limit ?? 50

  let queryVector: number[] | null = null
  try {
    const embedded = await embedTextChunks([trimmedQuery], "RETRIEVAL_QUERY")
    if (embedded.length > 0) {
      queryVector = embedded[0]
    }
  } catch {
    // Graceful degradation to lexical BM25 if GEMINI_API_KEY is temporarily unreachable
    queryVector = null
  }

  let searchMode: "atlas_hybrid_rrf" | "in_memory_hybrid_fallback" =
    "atlas_hybrid_rrf"
  let vectorRankedChunks: RawChunkCandidate[] = []
  let bm25RankedChunks: RawChunkCandidate[] = []

  if (queryVector) {
    const atlasOutcome = await tryAtlasNativeHybridSearch(
      queryVector,
      trimmedQuery,
      params.jobId
    )
    if (atlasOutcome) {
      vectorRankedChunks = atlasOutcome.vectorResults
      bm25RankedChunks = atlasOutcome.bm25Results
    } else {
      searchMode = "in_memory_hybrid_fallback"
    }
  } else {
    searchMode = "in_memory_hybrid_fallback"
  }

  // Fallback: In-memory exact dot-product + BM25 over stored ResumeChunk documents
  if (searchMode === "in_memory_hybrid_fallback") {
    const chunkFilter: Record<string, unknown> = {}
    if (params.jobId) {
      chunkFilter.jobId = new mongoose.Types.ObjectId(params.jobId)
    }

    const storedChunks = await ResumeChunk.find(chunkFilter)
      .select(
        "_id candidateId sectionType chunkText embedding extractedGithubUsername"
      )
      .limit(2000)
      .lean()

    const avgLen =
      storedChunks.reduce((acc, c) => acc + (c.chunkText?.length || 0), 0) /
      Math.max(storedChunks.length, 1)

    const scored = storedChunks.map((chunk) => {
      const vScore =
        queryVector && Array.isArray(chunk.embedding)
          ? Math.max(0, dotProductSimilarity(queryVector, chunk.embedding))
          : 0
      const lScore = computeInMemoryBm25Score(
        chunk.chunkText || "",
        queryTokens,
        avgLen
      )
      return {
        _id: chunk._id.toString(),
        candidateId: chunk.candidateId.toString(),
        sectionType: (chunk.sectionType || "general") as ResumeSectionType,
        chunkText: chunk.chunkText || "",
        extractedGithubUsername: chunk.extractedGithubUsername || "",
        vectorScore: vScore,
        bm25Score: lScore,
      }
    })

    vectorRankedChunks = [...scored]
      .filter((c) => (c.vectorScore ?? 0) > 0.25)
      .sort((a, b) => (b.vectorScore ?? 0) - (a.vectorScore ?? 0))
      .slice(0, 40)

    bm25RankedChunks = [...scored]
      .filter((c) => (c.bm25Score ?? 0) > 0)
      .sort((a, b) => (b.bm25Score ?? 0) - (a.bm25Score ?? 0))
      .slice(0, 40)
  }

  // Reciprocal Rank Fusion (RRF, k = 60) at the chunk level, then Parent-Document grouping by candidateId
  const chunkFusionMap = new Map<
    string,
    {
      chunk: RawChunkCandidate
      rrfScore: number
      vectorScore: number
      bm25Score: number
    }
  >()

  vectorRankedChunks.forEach((chunk, idx) => {
    const rank = idx + 1
    const rrfContribution = 1 / (RRF_K + rank)
    chunkFusionMap.set(chunk._id, {
      chunk,
      rrfScore: rrfContribution,
      vectorScore: chunk.vectorScore ?? 0,
      bm25Score: 0,
    })
  })

  bm25RankedChunks.forEach((chunk, idx) => {
    const rank = idx + 1
    const rrfContribution = 1 / (RRF_K + rank)
    const existing = chunkFusionMap.get(chunk._id)
    if (existing) {
      existing.rrfScore += rrfContribution
      existing.bm25Score = chunk.bm25Score ?? 0
    } else {
      chunkFusionMap.set(chunk._id, {
        chunk,
        rrfScore: rrfContribution,
        vectorScore: chunk.vectorScore ?? 0,
        bm25Score: chunk.bm25Score ?? 0,
      })
    }
  })

  // Parent-Document Retrieval: Group chunks by candidateId and select best chunk + aggregate RRF
  const candidateBestMatch = new Map<string, CandidateHybridMatch>()

  for (const { chunk, rrfScore, vectorScore } of chunkFusionMap.values()) {
    const cid = chunk.candidateId
    const matchedKeywords = extractMatchedKeywords(chunk.chunkText, queryTokens)
    const similarityPct =
      vectorScore > 0
        ? Math.min(99, Math.max(15, Math.round(vectorScore * 100)))
        : Math.min(95, 55 + matchedKeywords.length * 12)

    const cleanSnippet = cleanSnippetText(chunk.chunkText).slice(0, 260)

    const current = candidateBestMatch.get(cid)
    if (!current || rrfScore > current.rrfScore) {
      candidateBestMatch.set(cid, {
        candidateId: cid,
        semanticSimilarityPercent: similarityPct,
        rrfScore: Number((current ? current.rrfScore + rrfScore : rrfScore).toFixed(5)),
        matchedSection: chunk.sectionType,
        matchedSnippet: cleanSnippet,
        matchedKeywords: Array.from(
          new Set([...(current?.matchedKeywords || []), ...matchedKeywords])
        ),
        extractedGithubUsername:
          chunk.extractedGithubUsername || current?.extractedGithubUsername,
      })
    } else {
      current.rrfScore = Number((current.rrfScore + rrfScore * 0.35).toFixed(5))
      current.matchedKeywords = Array.from(
        new Set([...current.matchedKeywords, ...matchedKeywords])
      )
    }
  }

  // Also include direct User profile matches (name / skills / bio) so candidates without uploaded PDFs yet are still searchable
  const safeRegex = escapeRegex(trimmedQuery)
  const profileUsers = await User.find({
    role: "candidate",
    isActive: params.fetchArchived ? false : true,
    $or: [
      { name: { $regex: safeRegex, $options: "i" } },
      { skills: { $regex: safeRegex, $options: "i" } },
      { bio: { $regex: safeRegex, $options: "i" } },
    ],
  })
    .select("_id name skills bio")
    .limit(limit)
    .lean()

  profileUsers.forEach((u, idx) => {
    const cid = u._id.toString()
    const profileText = `${u.name} ${(u.skills || []).join(", ")} ${u.bio || ""}`
    const matchedKeywords = extractMatchedKeywords(profileText, queryTokens)
    const profileRrf = 1 / (RRF_K + idx + 1)

    const existing = candidateBestMatch.get(cid)
    if (existing) {
      existing.rrfScore = Number((existing.rrfScore + profileRrf).toFixed(5))
      existing.matchedKeywords = Array.from(
        new Set([...existing.matchedKeywords, ...matchedKeywords])
      )
      existing.semanticSimilarityPercent = Math.min(
        99,
        Math.max(existing.semanticSimilarityPercent, 75 + matchedKeywords.length * 6)
      )
    } else {
      candidateBestMatch.set(cid, {
        candidateId: cid,
        semanticSimilarityPercent: Math.min(
          96,
          72 + matchedKeywords.length * 8
        ),
        rrfScore: Number(profileRrf.toFixed(5)),
        matchedSection: "skills",
        matchedSnippet:
          u.skills && u.skills.length > 0
            ? `Profile Skills: ${u.skills.join(", ")}`
            : u.bio || `Matched candidate profile: ${u.name}`,
        matchedKeywords,
      })
    }
  })

  const sortedEntries = Array.from(candidateBestMatch.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, limit)

  const finalMap = new Map<string, CandidateHybridMatch>()
  const orderedCandidateIds: string[] = []

  for (const entry of sortedEntries) {
    finalMap.set(entry.candidateId, entry)
    orderedCandidateIds.push(entry.candidateId)
  }

  return {
    matches: finalMap,
    orderedCandidateIds,
    searchMode,
  }
}
