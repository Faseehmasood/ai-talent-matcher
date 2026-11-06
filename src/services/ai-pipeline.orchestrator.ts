import mongoose from "mongoose"
import connectDB from "@/src/lib/db"
import { Application } from "@/src/models/application.model"
import { ResumeChunk } from "@/src/models/resume-chunk.model"
import {
  embedTextChunks,
  EMBEDDING_MODEL_VERSION,
} from "@/src/lib/gemini"
import {
  parseResumePdf,
  ParsedResumeChunk,
} from "@/src/services/pdf-parser.service"
import {
  runGithubVerificationAgent,
  GithubVerificationReport,
} from "@/src/services/github-verification.agent"
import { cleanGithubUsername } from "@/src/services/github-tool.service"
import {
  RUBRIC_VERSION,
  computeResumeHash,
  computeJobRequirementsHash,
  getTier1ResumeCache,
  setTier1ResumeCache,
  getTier2EvaluationCache,
  setTier2EvaluationCache,
  invalidateTier2EvaluationCache,
} from "@/src/services/idempotency-cache.service"
import {
  scoreCandidateAgainstJob,
  computeWeightedMatchScore,
} from "@/src/services/ai-scoring.service"
import { publishUserEvent } from "@/src/lib/sse-bus"
import { createNotification } from "@/src/actions/notification.actions"
import {
  AIProcessingStatus,
  AIProcessingState,
  AIApplicationAnalysis,
} from "@/types"

export interface RunAIPipelineOptions {
  pdfBuffer?: Buffer
  forceRefresh?: boolean
  manualGithubHandle?: string
}

export interface RunAIPipelineResult {
  success: boolean
  applicationId: string
  matchScore?: number
  aiProcessing: AIProcessingState
  aiAnalysis?: AIApplicationAnalysis | null
  githubVerification?: GithubVerificationReport | null
  error?: string
}

/**
 * Downloads the raw PDF buffer from a trusted Cloudinary URL with a 15s timeout.
 */
