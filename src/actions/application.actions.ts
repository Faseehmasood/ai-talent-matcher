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
    const job = await Job.findById(jobId).select("title status postedBy").lean()
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

    const resumeUrl = await uploadOnCloudinary(buffer, resumeFile.name)
    if (!resumeUrl) {
      return { success: false, message: "Resume upload failed" }
    }

    try {
      await Application.create({
        job: jobId,
        candidate: session.user._id,
        resume: resumeUrl,
        coverLetter: result.data.coverLetter || "",
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

    await createNotification({
      recipient: job.postedBy.toString(),
      sender: session.user._id,
      message: `New applicant for ${job.title}`,
      link: "/hr/applications",
      type: "info",
    })

    revalidatePath("/hr/applications")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/dashboard")
    revalidatePath("/candidate/applications")

    return { success: true, message: "Applied successfully!" }
  } catch {
    return { success: false, message: "Server Error" }
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
    const myJobIds = await Job.find({ postedBy: session.user._id }).distinct(
      "_id"
    )
    if (myJobIds.length === 0) {
      return { success: true, applications: [] }
    }

    const applications = await Application.find({ job: { $in: myJobIds } })
      .select("resume coverLetter status matchScore createdAt candidate job")
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
