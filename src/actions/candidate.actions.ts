"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { Application } from "@/src/models/application.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);


 

export async function getAllCandidatesAction(searchQuery: string = "", fetchArchived: boolean = false) {
  await connection();

  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return { success: false, code: "UNAUTHORIZED" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
     
    if (payload.role !== "hr" && payload.role !== "admin") {
      return { success: false, code: "FORBIDDEN" };
    }

    
    
    let queryFilter: any = { 
      role: "candidate", 
      isActive: fetchArchived ? false : true 
    };

    
    if (searchQuery) {
      queryFilter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { skills: { $regex: searchQuery, $options: "i" } } 
      ];
    }

    const candidates = await User.find(queryFilter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      candidates: JSON.parse(JSON.stringify(candidates))
    };

  } catch (error: any) {
    console.error("SEARCH_CANDIDATES_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}



export async function getMyApplicationsAction() {
  await connection();
  
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    
    if (!token) return { success: false, code: "UNAUTHORIZED" };

    const { payload } = await jwtVerify(token, JWT_SECRET);

    
    const applications = await Application.find({ candidate: payload._id })
      .populate("job", "title company location salary jobType status")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(applications))
    };
    
  } catch (error: any) {
    console.error("GET_MY_APPS_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}