import { GoogleGenAI } from "@google/genai"

export const EMBEDDING_MODEL_VERSION = "text-embedding-004"
export const EMBEDDING_DIMENSIONS = 768
export const FAST_GENERATION_MODEL = "gemini-2.5-flash"

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"

declare global {
  var __genAIClient: GoogleGenAI | undefined
}

/**
 * Returns a singleton instance of the official @google/genai SDK client.
 */
export function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables")
  }

  if (!global.__genAIClient) {
    global.__genAIClient = new GoogleGenAI({ apiKey })
  }

  return global.__genAIClient
}

/**
 * L2-normalizes a vector v in R^d so that ||v||_2 = 1.
 * When two vectors u and v have unit L2 norm, their dot product u . v
 * equals their exact Cosine Similarity while executing ~30% faster in MongoDB HNSW.
 */
export function normalizeL2(vector: number[]): number[] {
  let sumSquares = 0
  for (let i = 0; i < vector.length; i++) {
    sumSquares += vector[i] * vector[i]
  }
  const norm = Math.sqrt(sumSquares)
  if (norm === 0 || !Number.isFinite(norm)) {
    return vector.map(() => 0)
  }
  // If already unit-normalized within floating-point tolerance, return as-is
  if (Math.abs(norm - 1.0) < 1e-6) {
    return vector
  }
  return vector.map((val) => val / norm)
}

/**
 * Computes the exact dot product u . v between two equal-length vectors.
 */
export function dotProductSimilarity(vecA: number[], vecB: number[]): number {
  const len = Math.min(vecA.length, vecB.length)
  if (len === 0) return 0
  let dot = 0
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i]
  }
  return dot
}

function isRetryableGenAIError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const errObj = error as { status?: number; code?: number; message?: string }
  const status = errObj.status || errObj.code
  if (status === 429 || status === 503 || status === 502 || status === 504) {
    return true
  }
  const msg = (errObj.message || "").toLowerCase()
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("overloaded") ||
    msg.includes("fetch failed")
  )
}

/**
 * Executes an async operation with a strict AbortController timeout and
 * exponential backoff with full jitter for 429/503 transient errors.
 */
export async function withRetryAndTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: { timeoutMs?: number; maxRetries?: number } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15000
  const maxRetries = options.maxRetries ?? 3

  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const result = await operation(controller.signal)
      clearTimeout(timer)
      return result
    } catch (error) {
      clearTimeout(timer)
      lastError = error

      if (attempt < maxRetries && isRetryableGenAIError(error)) {
        const baseDelayMs = 1000 * Math.pow(2, attempt)
        const jitterMs = Math.floor(Math.random() * 400)
        await new Promise((resolve) =>
          setTimeout(resolve, baseDelayMs + jitterMs)
        )
        continue
      }
      throw error
    }
  }

  throw lastError
}

/**
 * Embeds one or more text chunks into 768-dimensional L2-normalized vectors
 * using Google's text-embedding-004 model.
 */
export async function embedTextChunks(
  texts: string[],
  taskType: EmbeddingTaskType
): Promise<number[][]> {
  const sanitizedTexts = texts.map((t) => t.trim()).filter(Boolean)
  if (sanitizedTexts.length === 0) {
    return []
  }

  const ai = getGenAIClient()

  return await withRetryAndTimeout(
    async (signal) => {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL_VERSION,
        contents: sanitizedTexts,
        config: {
          taskType,
          outputDimensionality: EMBEDDING_DIMENSIONS,
          abortSignal: signal,
        },
      })

      const embeddingsList = response.embeddings
      if (!embeddingsList || embeddingsList.length !== sanitizedTexts.length) {
        throw new Error(
          `Embedding count mismatch: expected ${sanitizedTexts.length}, got ${
            embeddingsList?.length ?? 0
          }`
        )
      }

      return embeddingsList.map((entry, idx) => {
        const values = entry.values
        if (!values || values.length !== EMBEDDING_DIMENSIONS) {
          throw new Error(
            `Invalid embedding dimensions at index ${idx}: expected ${EMBEDDING_DIMENSIONS}, got ${
              values?.length ?? 0
            }`
          )
        }
        return normalizeL2(values)
      })
    },
    { timeoutMs: 15000, maxRetries: 3 }
  )
}
