"use server"

import connectDB from "@/src/lib/db"
import { Job } from "@/src/models/job.model"
import { Application } from "@/src/models/application.model"
import { Interview } from "@/src/models/interview.model"
import { User } from "@/src/models/users.model"
import { connection } from "next/server"
import { revalidatePath } from "next/cache"
import {
  createJobSchema,
  updateJobSchema,
  CreateJobInput,
  UpdateJobInput,
  escapeRegex,
} from "@/src/lib/validations"
import { createNotification } from "@/src/actions/notification.actions"
import { verifySession } from "@/src/lib/auth-server"

export async function getMyJobsAction() {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const jobs = await Job.find({ postedBy: session.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function deleteJobAction(jobId: string) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const deletedJob = await Job.findOneAndDelete({
      _id: jobId,
      postedBy: session.user._id,
    })

    if (!deletedJob) {
      return { success: false, code: "NOT_FOUND" }
    }

    // Cascade delete associated applications and interviews to prevent null-reference UI crashes
    await Promise.all([
      Application.deleteMany({ job: jobId }),
      Interview.deleteMany({ job: jobId }),
    ])

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    revalidatePath("/hr/applications")
    revalidatePath("/candidate/jobs")
    revalidatePath("/candidate/applications")
    return { success: true }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function createJobAction(jobData: CreateJobInput) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error, message: session.message }
    }

    const result = createJobSchema.safeParse(jobData)
    if (!result.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: result.error.issues[0].message,
      }
    }

    await connectDB()
    const newJob = await Job.create({
      ...result.data,
      postedBy: session.user._id,
      status: result.data.status || "active",
    })

    const admin = await User.findOne({ role: "admin" }).select("_id").lean()
    if (admin) {
      await createNotification({
        recipient: admin._id.toString(),
        sender: session.user._id,
        message: `New Job Posted: "${newJob.title}" by ${session.user.name}`,
        link: "/admin/jobs",
        type: "info",
      })
    }

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/jobs")
    revalidatePath("/jobs")
    return { success: true, job: JSON.parse(JSON.stringify(newJob)) }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function updateJobAction(jobId: string, updates: UpdateJobInput) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error, message: session.message }
    }

    const result = updateJobSchema.safeParse(updates)
    if (!result.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: result.error.issues[0].message,
      }
    }

    await connectDB()
    const filter =
      session.user.role === "admin"
        ? { _id: jobId }
        : { _id: jobId, postedBy: session.user._id }

    const updatedJob = await Job.findOneAndUpdate(
      filter,
      { $set: result.data },
      { new: true }
    ).lean()

    if (!updatedJob) {
      return {
        success: false,
        code: "NOT_FOUND_OR_UNAUTHORIZED",
        message: "Job not found or unauthorized",
      }
    }

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/jobs")
    revalidatePath("/jobs")
    return { success: true, job: JSON.parse(JSON.stringify(updatedJob)) }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function getAllActiveJobsAction(
  searchQuery: string = "",
  jobTypeFilter: string = "all"
) {
  await connection()
  try {
    await connectDB()

    const filter: Record<string, unknown> = { status: "active" }
    if (jobTypeFilter && jobTypeFilter !== "all") {
      filter.jobType = jobTypeFilter.toLowerCase()
    }

    const trimmed = searchQuery.trim()
    if (trimmed) {
      const safeRegex = escapeRegex(trimmed)
      filter.$or = [
        { title: { $regex: safeRegex, $options: "i" } },
        { company: { $regex: safeRegex, $options: "i" } },
        { location: { $regex: safeRegex, $options: "i" } },
        { skills: { $regex: safeRegex, $options: "i" } },
      ]
    }

    const jobs = await Job.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR", jobs: [] }
  }
}

export async function getAllPlatformJobsAction() {
  await connection()
  try {
    const session = await verifySession(["admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const jobs = await Job.find({})
      .populate("postedBy", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function adminDeleteJobAction(jobId: string, reason: string) {
  await connection()
  try {
    const session = await verifySession(["admin"])
    if (!session.success) {
      return { success: false, message: "Forbidden" }
    }

    await connectDB()
    const job = await Job.findById(jobId)
    if (!job) {
      return { success: false, message: "Job not found" }
    }

    const hrId = job.postedBy.toString()
    const jobTitle = job.title

    await Promise.all([
      Job.findByIdAndDelete(jobId),
      Application.deleteMany({ job: jobId }),
      Interview.deleteMany({ job: jobId }),
    ])

    await createNotification({
      recipient: hrId,
      sender: session.user._id,
      message: `Your job "${jobTitle}" was removed by Admin. Reason: ${reason}`,
      link: "/hr/jobs",
      type: "alert",
    })

    revalidatePath("/admin/jobs")
    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/jobs")

    return { success: true, message: "Job deleted and HR notified!" }
  } catch {
    return { success: false, message: "Server Error" }
  }
}

export async function getPublicJobsAction() {
  try {
    await connectDB()
    const jobs = await Job.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs)),
    }
  } catch {
    return { success: false, jobs: [] }
  }
}
