"use server"

import connectDB from "@/src/lib/db"
import { Interview } from "@/src/models/interview.model"
import { Application } from "@/src/models/application.model"
import { connection } from "next/server"
import { revalidatePath } from "next/cache"
import { interviewSchema, InterviewInput } from "@/src/lib/validations"
import { createNotification } from "@/src/actions/notification.actions"
import { verifySession } from "@/src/lib/auth-server"

const VALID_INTERVIEW_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
] as const

export async function getMyScheduleAction() {
  await connection()
  try {
    const session = await verifySession(["hr", "candidate", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const queryFilter =
      session.user.role === "hr"
        ? { interviewer: session.user._id }
        : { candidate: session.user._id }

    const interviews = await Interview.find(queryFilter)
      .populate("candidate", "name email avatar phoneNumber")
      .populate("interviewer", "name email avatar")
      .populate("job", "title company")
      .sort({ interviewDate: 1, startTime: 1 })
      .limit(100)
      .lean()

    return {
      success: true,
      interviews: JSON.parse(JSON.stringify(interviews)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function createInterviewAction(interviewData: InterviewInput) {
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

    const result = interviewSchema.safeParse(interviewData)
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message }
    }

    await connectDB()
    const interview = await Interview.create({
      job: result.data.jobId,
      candidate: result.data.candidateId,
      interviewer: session.user._id,
      interviewDate: result.data.interviewDate,
      startTime: result.data.startTime,
      endTime: result.data.endTime,
      type: result.data.type,
      location: result.data.location,
      notes: result.data.notes,
    })

    if (!interview) {
      return { success: false, message: "Interview create failed" }
    }

    await Application.findOneAndUpdate(
      { job: result.data.jobId, candidate: result.data.candidateId },
      { $set: { status: "shortlisted" } }
    )

    await createNotification({
      recipient: result.data.candidateId,
      sender: session.user._id,
      message: `Interview scheduled: ${result.data.startTime} on ${new Date(
        result.data.interviewDate
      ).toLocaleDateString()}`,
      link: "/candidate/schedule",
      type: "success",
    })

    revalidatePath("/hr/schedule")
    revalidatePath("/hr/dashboard")
    revalidatePath("/hr/applications")
    revalidatePath("/candidate/schedule")
    revalidatePath("/candidate/dashboard")

    return {
      success: true,
      message: "Interview scheduled & Candidate notified!",
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function updateInterviewStatusAction(
  interviewId: string,
  status: string
) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    if (
      !VALID_INTERVIEW_STATUSES.includes(
        status as (typeof VALID_INTERVIEW_STATUSES)[number]
      )
    ) {
      return { success: false, code: "INVALID_STATUS" }
    }

    await connectDB()
    const updated = await Interview.findOneAndUpdate(
      { _id: interviewId, interviewer: session.user._id },
      { $set: { status } },
      { new: true }
    ).populate("job")

    if (!updated) {
      return { success: false, code: "NOT_FOUND" }
    }

    const jobTitle =
      (updated.job as unknown as { title?: string })?.title || "the role"
    let notificationMessage = ""
    let notificationType: "info" | "success" | "warning" | "alert" = "info"

    if (status === "cancelled") {
      notificationMessage = `Your interview for ${jobTitle} has been cancelled. HR will contact you soon.`
      notificationType = "alert"
    } else if (status === "completed") {
      notificationMessage = `Your interview for ${jobTitle} is completed. Check back for updates!`
      notificationType = "success"
    } else {
      notificationMessage = `Your interview for ${jobTitle} status updated to: ${status}`
      notificationType = "info"
    }

    await createNotification({
      recipient: updated.candidate.toString(),
      sender: session.user._id,
      message: notificationMessage,
      link: "/candidate/schedule",
      type: notificationType,
    })

    revalidatePath("/hr/schedule")
    revalidatePath("/candidate/schedule")
    revalidatePath("/candidate/dashboard")

    return { success: true }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function deleteInterviewAction(interviewId: string) {
  await connection()
  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const deleted = await Interview.findOneAndDelete({
      _id: interviewId,
      interviewer: session.user._id,
    })

    if (!deleted) {
      return { success: false, code: "NOT_FOUND" }
    }

    await createNotification({
      recipient: deleted.candidate.toString(),
      sender: session.user._id,
      message: "Your scheduled interview has been cancelled by HR.",
      link: "/candidate/schedule",
      type: "alert",
    })

    revalidatePath("/hr/schedule")
    revalidatePath("/hr/dashboard")
    revalidatePath("/candidate/schedule")
    revalidatePath("/candidate/dashboard")

    return { success: true }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}
