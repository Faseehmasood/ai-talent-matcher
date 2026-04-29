"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";
import { Application } from "@/src/models/application.model";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function getAllCandidatesAction() {
  await connection();

  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return { success: false, code: "UNAUTHORIZED" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Security Check: Sirf HR ya Admin hi Candidates ki list dekh saktay hain 
    if (payload.role !== "hr" && payload.role !== "admin") {
      return { success: false, code: "FORBIDDEN" };
    }

    //  ASLI DATA FETCHING: Saare candidates nikaalo
    const candidates = await User.find({ role: "candidate" })
      .select("-password -refreshToken") // Sensitive info hide karo
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      candidates: JSON.parse(JSON.stringify(candidates))
    };

  } catch (error: any) {
    console.error("FETCH_CANDIDATES_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}


// Get Application for Candidate


export async function getMyApplicationsAction() {
  await connection();
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return { success: false, code: "UNAUTHORIZED" };

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // ASLI DATA: Sirf is candidate ki applications aur Job details
    const applications = await Application.find({ candidate: payload._id })
      .populate("job", "title company location salary jobType")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(applications))
    };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR" };
  }
}