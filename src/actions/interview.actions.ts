"use server";

import connectDB from "@/src/lib/db";
import { Interview } from "@/src/models/interview.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { interviewSchema } from "@/src/lib/validations"; 

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

// HELPER: Centralized Token Verification
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


// 1. GET MY SCHEDULE 

export async function getMyScheduleAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const interviews = await Interview.find({ interviewer: payload._id })
      .populate("candidate", "name email avatar")
      .populate("job", "title")
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

// 2. CREATE INTERVIEW (With Zod & Mapping) 

export async function createInterviewAction(interviewData: any) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    //  ZOD VALIDATION 
    const result = interviewSchema.safeParse(interviewData);
    if (!result.success) {
      return { success: false, code: "VALIDATION_ERROR", message: result.error.issues[0].message };
    }

    //  FIELD MAPPING: jobId -> job | candidateId -> candidate
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

    revalidatePath("/hr/schedule");
    revalidatePath("/hr/dashboard");

    return { success: true, interview: JSON.parse(JSON.stringify(interview)) };
  } catch (error: any) {
    console.error("CREATE_INT_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}


// 3. UPDATE INTERVIEW STATUS (Completed/Cancelled) 

export async function updateInterviewStatusAction(interviewId: string, status: string) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    // Security: Only owner can update 🛡️
    const updated = await Interview.findOneAndUpdate(
      { _id: interviewId, interviewer: payload._id },
      { $set: { status } },
      { new: true }
    );

    if (!updated) return { success: false, code: "NOT_FOUND" };

    revalidatePath("/hr/schedule");
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