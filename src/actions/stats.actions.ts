"use server";
import connectDB from "@/src/lib/db";
import { Job } from "@/src/models/job.model";
import { Application } from "@/src/models/application.model";
import { Interview } from "@/src/models/interview.model";
import { User } from "@/src/models/users.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function getDashboardStatsAction() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    //  Auth error alag identify karo
    if (!token) return { success: false, code: "UNAUTHORIZED" };

    let payload: any;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      //  Token expire ya invalid — frontend redirect kar sakta hai
      return { success: false, code: "TOKEN_EXPIRED" };
    }

    const userId = payload._id as string;
    const role = payload.role as string;

    
    // 1. HR STATS 
    
    if (role === "hr") {
      //  Pehle count karo — find nahi
      const [totalJobs, totalInterviews] = await Promise.all([
        Job.countDocuments({ postedBy: userId }),
        Interview.countDocuments({ interviewer: userId }),
      ]);

      //  Sirf tab applications fetch karo jab jobs hain
      let totalApplications = 0;
      if (totalJobs > 0) {
        const jobIds = await Job.find({ postedBy: userId }).distinct("_id");
        totalApplications = await Application.countDocuments({
          job: { $in: jobIds },
        });
      }

      return {
        success: true,
        stats: { totalJobs, totalApplications, totalInterviews },
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
      };
    }

    
    // 3. CANDIDATE STATS 
    
    if (role === "candidate") {
      const [totalApplied, shortlisted, interviews] = await Promise.all([
        Application.countDocuments({ candidate: userId }),
        Application.countDocuments({ candidate: userId, status: "shortlisted" }),
        // Candidate ke interviews bhi count karo (bonus)
        Interview.countDocuments({ candidate: userId }),
      ]);

      return {
        success: true,
        stats: { totalApplied, shortlisted, interviews },
      };
    }

    return { success: false, code: "INVALID_ROLE" };

  } catch (error: any) {
    console.error("STATS_FETCH_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}