"use client"

type SSEMessageHandler = (event: any) => void
type SSEStatusHandler = (connected: boolean) => void

let sharedEventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let retryAttempt = 0
let isConnected = false
let lastSnapshotEvent: any = null

const messageHandlers = new Set<SSEMessageHandler>()
const statusHandlers = new Set<SSEStatusHandler>()

function notifyStatus(connected: boolean) {
  isConnected = connected
  for (const handler of statusHandlers) {
    try {
      handler(connected)
    } catch {
      // Ignore individual subscriber errors
    }
  }
}

function teardownConnection() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (sharedEventSource) {
    sharedEventSource.close()
    sharedEventSource = null
  }
  isConnected = false
  retryAttempt = 0
}

function ensureConnection() {
  if (typeof window === "undefined") return
  if (sharedEventSource || messageHandlers.size === 0) return

  try {
    const es = new EventSource("/api/sse/events")
    sharedEventSource = es

    es.onopen = () => {
      retryAttempt = 0
      notifyStatus(true)
    }

    es.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data)
        if (!parsed || !parsed.type) return
        if (parsed.type === "SNAPSHOT") {
          lastSnapshotEvent = parsed
        }
        for (const handler of messageHandlers) {
          try {
            handler(parsed)
          } catch {
            // Ignore individual listener errors
          }
        }
      } catch {
        // Ignore malformed SSE payload
      }
    }

    es.onerror = () => {
      notifyStatus(false)
      es.close()
      sharedEventSource = null
      if (messageHandlers.size > 0) {
        retryAttempt += 1
        const delayMs = Math.min(30000, 1500 * Math.pow(1.6, retryAttempt))
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          ensureConnection()
        }, delayMs)
      }
    }
  } catch {
    notifyStatus(false)
  }
}

/**
 * Subscribes a React component to the single shared `/api/sse/events` connection
 * per browser tab (prevents duplicate EventSource sockets hitting HTTP/1.1 limits).
 */
export function subscribeToRealtimeSSE(
  onMessage: SSEMessageHandler,
  onStatusChange?: SSEStatusHandler
): () => void {
  messageHandlers.add(onMessage)
  if (onStatusChange) {
    statusHandlers.add(onStatusChange)
    onStatusChange(isConnected)
  }

  // Immediately replay the latest SNAPSHOT to late-mounting subscribers (e.g. NotificationBell)
  if (lastSnapshotEvent) {
    try {
      onMessage(lastSnapshotEvent)
    } catch {
      // Ignore
    }
  }

  ensureConnection()

  return () => {
    messageHandlers.delete(onMessage)
    if (onStatusChange) {
      statusHandlers.delete(onStatusChange)
    }
    if (messageHandlers.size === 0) {
      teardownConnection()
    }
  }
}
