import crypto from "crypto"
import { getCache, setCache, delCache } from "@/src/lib/redis"
import { ParsedResumeChunk } from "@/src/services/pdf-parser.service"
import { GithubVerificationReport } from "@/src/services/github-verification.agent"
import { AIMatchEvaluation } from "@/types"
import connectDB from "@/src/lib/db"
import { Application } from "@/src/models/application.model"

export const RUBRIC_VERSION = "v1"
export const CACHE_TTL_7_DAYS_SECONDS = 7 * 24 * 60 * 60 // 604,800 seconds (7 days)

export interface Tier1ResumeCacheBundle {
  resumeTextHash: string
  normalizedResumeText: string
  chunks: ParsedResumeChunk[]
  embeddings: number[][]
  extractedLinks: string[]
  extractedGithubUsername: string
  ocrUsed: boolean
  githubReport: GithubVerificationReport
  cachedAt: string
}

/**
 * Normalizes extracted resume text (collapsing whitespace and stripping header prefixes)
 * and computes a deterministic SHA-256 content-addressable digest.
 */
export function computeResumeHash(normalizedResumeText: string): string {
  const canonicalText = (normalizedResumeText || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()

  return crypto.createHash("sha256").update(canonicalText, "utf8").digest("hex")
}

/**
 * Computes a deterministic SHA-256 hash over a job's core evaluation parameters
 * and `RUBRIC_VERSION = "v1"`. Whenever HR edits a job's title, description,
 * or required skills array, this hash changes automatically and invalidates stale Tier 2 scores.
 */
export function computeJobRequirementsHash(job: {
  _id: string
  title: string
  description: string
  skills: string[]
}): string {
  const normalizedSkills = [...(job.skills || [])]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .sort()

  const canonicalPayload = JSON.stringify({
    rubricVersion: RUBRIC_VERSION,
    jobId: String(job._id || "").trim(),
    title: (job.title || "").trim().toLowerCase(),
    description: (job.description || "").replace(/\s+/g, " ").trim().toLowerCase(),
    skills: normalizedSkills,
  })

  return crypto
    .createHash("sha256")
    .update(canonicalPayload, "utf8")
    .digest("hex")
}

/**
 * Formats the Tier 1 content-addressable cache key: `cache:resume:<resumeTextHash>`
 */
export function buildTier1ResumeCacheKey(resumeTextHash: string): string {
  return `cache:resume:${resumeTextHash}`
}

/**
 * Formats the Tier 2 content-addressable cache key: `cache:eval:<resumeTextHash>:<jobRequirementsHash>`
 */
export function buildTier2EvalCacheKey(
  resumeTextHash: string,
  jobRequirementsHash: string
): string {
  return `cache:eval:${resumeTextHash}:${jobRequirementsHash}`
}

/**
 * Retrieves the Tier 1 Resume Bundle (`cache:resume:<resumeTextHash>`) containing
 * parsed resume sections/chunks, 768-d embeddings, and the GithubVerificationReport.
 */
export async function getTier1ResumeCache(
  resumeTextHash: string
): Promise<Tier1ResumeCacheBundle | null> {
  if (!resumeTextHash) return null
  const key = buildTier1ResumeCacheKey(resumeTextHash)
  return await getCache<Tier1ResumeCacheBundle>(key)
}

/**
 * Stores the Tier 1 Resume Bundle (`cache:resume:<resumeTextHash>`) with a 7-day TTL.
 */
export async function setTier1ResumeCache(
  resumeTextHash: string,
  bundle: Tier1ResumeCacheBundle
): Promise<void> {
  if (!resumeTextHash) return
  const key = buildTier1ResumeCacheKey(resumeTextHash)
  await setCache<Tier1ResumeCacheBundle>(key, bundle, CACHE_TTL_7_DAYS_SECONDS)
}

/**
 * Retrieves the Tier 2 Job-Specific Evaluation (`cache:eval:<resumeTextHash>:<jobRequirementsHash>`).
 * Falls back to checking persisted MongoDB Application evaluations if Redis and in-memory
 * caches were cold-started.
 */
export async function getTier2EvaluationCache(
  resumeTextHash: string,
  jobRequirementsHash: string
): Promise<AIMatchEvaluation | null> {
  if (!resumeTextHash || !jobRequirementsHash) return null
  const key = buildTier2EvalCacheKey(resumeTextHash, jobRequirementsHash)

  const cached = await getCache<AIMatchEvaluation>(key)
  if (cached && typeof cached.matchScore === "number") {
    return cached
  }

  // Secondary persistent MongoDB fallback if Redis was offline across a process restart
  try {
    await connectDB()
    const existingApp = await Application.findOne({
      resumeHash: resumeTextHash,
      "aiAnalysis.jobRequirementsHash": jobRequirementsHash,
      "aiAnalysis.rubricVersion": RUBRIC_VERSION,
      "aiProcessing.status": "COMPLETED",
    })
      .select("aiAnalysis")
      .lean()

    if (existingApp?.aiAnalysis && typeof existingApp.aiAnalysis.matchScore === "number") {
      const recovered: AIMatchEvaluation = {
        matchScore: existingApp.aiAnalysis.matchScore,
        skillsMatchScore: existingApp.aiAnalysis.skillsMatchScore,
        experienceRelevanceScore: existingApp.aiAnalysis.experienceRelevanceScore,
        githubVerificationScore: existingApp.aiAnalysis.githubVerificationScore,
        educationDomainScore: existingApp.aiAnalysis.educationDomainScore,
        matchedSkills: existingApp.aiAnalysis.matchedSkills || [],
        missingCriticalSkills: existingApp.aiAnalysis.missingCriticalSkills || [],
        experienceAnalysis: existingApp.aiAnalysis.experienceAnalysis,
        strengths: existingApp.aiAnalysis.strengths || [],
        redFlags: existingApp.aiAnalysis.redFlags || [],
        executiveSummary: existingApp.aiAnalysis.executiveSummary,
        suggestedInterviewQuestions:
          existingApp.aiAnalysis.suggestedInterviewQuestions || [],
      }

      await setCache<AIMatchEvaluation>(key, recovered, CACHE_TTL_7_DAYS_SECONDS)
      return recovered
    }
  } catch {
    // Non-blocking fallback
  }

  return null
}

/**
 * Stores the Tier 2 Job-Specific Evaluation (`cache:eval:<resumeTextHash>:<jobRequirementsHash>`)
 * with a 7-day TTL.
 */
export async function setTier2EvaluationCache(
  resumeTextHash: string,
  jobRequirementsHash: string,
  evaluation: AIMatchEvaluation
): Promise<void> {
  if (!resumeTextHash || !jobRequirementsHash) return
  const key = buildTier2EvalCacheKey(resumeTextHash, jobRequirementsHash)
  await setCache<AIMatchEvaluation>(key, evaluation, CACHE_TTL_7_DAYS_SECONDS)
}

/**
 * Explicitly invalidates a Tier 2 evaluation entry when HR forces a manual re-evaluation.
 */
export async function invalidateTier2EvaluationCache(
  resumeTextHash: string,
  jobRequirementsHash: string
): Promise<void> {
  if (!resumeTextHash || !jobRequirementsHash) return
  const key = buildTier2EvalCacheKey(resumeTextHash, jobRequirementsHash)
  await delCache(key)
}
