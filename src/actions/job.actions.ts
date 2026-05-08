"use server"

import connectDB from "@/src/lib/db"
import { Job } from "@/src/models/job.model"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { connection } from "next/server"
import { revalidatePath } from "next/cache"
import { createJobSchema, updateJobSchema } from "@/src/lib/validations" 

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

// 1. GET MY JOBS (For HR Jobs Page)

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

// 4. UPDATE JOB ACTION

export async function updateJobAction(jobId: string, updates: any) {
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

// 5. GET ALL ACTIVE JOBS (The New Chunk for Candidates)

export async function getAllActiveJobsAction() {
  // Iske liye login zaroori nahi hai (Public Explore) 
  await connection()

  try {
    await connectDB()
    
    // Logic: Sirf 'active' jobs uthao poore platform se
    const jobs = await Job.find({ status: "active" })
      .populate("postedBy", "name email") // Taake company/recruiter ka naam nazar aaye
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




// 6. GET ALL PLATFORM JOBS (For Admin Platform View) 

export async function getAllPlatformJobsAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    
    // SECURITY: Sirf Admin poore platform ka mal dekh sakta hai 
    if (error || !payload || payload.role !== "admin") {
      return { success: false, code: "FORBIDDEN" };
    }

    // ASLI LOGIC: Saari jobs laao (Active, Draft, Closed)
    const jobs = await Job.find({})
      .populate("postedBy", "name email avatar") // Taake pata chale kis HR ne post ki 
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


// DELETE JOB ACTION (Admin)
import { createNotification } from "@/src/actions/notification.actions";

export async function adminDeleteJobAction(jobId: string, reason: string) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    
    // 1. SECURITY: Sirf Admin hi doosron ki jobs delete kar sakta hai 
    if (error || !payload || payload.role !== "admin") {
      return { success: false, message: "Forbidden" };
    }

    // 2. Identify the Job and Owner before deleting 
    const job = await Job.findById(jobId);
    if (!job) return { success: false, message: "Job not found" };

    const hrId = job.postedBy.toString();
    const jobTitle = job.title;

    // 3. DELETE THE JOB 
    await Job.findByIdAndDelete(jobId);

    //  4. ASLI MAGIC: HR ko wajah (Reason) ke saath notify karo 
    await createNotification({
      recipient: hrId,
      sender: payload._id as string,
      message: `Your job "${jobTitle}" was removed by Admin. Reason: ${reason}`,
      link: "/hr/jobs",
      type: "alert" // Red icon for warning 
    });

    revalidatePath("/admin/jobs");
    revalidatePath("/hr/jobs");
    revalidatePath("/hr/dashboard");

    return { success: true, message: "Job deleted and HR notified!" };
  } catch (error: any) {
    return { success: false, message: "Server Error" };
  }
}