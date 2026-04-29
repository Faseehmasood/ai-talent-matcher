"use server";

import connectDB from "@/src/lib/db";
import { Application } from "@/src/models/application.model";
import { Job } from "@/src/models/job.model";
import { uploadOnCloudinary } from "@/src/utils/cloudinary";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { applicationSchema } from "@/src/lib/validations";

//  Environment Safety Check 
const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) throw new Error("ACCESS_TOKEN_SECRET is missing in .env");
const JWT_SECRET = new TextEncoder().encode(secretKey);

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

// 1. GET ALL APPLICATIONS (For HR) 

export async function getHRApplicationsAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const userId = payload._id as string;
    const myJobIds = await Job.find({ postedBy: userId }).distinct("_id");
    
    if (myJobIds.length === 0) return { success: true, applications: [] };

    const applications = await Application.find({ job: { $in: myJobIds } })
      .populate("candidate", "name email avatar")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(applications)),
    };
  } catch (error: any) {
    console.error("GET_APPS_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}

// 2. UPDATE APPLICATION STATUS

//  Status list updated to include "hired"
const validStatuses = ["pending", "reviewing", "shortlisted", "rejected", "hired"];

export async function updateApplicationStatusAction(
  applicationId: string,
  status: string
) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    if (!validStatuses.includes(status)) {
      return { success: false, code: "INVALID_STATUS" };
    }

    const userId = payload._id as string;
    const application = await Application.findById(applicationId).populate("job");
    if (!application) return { success: false, code: "NOT_FOUND" };

    const job = application.job as any;
    if (job.postedBy.toString() !== userId) {
      return { success: false, code: "UNAUTHORIZED_ACTION" };
    }

    application.status = status;
    await application.save();

    revalidatePath("/hr/applications");
    revalidatePath("/hr/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_STATUS_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}


// 3. APPLY FOR JOB (The Candidate Power) 

export async function applyForJobAction(formData: FormData) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    if (payload.role !== "candidate") {
      return { success: false, message: "Only candidates can apply for jobs!" };
    }

    const jobId = formData.get("jobId") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const resumeFile = formData.get("resume") as File;

    const result = applicationSchema.safeParse({ jobId, coverLetter });
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

    if (!resumeFile) return { success: false, message: "Resume file is required!" };

    // File Security Checks
    if (resumeFile.type !== "application/pdf") {
      return { success: false, message: "Only PDF resumes are allowed!" };
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      return { success: false, message: "Resume must be under 5MB!" };
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: payload._id,
    });

    if (existingApplication) {
      return { success: false, message: "You have already applied for this position!" };
    }

    //  Cloudinary Processing
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeUrl = await uploadOnCloudinary(buffer, resumeFile.name);
    
    if (!resumeUrl) return { success: false, message: "Upload failed. Try again." };

    await Application.create({
      job: jobId,
      candidate: payload._id,
      resume: resumeUrl,
      coverLetter: result.data.coverLetter,
    });

    // Instant UI Sync
    revalidatePath("/candidate/dashboard");
    revalidatePath("/candidate/applications");
    revalidatePath("/hr/dashboard");
    revalidatePath("/hr/applications");

    return { success: true, message: "Applied successfully! 🎉" };

  } catch (error: any) {
    console.error("APPLY_ACTION_ERROR:", error.message);
    return { success: false, message: "Server encountered an error" };
  }
}