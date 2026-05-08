"use server";

import connectDB from "@/src/lib/db";
import { Job } from "@/src/models/job.model";
import { Application } from "@/src/models/application.model";
import { Interview } from "@/src/models/interview.model";
import { User } from "@/src/models/users.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";

//  Environment Safety Check 
const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);

//  PRIVATE HELPER: Token Verification

async function verifyToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) return { payload: null, error: "UNAUTHORIZED" };

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { payload, error: null };
  } catch {
    return { payload: null, error: "TOKEN_EXPIRED" };
  }
}

// 1. GET DASHBOARD STATS (Universal - HR/Admin/Candidate)  

export async function getDashboardStatsAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();

    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const userId = payload._id as string;
    const role = payload.role as string;

    // --- Admin Logic ---
    if (role === "admin") {
      const [totalUsers, totalJobs, totalApplications] = await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments()
      ]);
      return { success: true, stats: { totalUsers, totalJobs, totalApplications } };
    }

    // --- HR Logic ---
    if (role === "hr") {
      const [totalJobs, totalInterviews, myJobIds] = await Promise.all([
        Job.countDocuments({ postedBy: userId }),
        Interview.countDocuments({ interviewer: userId }),
        Job.find({ postedBy: userId }).distinct("_id")
      ]);

      let totalApplications = 0;
      let monthlyApps: any[] = [];
      let recentApps: any[] = [];

      if (myJobIds.length > 0) {
        const [appCount, aggregation, recentData] = await Promise.all([
          Application.countDocuments({ job: { $in: myJobIds } }),
          Application.aggregate([
            { $match: { job: { $in: myJobIds } } },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
          ]),
          Application.find({ job: { $in: myJobIds } })
            .populate("candidate", "name email avatar phoneNumber")
            .populate("job", "title")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
        ]);
        totalApplications = appCount;
        monthlyApps = aggregation;
        recentApps = recentData;
      }

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartData = monthlyApps.map(item => ({
        month: monthNames[item._id - 1],
        applicants: item.count
      }));

      return {
        success: true,
        stats: { totalJobs, totalApplications, totalInterviews },
        chartData,
        recentApplications: JSON.parse(JSON.stringify(recentApps))
      };
    }

    // --- Candidate Logic ---
    if (role === "candidate") {
      const [totalApplied, shortlisted, pending, rejected] = await Promise.all([
        Application.countDocuments({ candidate: userId }),
        Application.countDocuments({ candidate: userId, status: "shortlisted" }),
        Application.countDocuments({ candidate: userId, status: "pending" }),
        Application.countDocuments({ candidate: userId, status: "rejected" }),
      ]);
      return { success: true, stats: { totalApplied, shortlisted, pending, rejected } };
    }

    return { success: false, code: "INVALID_ROLE" };

  } catch (error: any) {
    console.error("STATS_FETCH_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}

// 2. GET ADMIN ANALYTICS (Deep Platform Insights)  

export async function getAdminAnalyticsAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();

    if (error || !payload || payload.role !== "admin") {
      return { success: false, code: "FORBIDDEN" };
    }

    //  Parallel Aggregation: Growth + Distribution
    const [userGrowth, jobGrowth, userDistribution] = await Promise.all([
      User.aggregate([
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
      ]),
      Job.aggregate([
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ])
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Formatting monthly data (filling gaps with 0)
    const growthData = monthNames.map((name, index) => {
      const u = userGrowth.find(item => item._id === index + 1);
      const j = jobGrowth.find(item => item._id === index + 1);
      return {
        month: name,
        users: u ? u.count : 0,
        jobs: j ? j.count : 0
      };
    });

    return {
      success: true,
      growthData,
      distributionData: userDistribution.map(item => ({ name: item._id, value: item.count }))
    };

  } catch (error: any) {
    console.error("ADMIN_ANALYTICS_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}