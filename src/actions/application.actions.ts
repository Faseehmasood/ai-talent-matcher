"use server";

import connectDB from "@/src/lib/db";
import { Application } from "@/src/models/application.model";
import { Job } from "@/src/models/job.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

// HELPER: Token Verification taake code repeat na ho
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
      .lean();

    return {
      success: true,
      applications: JSON.parse(JSON.stringify(applications)),
    };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR" };
  }
}


// 2. UPDATE APPLICATION STATUS (With Security Lock) 

export async function updateApplicationStatusAction(
  applicationId: string,
  status: string
) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const userId = payload._id as string;

    // 🛡️ SECURITY LOCK: Pehle check karo ke ye application is HR ki job ki hai?
    const application = await Application.findById(applicationId).populate("job");
    if (!application) return { success: false, code: "NOT_FOUND" };

    // Check if the Job's owner matches current HR's ID
    const job = application.job as any;
    if (job.postedBy.toString() !== userId) {
      return { success: false, code: "UNAUTHORIZED_ACTION" };
    }

    // Ab update karo kyunke verification ho gayi 
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