async function fetchPdfBufferFromUrl(url: string): Promise<Buffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF from storage (HTTP ${res.status})`)
    }
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Updates `Application.aiProcessing` in MongoDB and broadcasts a real-time SSE event
 * to both the HR job owner and the candidate.
 */
async function transitionPipelineStage(params: {
  applicationId: string
  hrUserId: string
  candidateId: string
  jobId: string
  candidateName: string
  jobTitle: string
  status: AIProcessingStatus
  progress: number
  cachedHit?: boolean
  error?: string
}): Promise<AIProcessingState> {
  const aiProcessing: AIProcessingState = {
    status: params.status,
    progress: params.progress,
    cachedHit: Boolean(params.cachedHit),
    ...(params.error ? { error: params.error } : {}),
    updatedAt: new Date(),
  }

  await Application.findByIdAndUpdate(params.applicationId, {
    $set: { aiProcessing },
  })

  const eventPayload = {
    applicationId: params.applicationId,
    jobId: params.jobId,
    candidateId: params.candidateId,
    candidateName: params.candidateName,
    jobTitle: params.jobTitle,
    aiProcessing,
  }

  await Promise.all([
    publishUserEvent(params.hrUserId, {
      type: "AI_PIPELINE_PROGRESS",
      payload: eventPayload,
    }),
    publishUserEvent(params.candidateId, {
      type: "AI_PIPELINE_PROGRESS",
      payload: eventPayload,
    }),
  ])

  return aiProcessing
}

/**
 * Executes the 5-stage deterministic AI evaluation state machine:
 * 1. `PARSING_PDF` (20%)
 * 2. `EMBEDDING_CHUNKS` (45%)
 * 3. `VERIFYING_GITHUB` (70%)
 * 4. `SCORING_CANDIDATE` (90%)
 * 5. `COMPLETED` (100%) / `FAILED`
 */
export async function runApplicationAIPipeline(
  applicationId: string,
  options: RunAIPipelineOptions = {}
): Promise<RunAIPipelineResult> {
  await connectDB()

  const application = await Application.findById(applicationId)
    .populate("candidate", "name email skills")
    .populate("job", "title description skills postedBy")

  if (!application || !application.job || !application.candidate) {
    const failedState: AIProcessingState = {
      status: "FAILED",
      progress: 0,
      error: "Application, candidate, or job document not found",
      updatedAt: new Date(),
    }
    return {
      success: false,
      applicationId,
      aiProcessing: failedState,
      error: failedState.error,
    }
  }

  const jobDoc = application.job as unknown as {
    _id: mongoose.Types.ObjectId
    title: string
    description?: string
    skills?: string[]
    postedBy: mongoose.Types.ObjectId
  }
  const candidateDoc = application.candidate as unknown as {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    skills?: string[]
  }

  const hrUserId = jobDoc.postedBy.toString()
  const candidateId = candidateDoc._id.toString()
  const jobId = jobDoc._id.toString()
  const candidateName = candidateDoc.name || "Candidate"
  const jobTitle = jobDoc.title || "Engineering Role"

  try {
    // =========================================================================
    // STAGE 1: PARSING_PDF (20%)
    // =========================================================================
    await transitionPipelineStage({
      applicationId,
      hrUserId,
      candidateId,
      jobId,
      candidateName,
      jobTitle,
      status: "PARSING_PDF",
      progress: 20,
    })

    let parsedChunks: ParsedResumeChunk[] = []
    let combinedResumeText = ""
    let extractedLinks: string[] = application.extractedLinks || []
    let extractedGithubUsername: string =
      application.extractedGithubUsername || ""
    let ocrUsed = Boolean(application.ocrUsed)

    // Check if chunks already exist in MongoDB when no new pdfBuffer is supplied
    const existingStoredChunks = !options.pdfBuffer
      ? await ResumeChunk.find({ candidateId: candidateDoc._id })
          .sort({ chunkIndex: 1 })
          .lean()
      : []

    if (!options.pdfBuffer && existingStoredChunks.length > 0) {
      parsedChunks = existingStoredChunks.map((c) => ({
        sectionType: c.sectionType,
        chunkIndex: c.chunkIndex,
        chunkText: c.chunkText,
      }))
      combinedResumeText = parsedChunks.map((c) => c.chunkText).join("\n\n")
      if (extractedLinks.length === 0) {
        extractedLinks = existingStoredChunks[0].extractedLinks || []
      }
      if (!extractedGithubUsername) {
        extractedGithubUsername =
          existingStoredChunks[0].extractedGithubUsername || ""
      }
    } else {
      try {
        const buffer =
          options.pdfBuffer || (await fetchPdfBufferFromUrl(application.resume))
        const parsedPdf = await parseResumePdf(buffer, candidateName)
        parsedChunks = parsedPdf.chunks
        combinedResumeText =
          parsedPdf.fullText ||
          parsedPdf.chunks.map((c) => c.chunkText).join("\n\n")
        extractedLinks = parsedPdf.extractedLinks
        extractedGithubUsername =
          parsedPdf.extractedGithubUsername || extractedGithubUsername
        ocrUsed = parsedPdf.ocrUsed
      } catch {
        // Fallback if remote PDF URL is unreachable in local/offline sandbox
        combinedResumeText =
          application.coverLetter ||
          `Candidate: ${candidateName}\nSkills: ${(
            candidateDoc.skills || []
          ).join(", ")}`
        parsedChunks = [
          {
            sectionType: "summary",
            chunkIndex: 0,
            chunkText: `[Candidate: ${candidateName} | Section: SUMMARY]\n${combinedResumeText}`,
          },
        ]
      }
    }

    const resumeTextHash =
      computeResumeHash(combinedResumeText) ||
      application.resumeHash ||
      applicationId

    // =========================================================================
    // STAGE 2: EMBEDDING_CHUNKS (45%)
    // =========================================================================
    const tier1Cached = await getTier1ResumeCache(resumeTextHash)
    let wasCachedHit = Boolean(tier1Cached)

    await transitionPipelineStage({
      applicationId,
      hrUserId,
      candidateId,
      jobId,
      candidateName,
      jobTitle,
      status: "EMBEDDING_CHUNKS",
      progress: 45,
      cachedHit: wasCachedHit,
    })

    let chunkEmbeddings: number[][] = []
    if (
      tier1Cached &&
      Array.isArray(tier1Cached.embeddings) &&
      tier1Cached.embeddings.length === parsedChunks.length
    ) {
      chunkEmbeddings = tier1Cached.embeddings
    } else if (
      existingStoredChunks.length === parsedChunks.length &&
      existingStoredChunks.every(
        (c) => Array.isArray(c.embedding) && c.embedding.length === 768
      )
    ) {
      chunkEmbeddings = existingStoredChunks.map((c) => c.embedding)
    } else if (parsedChunks.length > 0) {
      try {
        chunkEmbeddings = await embedTextChunks(
          parsedChunks.map((c) => c.chunkText),
          "RETRIEVAL_DOCUMENT"
        )
      } catch {
        chunkEmbeddings = []
      }
    }

    // Persist 768-d ResumeChunks to MongoDB for Hybrid Vector + BM25 Search
    if (
      parsedChunks.length > 0 &&
      chunkEmbeddings.length === parsedChunks.length
    ) {
      const bulkOps = parsedChunks.map((chunk, idx) => ({
        updateOne: {
          filter: {
            candidateId: candidateDoc._id,
            resumeHash: resumeTextHash,
            chunkIndex: chunk.chunkIndex,
          },
          update: {
            $set: {
              applicationId: application._id,
              candidateId: candidateDoc._id,
              jobId: jobDoc._id,
              resumeHash: resumeTextHash,
              sectionType: chunk.sectionType,
              chunkIndex: chunk.chunkIndex,
              chunkText: chunk.chunkText,
              embedding: chunkEmbeddings[idx],
              embeddingModel: EMBEDDING_MODEL_VERSION,
              extractedLinks,
              extractedGithubUsername,
            },
          },
          upsert: true,
        },
      }))
      await ResumeChunk.bulkWrite(bulkOps)
    }

    // =========================================================================
    // STAGE 3: VERIFYING_GITHUB (70%)
    // =========================================================================
    await transitionPipelineStage({
      applicationId,
      hrUserId,
      candidateId,
      jobId,
      candidateName,
      jobTitle,
      status: "VERIFYING_GITHUB",
      progress: 70,
      cachedHit: wasCachedHit,
    })

    const explicitHandle =
      cleanGithubUsername(options.manualGithubHandle) ||
      cleanGithubUsername(extractedGithubUsername) ||
      cleanGithubUsername(tier1Cached?.extractedGithubUsername) ||
      null

    let githubReport: GithubVerificationReport | null =
      !options.forceRefresh && !options.manualGithubHandle && tier1Cached
        ? tier1Cached.githubReport
        : null

    if (!githubReport) {
      githubReport = await runGithubVerificationAgent({
        resumeText: combinedResumeText,
        extractedLinks,
        explicitGithubHandle: explicitHandle,
        candidateName,
        jobTitle,
        jobSkills: jobDoc.skills || [],
      })

      await setTier1ResumeCache(resumeTextHash, {
        resumeTextHash,
        normalizedResumeText: combinedResumeText,
        chunks: parsedChunks,
        embeddings: chunkEmbeddings,
        extractedLinks,
        extractedGithubUsername:
          githubReport.githubUsername || explicitHandle || "",
        ocrUsed,
        githubReport,
        cachedAt: new Date().toISOString(),
      })
    }

    // =========================================================================
    // STAGE 4: SCORING_CANDIDATE (90%)
    // =========================================================================
    const jobRequirementsHash = computeJobRequirementsHash({
      _id: jobId,
      title: jobTitle,
      description: jobDoc.description || "",
      skills: jobDoc.skills || [],
    })

    if (options.forceRefresh || options.manualGithubHandle) {
      await invalidateTier2EvaluationCache(resumeTextHash, jobRequirementsHash)
    }

    let evaluation = await getTier2EvaluationCache(
      resumeTextHash,
      jobRequirementsHash
    )
    if (evaluation) {
      wasCachedHit = true
    }

    await transitionPipelineStage({
      applicationId,
      hrUserId,
      candidateId,
      jobId,
      candidateName,
      jobTitle,
      status: "SCORING_CANDIDATE",
      progress: 90,
      cachedHit: wasCachedHit,
    })

    if (!evaluation) {
      evaluation = await scoreCandidateAgainstJob({
        candidateName,
        resumeText: combinedResumeText,
        coverLetter: application.coverLetter || "",
        job: {
          _id: jobId,
          title: jobTitle,
          description: jobDoc.description || "",
          skills: jobDoc.skills || [],
        },
        githubReport,
      })

      await setTier2EvaluationCache(
        resumeTextHash,
        jobRequirementsHash,
        evaluation
      )
    } else if (
      evaluation.githubVerificationScore !== githubReport.verificationScore
    ) {
      evaluation = {
        ...evaluation,
        githubVerificationScore: githubReport.verificationScore,
        matchScore: computeWeightedMatchScore({
          skillsMatchScore: evaluation.skillsMatchScore,
          experienceRelevanceScore: evaluation.experienceRelevanceScore,
          githubVerificationScore: githubReport.verificationScore,
          educationDomainScore: evaluation.educationDomainScore,
        }),
      }
      await setTier2EvaluationCache(
        resumeTextHash,
        jobRequirementsHash,
        evaluation
      )
    }

    // =========================================================================
    // STAGE 5: COMPLETED (100%)
    // =========================================================================
    const completedProcessing: AIProcessingState = {
      status: "COMPLETED",
      progress: 100,
      cachedHit: wasCachedHit,
      updatedAt: new Date(),
    }

    const aiAnalysis: AIApplicationAnalysis = {
      ...evaluation,
      githubReport,
      rubricVersion: RUBRIC_VERSION,
      jobRequirementsHash,
      evaluatedAt: new Date(),
    }

    const finalGithubUsername =
      githubReport.githubUsername || extractedGithubUsername || ""

    await Application.findByIdAndUpdate(applicationId, {
      $set: {
        resumeHash: resumeTextHash,
        extractedGithubUsername: finalGithubUsername,
        extractedLinks,
        ocrUsed,
        githubVerification: githubReport,
        matchScore: evaluation.matchScore,
        aiAnalysis,
        aiProcessing: completedProcessing,
      },
    })

    // Create real-time notification for HR user
    await createNotification({
      recipient: hrUserId,
      sender: candidateId,
      message: `AI Scored ${candidateName} for ${jobTitle}: ${evaluation.matchScore}% Match`,
      link: "/hr/applications",
      type: evaluation.matchScore >= 75 ? "success" : "info",
    })

    const completedPayload = {
      applicationId,
      jobId,
      candidateId,
      candidateName,
      jobTitle,
      matchScore: evaluation.matchScore,
      aiProcessing: completedProcessing,
      aiAnalysis,
      githubVerification: githubReport,
    }

    await Promise.all([
      publishUserEvent(hrUserId, {
        type: "AI_PIPELINE_COMPLETED",
        payload: completedPayload,
      }),
      publishUserEvent(candidateId, {
        type: "AI_PIPELINE_COMPLETED",
        payload: completedPayload,
      }),
    ])

    return {
      success: true,
      applicationId,
      matchScore: evaluation.matchScore,
      aiProcessing: completedProcessing,
      aiAnalysis,
      githubVerification: githubReport,
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : "AI evaluation pipeline encountered an unexpected error"

    const failedProcessing: AIProcessingState = {
      status: "FAILED",
      progress: 100,
      error: errorMsg,
      updatedAt: new Date(),
    }

    await Application.findByIdAndUpdate(applicationId, {
      $set: { aiProcessing: failedProcessing },
    }).catch(() => null)

    const failedPayload = {
      applicationId,
      jobId,
      candidateId,
      candidateName,
      jobTitle,
      aiProcessing: failedProcessing,
    }

    await Promise.all([
      publishUserEvent(hrUserId, {
        type: "AI_PIPELINE_FAILED",
        payload: failedPayload,
      }),
      publishUserEvent(candidateId, {
        type: "AI_PIPELINE_FAILED",
        payload: failedPayload,
      }),
    ])

    return {
      success: false,
      applicationId,
      aiProcessing: failedProcessing,
      error: errorMsg,
    }
  }
}
