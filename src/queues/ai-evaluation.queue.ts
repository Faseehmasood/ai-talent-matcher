import { Queue } from "bullmq"
import { after } from "next/server"
import { getRedisClient, isRedisHealthy } from "@/src/lib/redis"
import {
  runApplicationAIPipeline,
  RunAIPipelineOptions,
} from "@/src/services/ai-pipeline.orchestrator"

export const AI_EVALUATION_QUEUE_NAME = "ai-candidate-evaluation"

export interface AIEvaluationJobData {
  applicationId: string
  forceRefresh?: boolean
  manualGithubHandle?: string
}

declare global {
  var __aiEvaluationQueue: Queue<AIEvaluationJobData> | null | undefined
}

/**
 * Returns the singleton BullMQ Queue (`ai-candidate-evaluation`) if `REDIS_URL`
 * is configured and reachable, or `null` when operating in serverless/in-memory mode.
 */
export function getAIEvaluationQueue(): Queue<AIEvaluationJobData> | null {
  if (global.__aiEvaluationQueue) {
    return global.__aiEvaluationQueue
  }

  const redisClient = getRedisClient()
  if (!redisClient) {
    return null
  }

  try {
    const queue = new Queue<AIEvaluationJobData>(AI_EVALUATION_QUEUE_NAME, {
      connection: redisClient as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 500,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
          count: 1000,
        },
      },
    })

    queue.on("error", () => {
      // Prevent unhandled queue error events from crashing Next.js
    })

    global.__aiEvaluationQueue = queue
    return queue
  } catch {
    global.__aiEvaluationQueue = null
    return null
  }
}

/**
 * Schedules `runApplicationAIPipeline` asynchronously in the background using Next.js `after()`
 * (with a safe timer fallback when invoked outside a Next.js request scope).
 */
function scheduleInProcessBackgroundPipeline(
  applicationId: string,
  options: RunAIPipelineOptions
): void {
  const executeTask = () => {
    void runApplicationAIPipeline(applicationId, options).catch(() => null)
  }

  try {
    after(executeTask)
  } catch {
    setTimeout(executeTask, 15)
  }
}

/**
 * Enqueues an application for 5-stage AI evaluation:
 * - If Redis is healthy AND at least 1 BullMQ worker is actively listening on
 *   `ai-candidate-evaluation`, dispatches to BullMQ.
 * - Otherwise, automatically triggers `runApplicationAIPipeline(applicationId)`
 *   asynchronously in the background (`after()` / `void runApplicationAIPipeline(...)`)
 *   so single-terminal `npm run dev` and Vercel Serverless work 100% out-of-the-box.
 */
export async function enqueueApplicationAIPipeline(
  applicationId: string,
  options: RunAIPipelineOptions = {}
): Promise<{ mode: "bullmq" | "in_process_async" }> {
  const queue = getAIEvaluationQueue()

  if (queue && isRedisHealthy()) {
    try {
      const activeWorkers = await Promise.race([
        queue.getWorkersCount(),
        new Promise<number>((resolve) => setTimeout(() => resolve(0), 800)),
      ])

      if (activeWorkers > 0) {
        const deduplicationJobId = options.forceRefresh
          ? `eval:${applicationId}:${Date.now()}`
          : `eval:${applicationId}`

        await queue.add(
          "evaluate-application",
          {
            applicationId,
            forceRefresh: options.forceRefresh,
            manualGithubHandle: options.manualGithubHandle,
          },
          {
            jobId: deduplicationJobId,
          }
        )

        return { mode: "bullmq" }
      }
    } catch {
      // Fall through to in-process async execution
    }
  }

  scheduleInProcessBackgroundPipeline(applicationId, options)
  return { mode: "in_process_async" }
}
