"use server";
import connectDB from "@/src/lib/db";
import { Notification } from "@/src/models/notification.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

// 1. CREATE NOTIFICATION
export async function createNotification(data: {
  recipient: string;
  sender: string;
  message: string;
  type?: "info" | "success" | "warning" | "alert";
  link?: string;
}) {
  try {
    await connectDB();
    await Notification.create(data);
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("NOTIFICATION_CREATE_ERROR:", error);
  }
}

// 2. GET MY NOTIFICATIONS
export async function getMyNotificationsAction() {
  await connection();
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return { success: false, code: "UNAUTHORIZED" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload._id as string;

    const notifications = await Notification.find({ 
      recipient: userId,
      isRead: false 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    return {
      success: true,
      notifications: JSON.parse(JSON.stringify(notifications)),
      unreadCount: notifications.length 
    };

  } catch (error: any) {
    console.error("GET_NOTIFICATIONS_ERROR:", error.message) 
    return { success: false, code: "SERVER_ERROR" };
  }
}

// 3. MARK AS READ
export async function markAsReadAction(notificationId: string) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return { success: false, code: "UNAUTHORIZED" }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Sirf apni notification read mark karo
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: payload._id }, // ← SECURE
      { isRead: true }
    );

    revalidatePath("/", "layout");
    return { success: true };

  } catch (error: any) {
    console.error("MARK_READ_ERROR:", error.message)
    return { success: false };
  }
}