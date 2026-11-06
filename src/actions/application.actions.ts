"use server"

import connectDB from "@/src/lib/db"
import { Application } from "@/src/models/application.model"
import { Job } from "@/src/models/job.model"
import { uploadOnCloudinary } from "@/src/utils/cloudinary"
import { connection } from "next/server"
import { revalidatePath } from "next/cache"
import { applicationSchema, validatePdfBuffer } from "@/src/lib/validations"
import { createNotification } from "@/src/actions/notification.actions"
import { verifySession } from "@/src/lib/auth-server"
import { computeResumeSha256 } from "@/src/services/pdf-parser.service"
import { enqueueApplicationAIPipeline } from "@/src/queues/ai-evaluation.queue"
import { runApplicationAIPipeline } from "@/src/services/ai-pipeline.orchestrator"
import { publishUserEvent } from "@/src/lib/sse-bus"
import { AIProcessingState } from "@/types"
import { cleanGithubUsername } from "@/src/services/github-tool.service"

const VALID_APPLICATION_STATUSES = [
  "pending",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
] as const

export async function applyForJobAction(formData: FormData) {
  await connection()
  try {
    const session = await verifySession(["candidate"])
    if (!session.success) {
      return {
        success: false,
        code: session.error,
        message: session.message,
      }
    }

    const jobId = formData.get("jobId") as string
    const coverLetter = (formData.get("coverLetter") as string) || ""
    const resumeFile = formData.get("resume") as File | null

    if (!resumeFile) {
      return { success: false, message: "Resume is required" }
    }
    if (resumeFile.type !== "application/pdf") {
      return { success: false, message: "Only PDF resumes are allowed!" }
    }

    const result = applicationSchema.safeParse({ jobId, coverLetter })
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message }
    }

    const arrayBuffer = await resumeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Verify true PDF magic bytes (%PDF-) and 5MB size limit before network I/O
    const pdfCheck = validatePdfBuffer(buffer, 5 * 1024 * 1024)
    if (!pdfCheck.valid) {
      return { success: false, message: pdfCheck.message }
    }

    await connectDB()
    const job = await Job.findById(jobId)
      .select("title description status postedBy skills")
      .lean()
    if (!job) {
      return { success: false, message: "Job not found" }
    }
    if (job.status !== "active") {
      return {
        success: false,
        message: "This job is no longer accepting applications!",
      }
    }

    const existing = await Application.findOne({
      job: jobId,
      candidate: session.user._id,
    })
      .select("_id")
      .lean()
    if (existing) {
      return {
        success: false,
        message: "You have already applied for this job!",
      }
    }

    const binaryResumeHash = computeResumeSha256(buffer)

    const resumeUrl = await uploadOnCloudinary(buffer, resumeFile.name)
    if (!resumeUrl) {
      return { success: false, message: "Resume upload failed" }
    }

    const initialAiProcessing: AIProcessingState = {
      status: "QUEUED",
      progress: 5,
      cachedHit: false,
      updatedAt: new Date(),
    }

    let createdApplication
    try {
      createdApplication = await Application.create({
        job: jobId,
        candidate: session.user._id,
        resume: resumeUrl,
        coverLetter: result.data.coverLetter || "",
        resumeHash: binaryResumeHash,
        aiProcessing: initialAiProcessing,
      })
    } catch (dbErr: unknown) {
      if (
        typeof dbErr === "object" &&
        dbErr !== null &&
        "code" in dbErr &&
        (dbErr as { code?: number }).code === 11000
      ) {
        return {
          success: false,
          message: "You have already applied for this job!",
        }
      }
      throw dbErr
    }

    const applicationId = createdApplication._id.toString()
    const hrUserId = job.postedBy.toString()

    // Emit immediate QUEUED (5%) SSE event so HR table shows the new application in real time
    await publishUserEvent(hrUserId, {
      type: "APPLICATION_CREATED",
      payload: {
        applicationId,
        jobId,
        candidateId: session.user._id,
        candidateName: session.user.name,
        jobTitle: job.title,
        aiProcessing: initialAiProcessing,
      },
    })

    await createNotification({
      recipient: hrUserId,
      sender: session.user._id,
      message: `New applicant for ${job.title}: ${session.user.name} (AI Evaluation Queued)`,
      link: "/hr/applications",
      type: "info",
    })

    // Trigger non-blocking async 5-stage AI pipeline (BullMQ + in-process serverless fallback)
    await enqueueApplicationAIPipeline(applicationId, {
      pdfBuffer: buffer,
    })

    revalidatePath("/hr/applications")
    revalidatePath("/hr/candidates")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/dashboard")
    revalidatePath("/candidate/applications")

    return {
      success: true,
      message: "Applied successfully! AI evaluation is running in real time.",
      applicationId,
    }
  } catch {
    return { success: false, message: "Server Error" }
  }
}

/**
 * 1-click Server Action allowing HR/Admin to trigger or re-run the 5-stage AI analysis
 * asynchronously (streaming progress via `/api/sse/events`).
 */
