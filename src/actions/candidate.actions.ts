"use server"

import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { Application } from "@/src/models/application.model"
import { connection } from "next/server"
import { verifySession } from "@/src/lib/auth-server"
import { escapeRegex } from "@/src/lib/validations"

export async function getAllCandidatesAction(
  searchQuery: string = "",
  fetchArchived: boolean = false
) {
  await connection()

  try {
    const session = await verifySession(["hr", "admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()

    const queryFilter: Record<string, unknown> = {
      role: "candidate",
      isActive: fetchArchived ? false : true,
    }

    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      const safePattern = escapeRegex(trimmedQuery)
      queryFilter.$or = [
        { name: { $regex: safePattern, $options: "i" } },
        { skills: { $regex: safePattern, $options: "i" } },
      ]
    }

    const candidates = await User.find(queryFilter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    return {
      success: true,
      candidates: JSON.parse(JSON.stringify(candidates)),
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
      .populate("job", "title company location salary jobType status skills description createdAt")
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
