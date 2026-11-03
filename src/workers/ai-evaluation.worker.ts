import { Worker, Job as BullJob } from "bullmq"
import Redis from "ioredis"
import {
  AI_EVALUATION_QUEUE_NAME,
  AIEvaluationJobData,
} from "@/src/queues/ai-evaluation.queue"
import { runApplicationAIPipeline } from "@/src/services/ai-pipeline.orchestrator"

const redisUrl = process.env.REDIS_URL?.trim() || "redis://127.0.0.1:6379"

const workerConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
})

workerConnection.on("error", (err) => {
  process.stderr.write(`[BullMQ Worker] Redis error: ${err.message}\n`)
})

/**
 * Dedicated BullMQ Worker processing `ai-candidate-evaluation` jobs with
 * concurrency: 5 and lockDuration: 90000ms (90s) to cover PDF OCR + GitHub API + Gemini calls.
 */
export const aiEvaluationWorker = new Worker<AIEvaluationJobData>(
  AI_EVALUATION_QUEUE_NAME,
  async (job: BullJob<AIEvaluationJobData>) => {
    const { applicationId, forceRefresh, manualGithubHandle } = job.data

    const result = await runApplicationAIPipeline(applicationId, {
      forceRefresh,
      manualGithubHandle,
    })

    if (!result.success) {
      throw new Error(
        result.error || `AI pipeline failed for application ${applicationId}`
      )
    }

    return {
      applicationId,
      matchScore: result.matchScore,
      status: result.aiProcessing.status,
    }
  },
  {
    connection: workerConnection as any,
    concurrency: 5,
    lockDuration: 90000,
  }
)

aiEvaluationWorker.on("completed", (job, returnValue) => {
  process.stdout.write(
    `[BullMQ Worker] Completed job ${job.id} (Application: ${
      returnValue?.applicationId
    }, Score: ${returnValue?.matchScore ?? "N/A"})\n`
  )
})

aiEvaluationWorker.on("failed", (job, err) => {
  process.stderr.write(
    `[BullMQ Worker] Failed job ${job?.id}: ${err.message}\n`
  )
})

const gracefulShutdown = async () => {
  process.stdout.write("[BullMQ Worker] Gracefully shutting down...\n")
  await aiEvaluationWorker.close()
  await workerConnection.quit()
  process.exit(0)
}

process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)
