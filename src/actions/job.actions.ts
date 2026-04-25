"use server"

import connectDB from "@/src/lib/db"
import { Job } from "@/src/models/job.model"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connection } from "next/server"
import { revalidatePath } from "next/cache"
import { createJobSchema, updateJobSchema } from "@/src/lib/validations" //  Dono schemas import kiye

// Environment Variable Safety
const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);


//  PRIVATE HELPER: Token Verification

async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  if (!token) return { payload: null, error: "UNAUTHORIZED" }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { payload, error: null }
  } catch {
    return { payload: null, error: "TOKEN_EXPIRED" }
  }
}


// 1. GET MY JOBS (List View) 
export async function getMyJobsAction() {
  await connection()
  try {
    await connectDB()
    const { payload, error } = await verifyToken()
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" }

    const jobs = await Job.find({ postedBy: payload._id })
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs))
    }
  } catch (error: any) {
    console.error("GET_MY_JOBS_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}


// 2. DELETE JOB ACTION 
export async function deleteJobAction(jobId: string) {
  await connection()
  try {
    await connectDB()
    const { payload, error } = await verifyToken()
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" }

    const deletedJob = await Job.findOneAndDelete({
      _id: jobId,
      postedBy: payload._id 
    })

    if (!deletedJob) return { success: false, code: "NOT_FOUND" }

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("DELETE_JOB_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}


// 3. CREATE JOB ACTION 
export async function createJobAction(jobData: any) {
  await connection()
  try {
    await connectDB()
    const { payload, error } = await verifyToken()
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" }

    const result = createJobSchema.safeParse(jobData)
    if (!result.success) {
      return { success: false, code: "VALIDATION_ERROR", message: result.error.issues[0].message }
    }

    const newJob = await Job.create({
      ...result.data,
      postedBy: payload._id,
      status: "active"
    })

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    return { success: true, job: JSON.parse(JSON.stringify(newJob)) }
  } catch (error: any) {
    console.error("CREATE_JOB_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}


// 4. UPDATE JOB ACTION (The New Chunk) 

export async function updateJobAction(jobId: string, updates: any) {
  await connection()
  try {
    await connectDB()
    const { payload, error } = await verifyToken()
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" }

    //  ZOD VALIDATION: Partial updates allow karta hai 
    const result = updateJobSchema.safeParse(updates)
    if (!result.success) {
      return { 
        success: false, 
        code: "VALIDATION_ERROR", 
        message: result.error.issues[0].message 
      }
    }

    // Logic: Database update with ownership check 
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, postedBy: payload._id }, // Ensure this HR owns the job
      { $set: result.data },                 // Sirf wahi data badlo jo aaya hai
      { new: true }                          // Naya record return karo
    ).lean()

    if (!updatedJob) {
      return { success: false, code: "NOT_FOUND_OR_UNAUTHORIZED" }
    }

    //  Refresh all views
    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")

    return {
      success: true,
      job: JSON.parse(JSON.stringify(updatedJob))
    }
  } catch (error: any) {
    console.error("UPDATE_JOB_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}