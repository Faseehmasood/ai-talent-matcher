"use server";
import connectDB from "@/src/lib/db";
import { Job } from "@/src/models/job.model";
import { Application } from "@/src/models/application.model";
import { Interview } from "@/src/models/interview.model";
import { User } from "@/src/models/users.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { unstable_noStore as noStore } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export async function getDashboardStatsAction() {
  noStore();
  
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return { success: false, code: "UNAUTHORIZED" };

    let payload: any;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      return { success: false, code: "TOKEN_EXPIRED" };
    }

    const userId = payload._id as string;
    const role = payload.role as string;

    // ==========================================
    // 1. HR STATS ✅
    // ==========================================
    if (role === "hr") {
      const [totalJobs, totalInterviews, jobIds] = await Promise.all([
        Job.countDocuments({ postedBy: userId }),
        Interview.countDocuments({ interviewer: userId }),
        Job.find({ postedBy: userId }).distinct("_id"),
      ]);

      let totalApplications = 0;
      let chartData: { month: string; applicants: number }[] = [];

      if (totalJobs > 0) {
        // ✅ Applications count aur chart data ek saath
        const [appCount, monthlyData] = await Promise.all([
          Application.countDocuments({ job: { $in: jobIds } }),
          Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
        ]);

        totalApplications = appCount;
        chartData = monthlyData.map((item) => ({
          month: monthNames[item._id - 1],
          applicants: item.count,
        }));
      }

      return {
        success: true,
        stats: { totalJobs, totalApplications, totalInterviews },
        chartData, // ✅ Chart data bhi bhej diya
      };
    }

    // ==========================================
    // 2. ADMIN STATS ✅
    // ==========================================
    if (role === "admin") {
      const [totalUsers, totalJobs, totalApplications] = await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
      ]);

      return {
        success: true,
        stats: { totalUsers, totalJobs, totalApplications },
        chartData: [],
      };
    }

    // ==========================================
    // 3. CANDIDATE STATS ✅
    // ==========================================
    if (role === "candidate") {
      const [totalApplied, shortlisted, interviews] = await Promise.all([
        Application.countDocuments({ candidate: userId }),
        Application.countDocuments({ candidate: userId, status: "shortlisted" }),
        Interview.countDocuments({ candidate: userId }),
      ]);

      return {
        success: true,
        stats: { totalApplied, shortlisted, interviews },
        chartData: [],
      };
    }

    return { success: false, code: "INVALID_ROLE" };

  } catch (error: any) {
    console.error("STATS_FETCH_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}
