import { EventEmitter } from "events"
import crypto from "crypto"
import Redis from "ioredis"
import { getRedisClient } from "@/src/lib/redis"
import {
  AIProcessingState,
  AIApplicationAnalysis,
  GithubVerificationReport,
} from "@/types"

export type RealtimeEventType =
  | "SNAPSHOT"
  | "NOTIFICATION_CREATED"
  | "APPLICATION_CREATED"
  | "AI_PIPELINE_PROGRESS"
  | "AI_PIPELINE_COMPLETED"
  | "AI_PIPELINE_FAILED"

export interface RealtimeSSEEvent {
  eventId: string
  type: RealtimeEventType
  userId: string
  timestamp: string
  payload: {
    applicationId?: string
    jobId?: string
    candidateId?: string
    candidateName?: string
    jobTitle?: string
    matchScore?: number
    aiProcessing?: AIProcessingState
    aiAnalysis?: AIApplicationAnalysis | null
    githubVerification?: GithubVerificationReport | null
    notification?: {
      _id: string
      message: string
      type: "info" | "success" | "warning" | "alert"
      link?: string
      createdAt: string
    }
    unreadCount?: number
    notifications?: unknown[]
  }
}

interface GlobalSSEBusState {
  emitter: EventEmitter
  subscriberClient: Redis | null
  subscriberReady: boolean
  subscribedChannels: Set<string>
}

declare global {
  var __sseBusState: GlobalSSEBusState | undefined
}

const createInitialBusState = (): GlobalSSEBusState => {
  const emitter = new EventEmitter()
  emitter.setMaxListeners(500)
  return {
    emitter,
    subscriberClient: null,
    subscriberReady: false,
    subscribedChannels: new Set<string>(),
  }
}

const busState: GlobalSSEBusState =
  global.__sseBusState ?? createInitialBusState()

if (!global.__sseBusState) {
  global.__sseBusState = busState
}

/**
 * Formats the per-user Redis Pub/Sub & EventEmitter channel name: `sse:user:${userId}`
 */
export function getUserSSEChannel(userId: string): string {
  return `sse:user:${userId}`
}

/**
 * Lazily initializes a dedicated Redis subscriber connection when `REDIS_URL` is configured,
 * forwarding all `sse:user:*` messages into the local EventEmitter.
 */
function ensureRedisSubscriber(channel: string): void {
  const redisUrl = process.env.REDIS_URL?.trim()
  if (!redisUrl) return

  if (!busState.subscriberClient) {
    try {
      const sub = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectTimeout: 4000,
        retryStrategy(times: number) {
          if (times > 3) return null
          return Math.min(times * 300, 1500)
        },
      })

      sub.on("error", () => {
        busState.subscriberReady = false
      })

      sub.on("ready", () => {
        busState.subscriberReady = true
        for (const ch of busState.subscribedChannels) {
          sub.subscribe(ch).catch(() => null)
        }
      })

      sub.on("message", (receivedChannel: string, rawMessage: string) => {
        try {
          const parsed = JSON.parse(rawMessage) as RealtimeSSEEvent
          busState.emitter.emit(receivedChannel, parsed)
        } catch {
          // Ignore malformed pub/sub payloads
        }
      })

      busState.subscriberClient = sub
      sub.connect().catch(() => {
        busState.subscriberReady = false
      })
    } catch {
      busState.subscriberClient = null
      busState.subscriberReady = false
      return
    }
  }

  if (!busState.subscribedChannels.has(channel)) {
    busState.subscribedChannels.add(channel)
    if (busState.subscriberClient && busState.subscriberReady) {
      busState.subscriberClient.subscribe(channel).catch(() => null)
    }
  }
}

/**
 * Publishes a real-time event to a specific user (`sse:user:${userId}`) across both:
 * 1. The in-process Node `EventEmitter` (instant zero-latency delivery in single-instance dev/serverless)
 * 2. Redis Pub/Sub (cross-process delivery when running an external BullMQ worker process)
 */
export async function publishUserEvent(
  userId: string,
  eventInput: {
    type: RealtimeEventType
    payload: RealtimeSSEEvent["payload"]
  }
): Promise<void> {
  if (!userId) return

  const channel = getUserSSEChannel(String(userId))
  const fullEvent: RealtimeSSEEvent = {
    eventId: crypto.randomUUID(),
    type: eventInput.type,
    userId: String(userId),
    timestamp: new Date().toISOString(),
    payload: eventInput.payload,
  }

  // 1. Emit immediately to in-process listeners
  busState.emitter.emit(channel, fullEvent)

  // 2. Publish to Redis Pub/Sub if available (for separate worker processes)
  const pubClient = getRedisClient()
  if (pubClient && pubClient.status === "ready") {
    try {
      await pubClient.publish(channel, JSON.stringify(fullEvent))
    } catch {
      // In-process emitter already handled local listeners
    }
  }
}

/**
 * Subscribes to `sse:user:${userId}` events with automatic deduplication by `eventId`
 * so events received on both in-process EventEmitter and Redis Pub/Sub fire once.
 */
export function subscribeUserEvents(
  userId: string,
  onEvent: (event: RealtimeSSEEvent) => void
): () => void {
  const channel = getUserSSEChannel(String(userId))
  ensureRedisSubscriber(channel)

  const seenEventIds = new Set<string>()

  const listener = (event: RealtimeSSEEvent) => {
    if (!event || !event.eventId) return
    if (seenEventIds.has(event.eventId)) return

    seenEventIds.add(event.eventId)
    if (seenEventIds.size > 200) {
      const oldest = seenEventIds.values().next().value
      if (oldest) seenEventIds.delete(oldest)
    }

    onEvent(event)
  }

  busState.emitter.on(channel, listener)

  return () => {
    busState.emitter.off(channel, listener)
  }
}