export async function retriggerAIAnalysisAction(
  applicationId: string,
  manualGithubHandle?: string
) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return {
        success: false,
        code: session.error,
        message: session.message,
      }
    }

    await connectDB()
    const application = await Application.findById(applicationId)
      .populate("candidate", "name")
      .populate("job", "title postedBy")

    if (!application || !application.job) {
      return { success: false, message: "Application or job not found" }
    }

    const jobDoc = application.job as unknown as {
      _id: { toString(): string }
      title: string
      postedBy: { toString(): string }
    }
    const candidateDoc = application.candidate as unknown as {
      _id: { toString(): string }
      name: string
    }

    if (
      session.user.role !== "admin" &&
      jobDoc.postedBy.toString() !== session.user._id
    ) {
      return {
        success: false,
        message: "Forbidden: You do not own this job pipeline",
      }
    }

    const queuedProcessing: AIProcessingState = {
      status: "QUEUED",
      progress: 5,
      cachedHit: false,
      updatedAt: new Date(),
    }

    application.aiProcessing = queuedProcessing
    const cleanHandle = cleanGithubUsername(manualGithubHandle)
    if (cleanHandle) {
      application.extractedGithubUsername = cleanHandle
    }
    await application.save()

    await publishUserEvent(jobDoc.postedBy.toString(), {
      type: "AI_PIPELINE_PROGRESS",
      payload: {
        applicationId,
        jobId: jobDoc._id.toString(),
        candidateId: candidateDoc._id.toString(),
        candidateName: candidateDoc.name,
        jobTitle: jobDoc.title,
        aiProcessing: queuedProcessing,
      },
    })

    const dispatch = await enqueueApplicationAIPipeline(applicationId, {
      forceRefresh: true,
      manualGithubHandle: cleanHandle || undefined,
    })

    return {
      success: true,
      mode: dispatch.mode,
      aiProcessing: JSON.parse(JSON.stringify(queuedProcessing)),
      message: "AI evaluation pipeline triggered.",
    }
  } catch {
    return {
      success: false,
      message: "Failed to trigger AI evaluation pipeline",
    }
  }
}

/**
 * Executes the 5-stage AI & GitHub verification orchestrator and returns the
 * completed result directly (while also emitting real-time SSE stage events).
 */
export async function verifyCandidateGithubAction(
  applicationId: string,
  manualGithubHandle?: string,
  forceRefreshEval: boolean = true
) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return {
        success: false,
        code: session.error,
        message: session.message,
      }
    }

    await connectDB()
    const application =
      await Application.findById(applicationId).populate("job")
    if (!application || !application.job) {
      return { success: false, message: "Application or job not found" }
    }

    const jobDoc = application.job as unknown as {
      postedBy: { toString(): string }
    }

    if (
      session.user.role !== "admin" &&
      jobDoc.postedBy.toString() !== session.user._id
    ) {
      return {
        success: false,
        message: "Forbidden: You do not own this job pipeline",
      }
    }

    const cleanHandle = cleanGithubUsername(manualGithubHandle)
    const result = await runApplicationAIPipeline(applicationId, {
      forceRefresh: forceRefreshEval,
      manualGithubHandle: cleanHandle || undefined,
    })

    revalidatePath("/hr/applications")
    revalidatePath("/hr/dashboard")

    if (!result.success) {
      return {
        success: false,
        message: result.error || "AI evaluation failed",
        aiProcessing: JSON.parse(JSON.stringify(result.aiProcessing)),
      }
    }

    return {
      success: true,
      matchScore: result.matchScore,
      report: JSON.parse(JSON.stringify(result.githubVerification)),
      aiAnalysis: JSON.parse(JSON.stringify(result.aiAnalysis)),
      aiProcessing: JSON.parse(JSON.stringify(result.aiProcessing)),
    }
  } catch {
    return {
      success: false,
      message: "Failed to run AI scoring & GitHub verification agent",
    }
  }
}

export async function getHRApplicationsAction() {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const filter =
      session.user.role === "admin"
        ? {}
        : {
            job: {
              $in: await Job.find({ postedBy: session.user._id }).distinct(
                "_id"
              ),
            },
          }

    const applications = await Application.find(filter)
      .select(
        "resume coverLetter status matchScore resumeHash extractedGithubUsername extractedLinks ocrUsed githubVerification aiProcessing aiAnalysis createdAt candidate job"
      )
      .populate("candidate", "name email avatar phoneNumber")
      .populate("job", "title company")
      .sort({ matchScore: -1, createdAt: -1 })
      .limit(200)
      .lean()

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(applications)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function updateApplicationStatusAction(
  applicationId: string,
  status: string
) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    if (
      !VALID_APPLICATION_STATUSES.includes(
        status as (typeof VALID_APPLICATION_STATUSES)[number]
      )
    ) {
      return { success: false, code: "INVALID_STATUS" }
    }

    await connectDB()
    const application =
      await Application.findById(applicationId).populate("job")
    if (!application || !application.job) {
      return { success: false, code: "NOT_FOUND" }
    }

    const job = application.job as unknown as {
      _id: string
      title: string
      postedBy: { toString(): string }
    }

    if (
      session.user.role !== "admin" &&
      job.postedBy.toString() !== session.user._id
    ) {
      return { success: false, code: "UNAUTHORIZED" }
    }

    application.status = status as (typeof VALID_APPLICATION_STATUSES)[number]
    await application.save()

    await createNotification({
      recipient: application.candidate.toString(),
      sender: session.user._id,
      message: `Your application for ${job.title} is now: ${status}`,
      link: "/candidate/applications",
      type:
        status === "shortlisted" || status === "hired" ? "success" : "alert",
    })

    revalidatePath("/hr/applications")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/applications")
    revalidatePath("/candidate/dashboard")

    return { success: true }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}
