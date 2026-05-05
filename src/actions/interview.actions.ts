"use server";

import connectDB from "@/src/lib/db";
import { Interview } from "@/src/models/interview.model";
import { Application } from "@/src/models/application.model"; // Sync ke liye
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { interviewSchema } from "@/src/lib/validations";
import { createNotification } from "@/src/actions/notification.actions"; 

// Environment Safety
const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("ACCESS_TOKEN_SECRET is missing in .env!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);

//  HELPER: Token Verification

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


// 1. GET MY SCHEDULE (HR & Candidate Sync) 
export async function getMyScheduleAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const userId = payload._id as string;
    const role = payload.role as string;

    // Role-based filtering logic
    let queryFilter = role === "hr" ? { interviewer: userId } : { candidate: userId };

    const interviews = await Interview.find(queryFilter)
      .populate("candidate", "name email avatar")
      .populate("interviewer", "name email avatar")
      .populate("job", "title company")
      .sort({ interviewDate: 1, startTime: 1 })
      .lean();

    return {
      success: true,
      interviews: JSON.parse(JSON.stringify(interviews)),
    };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR" };
  }
}


// 2. CREATE INTERVIEW (With Notification Trigger) 
export async function createInterviewAction(interviewData: any) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    // Zod Validation
    const result = interviewSchema.safeParse(interviewData);
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

    // A. Create Interview Record
    const interview = await Interview.create({
      job: result.data.jobId,
      candidate: result.data.candidateId,
      interviewer: payload._id,
      interviewDate: result.data.interviewDate,
      startTime: result.data.startTime,
      endTime: result.data.endTime,
      type: result.data.type,
      location: result.data.location,
      notes: result.data.notes,
    });

    // B. Sync Application Status
    await Application.findOneAndUpdate(
      { job: result.data.jobId, candidate: result.data.candidateId },
      { $set: { status: "shortlisted" } }
    );

    //  ASLI TRIGGER: Notify Candidate 
    await createNotification({
      recipient: result.data.candidateId,
      sender: payload._id as string,
      message: `Interview scheduled: ${result.data.startTime} on ${new Date(result.data.interviewDate).toLocaleDateString()}`,
      link: "/candidate/schedule",
      type: "success"
    });

    revalidatePath("/hr/schedule");
    revalidatePath("/hr/dashboard");
    revalidatePath("/hr/applications");
    revalidatePath("/candidate/schedule");

    return { success: true, message: "Interview scheduled & Candidate notified! 🎉" };
  } catch (error: any) {
    console.error("CREATE_INT_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}

// 3. UPDATE STATUS (With Notification Trigger) 
export async function updateInterviewStatusAction(interviewId: string, status: string) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error };

    const updated = await Interview.findOneAndUpdate(
      { _id: interviewId, interviewer: payload._id },
      { $set: { status } },
      { new: true }
    ).populate("job");

    if (!updated) return { success: false, code: "NOT_FOUND" };

    // 🚀 ASLI TRIGGER: Jab status 'cancelled' ho ✅
    if (status === "cancelled") {
      await createNotification({
        recipient: updated.candidate.toString(),
        sender: payload._id as string,
        message: `Your interview for ${(updated.job as any).title} has been cancelled.`,
        link: "/candidate/schedule",
        type: "alert" // Red icon ke liye
      });
    }

    revalidatePath("/hr/schedule");
    revalidatePath("/candidate/schedule");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR" };
  }
}


// 4. DELETE INTERVIEW 

export async function deleteInterviewAction(interviewId: string) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const deleted = await Interview.findOneAndDelete({
      _id: interviewId,
      interviewer: payload._id,
    });
    

    if (!deleted) return { success: false, code: "NOT_FOUND" };

    revalidatePath("/hr/schedule");
    revalidatePath("/hr/dashboard");

    return { success: true };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR" };
  }
}