"use server";
import connectDB from "@/src/lib/db";
import { Job } from "@/src/models/job.model";
import { Application } from "@/src/models/application.model";
import { Interview } from "@/src/models/interview.model";
import { User } from "@/src/models/users.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { unstable_noStore as noStore} from "next/cache"

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

    
    // 1. HR STATS 
    
    if (role === "hr") {
      // Step 1: Teen cheezein ek saath fetch karo
      const [totalJobs, totalInterviews, jobIds] = await Promise.all([
        Job.countDocuments({ postedBy: userId }),
        Interview.countDocuments({ interviewer: userId }),
        Job.find({ postedBy: userId }).distinct("_id"),
      ]);

      let totalApplications = 0;
      let chartData: { month: string; applicants: number }[] = [];
      let recentApplications: any[] = [];

      if (totalJobs > 0) {
        // Step 2: Teen cheezein ek saath fetch karo
        const [appCount, monthlyData, recentAppsData] = await Promise.all([
          // Applications ki total ginti
          Application.countDocuments({ job: { $in: jobIds } }),

          // Chart ke liye monthly data
          Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),

          // Recent 5 applications
          Application.find({ job: { $in: jobIds } })
            .populate("candidate", "name email avatar") // Candidate info
            .populate("job", "title")                   // Job title
            .sort({ createdAt: -1 })                    // Naye pehle
            .limit(5)                                   // Sirf 5
            .lean(),                                    // Fast plain object
        ]);

        totalApplications = appCount;

        chartData = monthlyData.map((item) => ({
          month: monthNames[item._id - 1],
          applicants: item.count,
        }));

        recentApplications = JSON.parse(JSON.stringify(recentAppsData));
      }

      return {
        success: true,
        stats: { totalJobs, totalApplications, totalInterviews },
        chartData,
        recentApplications,
      };
    }


    // 2. ADMIN STATS 
    
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
        recentApplications: [],
      };
    }


    // 3. CANDIDATE STATS 
    
    if (role === "candidate") {
      const [totalApplied, shortlisted, interviews, pending, rejected] = await Promise.all([
        Application.countDocuments({ candidate: userId }),
        Application.countDocuments({ candidate: userId, status: "shortlisted" }),
        Interview.countDocuments({ candidate: userId }),
        Application.countDocuments({ candidate: userId, status: "pending" }),
        Application.countDocuments({ candidate: userId, status: "rejected" }),
      ]);

      return {
        success: true,
        stats: { totalApplied, shortlisted, interviews, pending, rejected },
        chartData: [],
        recentApplications: [],
      };
    }

    return { success: false, code: "INVALID_ROLE" };

  } catch (error: any) {
    console.error("STATS_FETCH_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}
