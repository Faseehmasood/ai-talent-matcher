"use server"

import connectDB from "@/src/lib/db"
import { Job } from "@/src/models/job.model"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connection } from "next/server"
import { revalidatePath } from "next/cache"
import { createJobSchema, updateJobSchema } from "@/src/lib/validations" 
import { User } from "@/src/models/users.model"
import { createNotification } from "@/src/actions/notification.actions";
import {  CreateJobInput, UpdateJobInput } from "@/src/lib/validations"

interface AuthPayload {
  _id: string;
  email: string;
  role: string;
  name: string;
}




const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);



async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  if (!token) return { payload: null, error: "UNAUTHORIZED" }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
     return { payload: payload as unknown as AuthPayload, error: null };
  } catch {
    return { payload: null, error: "TOKEN_EXPIRED" }
  }
}

// Hr jobe page

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

// delete job 

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

// create job

export async function createJobAction(jobData: CreateJobInput) {
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

    const admin = await User.findOne({ role: "admin" });

if (admin) {
  await createNotification({
    recipient: admin._id.toString(),
    sender: payload._id.toString(), 
    message: `New Job Posted: "${newJob.title}" by ${payload.name}`,
    link: "/admin/jobs",
    type: "info"
  });
}

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    return { success: true, job: JSON.parse(JSON.stringify(newJob)) }
  } catch (error: any) {
    console.error("CREATE_JOB_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}

// update job

export async function updateJobAction(jobId: string, updates: UpdateJobInput) {
  await connection()
  try {
    await connectDB()
    const { payload, error } = await verifyToken()
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" }

    const result = updateJobSchema.safeParse(updates)
    if (!result.success) {
      return { success: false, code: "VALIDATION_ERROR", message: result.error.issues[0].message }
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, postedBy: payload._id },
      { $set: result.data },
      { new: true }
    ).lean()

    if (!updatedJob) return { success: false, code: "NOT_FOUND_OR_UNAUTHORIZED" }

    revalidatePath("/hr/jobs")
    revalidatePath("/hr/dashboard")
    return { success: true, job: JSON.parse(JSON.stringify(updatedJob)) }
  } catch (error: any) {
    console.error("UPDATE_JOB_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}

// get all active jobs 

export async function getAllActiveJobsAction() {
  await connection()

  try {
    await connectDB()
    
    const jobs = await Job.find({ status: "active" })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs))
    };
  } catch (error: any) {
    console.error("GET_ACTIVE_JOBS_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" }
  }
}




// get all platform jobs 

export async function getAllPlatformJobsAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    
    if (error || !payload || payload.role !== "admin") {
      return { success: false, code: "FORBIDDEN" };
    }
    const jobs = await Job.find({})
      .populate("postedBy", "name email avatar") 
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      jobs: JSON.parse(JSON.stringify(jobs))
    };
  } catch (error: any) {
    console.error("GET_ALL_PLATFORM_JOBS_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}


// delete job action admin


export async function adminDeleteJobAction(jobId: string, reason: string) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    
    if (error || !payload || payload.role !== "admin") {
      return { success: false, message: "Forbidden" };
    }
    const job = await Job.findById(jobId);
    if (!job) return { success: false, message: "Job not found" };

    const hrId = job.postedBy.toString();
    const jobTitle = job.title;

    // admin delete job 
    await Job.findByIdAndDelete(jobId);

   
    await createNotification({
      recipient: hrId,
      sender: payload._id as string,
      message: `Your job "${jobTitle}" was removed by Admin. Reason: ${reason}`,
      link: "/hr/jobs",
      type: "alert" 
    });

    revalidatePath("/admin/jobs");
    revalidatePath("/hr/jobs");
    revalidatePath("/hr/dashboard");

    return { success: true, message: "Job deleted and HR notified!" };
  } catch (error: any) {
    return { success: false, message: "Server Error" };
  }
}