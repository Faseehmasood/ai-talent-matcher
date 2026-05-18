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
import { createNotification } from "@/src/actions/notification.actions";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

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


export async function applyForJobAction(formData: FormData) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error };

    if (payload.role !== "candidate") {
      return { success: false, message: "Only candidates can apply!" };
    }

    const jobId = formData.get("jobId") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const resumeFile = formData.get("resume") as File;


    if (!resumeFile) {
      return { success: false, message: "Resume is required" }
    }
    if (resumeFile.type !== "application/pdf") {
      return { success: false, message: "Only PDF resumes are allowed!" }
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      return { success: false, message: "Resume must be under 5MB!" }
    }

    const result = applicationSchema.safeParse({ jobId, coverLetter });
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

 
    const job = await Job.findById(jobId);
    if (!job) return { success: false, message: "Job not found" };

    const existing = await Application.findOne({ 
      job: jobId, 
      candidate: payload._id 
    });
    if (existing) return { success: false, message: "Already applied!" };


    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeUrl = await uploadOnCloudinary(buffer, resumeFile.name);
    if (!resumeUrl) return { success: false, message: "Resume upload failed" };

    await Application.create({
      job: jobId,
      candidate: payload._id,
      resume: resumeUrl,
      coverLetter: result.data.coverLetter,
    });


    await createNotification({
      recipient: job.postedBy.toString(),
      sender: payload._id as string,
      message: `New applicant for ${job.title}`,
      link: "/hr/applications",
      type: "info"
    });

    revalidatePath("/hr/applications");
    revalidatePath("/hr/dashboard");
    revalidatePath("/candidate/dashboard");
    revalidatePath("/candidate/applications");

    return { success: true, message: "Applied successfully! 🎉" };

  } catch (error: any) {
    console.error("APPLY_ERROR:", error.message)
    return { success: false, message: "Server Error" };
  }
}
export async function getHRApplicationsAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error };

    const myJobIds = await Job.find({ postedBy: payload._id }).distinct("_id");
    if (myJobIds.length === 0) return { success: true, applications: [] };

    const applications = await Application.find({ job: { $in: myJobIds } })
      .select("resume coverLetter status createdAt candidate job") 
      .populate("candidate", "name email avatar phoneNumber")      
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(applications)),
    };

  } catch (error: any) {
    console.error("GET_HR_APPS_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" };
  }
}


export async function updateApplicationStatusAction(
  applicationId: string,
  status: string
) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error };

    const application = await Application.findById(applicationId).populate("job");
    if (!application) return { success: false, code: "NOT_FOUND" };

    const job = application.job as any;

    if (job.postedBy.toString() !== payload._id as string) {
      return { success: false, code: "UNAUTHORIZED" };
    }

    application.status = status;
    await application.save();


    await createNotification({
      recipient: application.candidate.toString(),
      sender: payload._id as string, // ← FIX
      message: `Your application for ${job.title} is now: ${status}`,
      link: "/candidate/applications",
      type: status === "shortlisted" || status === "hired" ? "success" : "alert"
    });

    revalidatePath("/hr/applications");
    revalidatePath("/hr/dashboard");
    revalidatePath("/candidate/applications");
    revalidatePath("/candidate/dashboard"); 

    return { success: true };

  } catch (error: any) {
    console.error("UPDATE_STATUS_ERROR:", error.message)
    return { success: false, code: "SERVER_ERROR" };
  }
}