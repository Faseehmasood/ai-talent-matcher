"use server"

import connectDB from "@/src/lib/db"
import { Notification } from "@/src/models/notification.model"
import { connection } from "next/server"
import { verifySession } from "@/src/lib/auth-server"
import { publishUserEvent } from "@/src/lib/sse-bus"

export async function createNotification(data: {
  recipient: string
  sender: string
  message: string
  type?: "info" | "success" | "warning" | "alert"
  link?: string
}) {
  try {
    await connectDB()
    const created = await Notification.create(data)
    const unreadCount = await Notification.countDocuments({
      recipient: data.recipient,
      isRead: false,
    })

    await publishUserEvent(data.recipient, {
      type: "NOTIFICATION_CREATED",
      payload: {
        unreadCount,
        notification: {
          _id: created._id.toString(),
          message: created.message,
          type: created.type || "info",
          link: created.link || "/hr/applications",
          createdAt: created.createdAt.toISOString(),
        },
      },
    })
  } catch {
    // Non-fatal notification persistence error
  }
}

export async function getMyNotificationsAction() {
  await connection()
  try {
    const session = await verifySession()
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const filter = {
      recipient: session.user._id,
      isRead: false,
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(10).lean(),
      Notification.countDocuments(filter),
    ])

    return {
      success: true,
      notifications: JSON.parse(JSON.stringify(notifications)),
      unreadCount,
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function markAsReadAction(notificationId: string) {
  try {
    const session = await verifySession()
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: session.user._id },
      { $set: { isRead: true } }
    )

    return { success: true }
  } catch {
    return { success: false }
  }
}
