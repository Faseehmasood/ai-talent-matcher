"use server";

import connectDB from "@/src/lib/db";
import { Interview } from "@/src/models/interview.model";
import { Application } from "@/src/models/application.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { interviewSchema } from "@/src/lib/validations";
import { createNotification } from "@/src/actions/notification.actions";

const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) throw new Error("ACCESS_TOKEN_SECRET is missing in .env!");
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

// 1. GET MY SCHEDULE
export async function getMyScheduleAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const userId = payload._id as string;
    const role = payload.role as string;

    let queryFilter = role === "hr" 
      ? { interviewer: userId } 
      : { candidate: userId };

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
    console.error("GET_SCHEDULE_ERROR:", error.message); // ← FIX 1: Log add kiya
    return { success: false, code: "SERVER_ERROR" };
  }
}

// 2. CREATE INTERVIEW
export async function createInterviewAction(interviewData: any) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error || "UNAUTHORIZED" };

    const result = interviewSchema.safeParse(interviewData);
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

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

    // FIX 2: Interview bana tabhi aage chalo
    if (!interview) return { success: false, message: "Interview create failed" };

    await Application.findOneAndUpdate(
      { job: result.data.jobId, candidate: result.data.candidateId },
      { $set: { status: "shortlisted" } }
    );

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
    revalidatePath("/candidate/dashboard"); // Candidate dashboard bhi refresh

    return { success: true, message: "Interview scheduled & Candidate notified! 🎉" };

  } catch (error: any) {
    console.error("CREATE_INT_ERROR:", error.message);
    return { success: false, code: "SERVER_ERROR" };
  }
}

// 3. UPDATE INTERVIEW STATUS
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

    // FIX 4: Har status ke liye dynamic message
    let notificationMessage = "";
    let notificationType: "info" | "success" | "warning" | "alert" = "info";

    if (status === "cancelled") {
      notificationMessage = `Your interview for ${(updated.job as any).title} has been cancelled. HR will contact you soon.`;
      notificationType = "alert"; // ← Red notification
    } else if (status === "completed") {
      notificationMessage = `Your interview for ${(updated.job as any).title} is completed. Check back for updates!`;
      notificationType = "success";
    } else {
      notificationMessage = `Your interview for ${(updated.job as any).title} status updated to: ${status}`;
      notificationType = "info";
    }

    await createNotification({
      recipient: updated.candidate.toString(),
      sender: payload._id as string,
      message: notificationMessage,
      link: "/candidate/schedule",
      type: notificationType
    });

    revalidatePath("/hr/schedule");
    revalidatePath("/candidate/schedule");
    revalidatePath("/candidate/dashboard"); // Dashboard refresh
    revalidatePath("/", "layout");

    return { success: true };

  } catch (error: any) {
    console.error("UPDATE_INT_ERROR:", error.message); 
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

    // FIX 7: Delete par candidate notify karo
    await createNotification({
      recipient: deleted.candidate.toString(),
      sender: payload._id as string,
      message: `Your scheduled interview has been cancelled by HR.`,
      link: "/candidate/schedule",
      type: "alert" // Red notification
    });

    revalidatePath("/hr/schedule");
    revalidatePath("/hr/dashboard");
    revalidatePath("/candidate/schedule");    //  FIX 
    revalidatePath("/candidate/dashboard");  //  FIX 

    return { success: true };

  } catch (error: any) {
    console.error("DELETE_INT_ERROR:", error.message); // ← FIX 10: Log add kiya
    return { success: false, code: "SERVER_ERROR" };
  }
}