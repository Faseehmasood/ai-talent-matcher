"use server"

import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { Application } from "@/src/models/application.model"
import { ResumeChunk } from "@/src/models/resume-chunk.model"
import { connection } from "next/server"
import { verifySession } from "@/src/lib/auth-server"
import { hybridCandidateSearch } from "@/src/services/hybrid-search.service"

export async function getAllCandidatesAction(
  searchQuery: string = "",
  fetchArchived: boolean = false,
  jobId?: string
) {
  await connection()

  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()

    const trimmedQuery = searchQuery.trim()

    // 1. If HR entered a search query, execute Hybrid RAG ($vectorSearch + BM25 + RRF k=60)
    if (trimmedQuery) {
      const hybridResult = await hybridCandidateSearch({
        query: trimmedQuery,
        jobId,
        fetchArchived,
        limit: 60,
      })

      if (hybridResult.orderedCandidateIds.length === 0) {
        return {
          success: true,
          candidates: [],
          searchMode: hybridResult.searchMode,
        }
      }

      const users = await User.find({
        _id: { $in: hybridResult.orderedCandidateIds },
        role: "candidate",
        isActive: fetchArchived ? false : true,
      })
        .select("-password -refreshToken")
        .lean()

      const userById = new Map(users.map((u) => [u._id.toString(), u]))

      const enrichedCandidates = hybridResult.orderedCandidateIds
        .map((cid) => {
          const userDoc = userById.get(cid)
          if (!userDoc) return null
          const ragMatch = hybridResult.matches.get(cid)
          return {
            ...userDoc,
            _id: userDoc._id.toString(),
            extractedGithubUsername: ragMatch?.extractedGithubUsername || "",
            ragMatch: ragMatch
              ? {
                  semanticSimilarityPercent: ragMatch.semanticSimilarityPercent,
                  rrfScore: ragMatch.rrfScore,
                  matchedSection: ragMatch.matchedSection,
                  matchedSnippet: ragMatch.matchedSnippet,
                  matchedKeywords: ragMatch.matchedKeywords,
                }
              : null,
          }
        })
        .filter(Boolean)

      return {
        success: true,
        candidates: JSON.parse(JSON.stringify(enrichedCandidates)),
        searchMode: hybridResult.searchMode,
      }
    }

    // 2. Default pipeline view (no active search query): list active/archived candidates + resume metadata
    const candidates = await User.find({
      role: "candidate",
      isActive: fetchArchived ? false : true,
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const candidateIds = candidates.map((c) => c._id)
    const chunkMeta = await ResumeChunk.aggregate([
      { $match: { candidateId: { $in: candidateIds } } },
      {
        $group: {
          _id: "$candidateId",
          chunkCount: { $sum: 1 },
          githubUsername: { $first: "$extractedGithubUsername" },
        },
      },
    ]).catch(() => [])

    const metaMap = new Map<
      string,
      { chunkCount: number; githubUsername?: string }
    >()
    for (const item of chunkMeta) {
      metaMap.set(item._id.toString(), {
        chunkCount: item.chunkCount || 0,
        githubUsername: item.githubUsername || "",
      })
    }

    const enrichedDefault = candidates.map((c) => {
      const meta = metaMap.get(c._id.toString())
      return {
        ...c,
        _id: c._id.toString(),
        resumeChunksIndexed: meta?.chunkCount || 0,
        extractedGithubUsername: meta?.githubUsername || "",
        ragMatch: null,
      }
    })

    return {
      success: true,
      candidates: JSON.parse(JSON.stringify(enrichedDefault)),
      searchMode: "default",
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function getMyApplicationsAction() {
  await connection()

  try {
    const session = await verifySession(["candidate"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const applications = await Application.find({
      candidate: session.user._id,
    })
      .populate(
        "job",
        "title company location salary jobType status skills description createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    // Filter out any orphaned application whose job was deleted prior to cascade hooks
    const validApplications = applications.filter((app) => Boolean(app.job))

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(validApplications)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}
