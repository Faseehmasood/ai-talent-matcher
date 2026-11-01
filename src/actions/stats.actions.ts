"use server"

import connectDB from "@/src/lib/db"
import { Job } from "@/src/models/job.model"
import { Application } from "@/src/models/application.model"
import { Interview } from "@/src/models/interview.model"
import { User } from "@/src/models/users.model"
import { connection } from "next/server"
import { verifySession } from "@/src/lib/auth-server"
import mongoose from "mongoose"

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function getCurrentYearBounds() {
  const currentYear = new Date().getFullYear()
  return {
    startOfYear: new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0)),
    endOfYear: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)),
  }
}

export async function getDashboardStatsAction() {
  await connection()
  try {
    const session = await verifySession()
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const userId = session.user._id
    const role = session.user.role
    const { startOfYear, endOfYear } = getCurrentYearBounds()

    if (role === "admin") {
      const [totalUsers, totalJobs, totalApplications, monthlyApps, recentApps] =
        await Promise.all([
          User.countDocuments(),
          Job.countDocuments(),
          Application.countDocuments(),
          Application.aggregate([
            {
              $match: {
                createdAt: { $gte: startOfYear, $lte: endOfYear },
              },
            },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
          Application.find({})
            .populate("candidate", "name email avatar phoneNumber")
            .populate("job", "title")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ])

      const chartData = monthlyApps.map((item) => ({
        month: MONTH_NAMES[item._id - 1],
        applicants: item.count,
      }))

      return {
        success: true,
        stats: { totalUsers, totalJobs, totalApplications },
        chartData,
        recentApplications: JSON.parse(
          JSON.stringify(recentApps.filter((a) => Boolean(a.job)))
        ),
      }
    }

    if (role === "hr") {
      const [totalJobs, totalInterviews, myJobIds] = await Promise.all([
        Job.countDocuments({ postedBy: userId }),
        Interview.countDocuments({ interviewer: userId }),
        Job.find({ postedBy: userId }).distinct("_id"),
      ])

      let totalApplications = 0
      let monthlyApps: { _id: number; count: number }[] = []
      let recentApps: unknown[] = []

      if (myJobIds.length > 0) {
        const [appCount, aggregation, recentData] = await Promise.all([
          Application.countDocuments({ job: { $in: myJobIds } }),
          Application.aggregate([
            {
              $match: {
                job: { $in: myJobIds },
                createdAt: { $gte: startOfYear, $lte: endOfYear },
              },
            },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
          Application.find({ job: { $in: myJobIds } })
            .populate("candidate", "name email avatar phoneNumber")
            .populate("job", "title")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ])
        totalApplications = appCount
        monthlyApps = aggregation
        recentApps = recentData
      }

      const chartData = monthlyApps.map((item) => ({
        month: MONTH_NAMES[item._id - 1],
        applicants: item.count,
      }))

      return {
        success: true,
        stats: { totalJobs, totalApplications, totalInterviews },
        chartData,
        recentApplications: JSON.parse(JSON.stringify(recentApps)),
      }
    }

    if (role === "candidate") {
      const candidateObjectId = new mongoose.Types.ObjectId(userId)
      const [statusBuckets, interviews, recentApps] = await Promise.all([
        Application.aggregate([
          { $match: { candidate: candidateObjectId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Interview.countDocuments({ candidate: userId }),
        Application.find({ candidate: userId })
          .populate("job", "title company location jobType status")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ])

      const countsByStatus: Record<string, number> = {}
      let totalApplied = 0
      for (const bucket of statusBuckets) {
        countsByStatus[bucket._id] = bucket.count
        totalApplied += bucket.count
      }

      return {
        success: true,
        stats: {
          totalApplied,
          shortlisted: countsByStatus["shortlisted"] || 0,
          pending: countsByStatus["pending"] || 0,
          rejected: countsByStatus["rejected"] || 0,
          interviews,
        },
        recentApplications: JSON.parse(
          JSON.stringify(recentApps.filter((a) => Boolean(a.job)))
        ),
      }
    }

    return { success: false, code: "INVALID_ROLE" }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function getAdminAnalyticsAction() {
  await connection()
  try {
    const session = await verifySession(["admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const { startOfYear, endOfYear } = getCurrentYearBounds()

    const [userGrowth, jobGrowth, userDistribution] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Job.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ])

    const growthData = MONTH_NAMES.map((name, index) => {
      const u = userGrowth.find((item) => item._id === index + 1)
      const j = jobGrowth.find((item) => item._id === index + 1)
      return {
        month: name,
        users: u ? u.count : 0,
        jobs: j ? j.count : 0,
      }
    })

    return {
      success: true,
      growthData,
      distributionData: userDistribution.map((item) => ({
        name: item._id,
        value: item.count,
      })),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}
