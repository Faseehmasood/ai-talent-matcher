import { NextRequest } from "next/server"
import connectDB from "@/src/lib/db"
import { verifySession } from "@/src/lib/auth-server"
import { Notification } from "@/src/models/notification.model"
import { subscribeUserEvents, RealtimeSSEEvent } from "@/src/lib/sse-bus"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const session = await verifySession()
  if (!session.success) {
    return new Response(
      JSON.stringify({ success: false, message: session.message }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  const userId = session.user._id
  const encoder = new TextEncoder()

  let unsubscribe: (() => void) | null = null
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null
  let isClosed = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendSSE = (event: RealtimeSSEEvent) => {
        if (isClosed) return
        try {
          const formatted = `id: ${event.eventId}\nevent: message\ndata: ${JSON.stringify(
            event
          )}\n\n`
          controller.enqueue(encoder.encode(formatted))
        } catch {
          isClosed = true
        }
      }

      // 1. Emit initial state snapshot (unread notifications + unreadCount)
      try {
        await connectDB()
        const filter = { recipient: userId, isRead: false }
        const [notifications, unreadCount] = await Promise.all([
          Notification.find(filter).sort({ createdAt: -1 }).limit(10).lean(),
          Notification.countDocuments(filter),
        ])

        sendSSE({
          eventId: `snapshot-${Date.now()}`,
          type: "SNAPSHOT",
          userId,
          timestamp: new Date().toISOString(),
          payload: {
            unreadCount,
            notifications: JSON.parse(JSON.stringify(notifications)),
          },
        })
      } catch {
        // Non-fatal snapshot query error
      }

      // 2. Subscribe to Redis Pub/Sub (`sse:user:${user._id}`) + in-process EventEmitter fallback
      unsubscribe = subscribeUserEvents(userId, (event) => {
        sendSSE(event)
      })

      // 3. Emit `: heartbeat\n\n` every 15 seconds to keep connection alive
      heartbeatInterval = setInterval(() => {
        if (isClosed) return
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          isClosed = true
        }
      }, 15000)

      // 4. Clean up on client disconnect (`req.signal` abort)
      const cleanup = () => {
        if (isClosed) return
        isClosed = true
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval)
          heartbeatInterval = null
        }
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
        try {
          controller.close()
        } catch {
          // Stream already closed
        }
      }

      req.signal.addEventListener("abort", cleanup)
    },
    cancel() {
      isClosed = true
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
        heartbeatInterval = null
      }
      if (unsubscribe) {
        unsubscribe()
        unsubscribe = null
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
