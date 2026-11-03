import Redis from "ioredis"

interface MemoryCacheEntry {
  serializedValue: string
  expiresAt: number
}

interface GlobalRedisState {
  client: Redis | null
  connectionAttempted: boolean
  isHealthy: boolean
  memoryFallback: Map<string, MemoryCacheEntry>
}

declare global {
  var __redisSingleton: GlobalRedisState | undefined
}

const globalRedis: GlobalRedisState = global.__redisSingleton ?? {
  client: null,
  connectionAttempted: false,
  isHealthy: false,
  memoryFallback: new Map<string, MemoryCacheEntry>(),
}

if (!global.__redisSingleton) {
  global.__redisSingleton = globalRedis
}

const MAX_MEMORY_CACHE_ENTRIES = 1000
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

/**
 * Evicts expired entries and enforces an upper bound on the in-memory fallback Map
 * so serverless/container memory never grows unbounded when Redis is offline.
 */
function pruneMemoryFallback(): void {
  const now = Date.now()
  for (const [key, entry] of globalRedis.memoryFallback.entries()) {
    if (entry.expiresAt <= now) {
      globalRedis.memoryFallback.delete(key)
    }
  }

  if (globalRedis.memoryFallback.size >= MAX_MEMORY_CACHE_ENTRIES) {
    const oldestKey = globalRedis.memoryFallback.keys().next().value
    if (oldestKey) {
      globalRedis.memoryFallback.delete(oldestKey)
    }
  }
}

/**
 * Returns the singleton ioredis client configured for both caching and BullMQ
 * (`maxRetriesPerRequest: null`, `lazyConnect: true`), or null if `REDIS_URL`
 * is not configured or the Redis server is unreachable.
 */
export function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL?.trim()
  if (!redisUrl) {
    return null
  }

  if (globalRedis.client) {
    return globalRedis.client
  }

  if (globalRedis.connectionAttempted && !globalRedis.isHealthy) {
    return null
  }

  try {
    globalRedis.connectionAttempted = true
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 4000,
      retryStrategy(times: number) {
        if (times > 3) {
          globalRedis.isHealthy = false
          return null
        }
        return Math.min(times * 250, 1500)
      },
    })

    // Prevent unhandled "error" events from crashing the Next.js Node runtime
    client.on("error", () => {
      globalRedis.isHealthy = false
    })

    client.on("ready", () => {
      globalRedis.isHealthy = true
    })

    client.on("end", () => {
      globalRedis.isHealthy = false
    })

    globalRedis.client = client
    return client
  } catch {
    globalRedis.client = null
    globalRedis.isHealthy = false
    return null
  }
}

/**
 * Ensures the lazy Redis client is connected before issuing commands.
 * Returns null immediately if connection fails so callers fall back to memory cache.
 */
async function getConnectedRedisClient(): Promise<Redis | null> {
  const client = getRedisClient()
  if (!client) return null

  if (client.status === "ready") {
    globalRedis.isHealthy = true
    return client
  }

  if (client.status === "wait" || client.status === "close" || client.status === "end") {
    try {
      await client.connect()
      globalRedis.isHealthy = true
      return client
    } catch {
      globalRedis.isHealthy = false
      return null
    }
  }

  if (client.status === "connecting" || client.status === "reconnecting") {
    try {
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          client.once("ready", () => resolve())
          client.once("error", (err) => reject(err))
        }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("Redis connection timeout")), 2500)
        ),
      ])
      globalRedis.isHealthy = true
      return client
    } catch {
      globalRedis.isHealthy = false
      return null
    }
  }

  return globalRedis.isHealthy ? client : null
}

/**
 * Reads and deserializes a JSON value from Redis, seamlessly falling back
 * to the in-memory TTL Map if `REDIS_URL` is unset or offline.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getConnectedRedisClient()
  if (client) {
    try {
      const raw = await client.get(key)
      if (raw) {
        return JSON.parse(raw) as T
      }
    } catch {
      // Fall through to in-memory Map fallback
    }
  }

  const memEntry = globalRedis.memoryFallback.get(key)
  if (!memEntry) return null

  if (memEntry.expiresAt <= Date.now()) {
    globalRedis.memoryFallback.delete(key)
    return null
  }

  try {
    return JSON.parse(memEntry.serializedValue) as T
  } catch {
    globalRedis.memoryFallback.delete(key)
    return null
  }
}

/**
 * Serializes and writes a JSON value with a TTL (in seconds) to Redis AND
 * mirrors it into the bounded in-memory fallback Map for zero-crash resilience.
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  const safeTtl = Math.max(1, Math.floor(ttlSeconds))
  const serialized = JSON.stringify(value)

  pruneMemoryFallback()
  globalRedis.memoryFallback.set(key, {
    serializedValue: serialized,
    expiresAt: Date.now() + safeTtl * 1000,
  })

  const client = await getConnectedRedisClient()
  if (client) {
    try {
      await client.set(key, serialized, "EX", safeTtl)
    } catch {
      // In-memory fallback already persisted the entry
    }
  }
}

/**
 * Deletes a key from both Redis and the in-memory fallback Map.
 */
export async function delCache(key: string): Promise<void> {
  globalRedis.memoryFallback.delete(key)

  const client = await getConnectedRedisClient()
  if (client) {
    try {
      await client.del(key)
    } catch {
      // Ignore Redis deletion failure if instance is offline
    }
  }
}

/**
 * Reports whether the primary Redis connection is currently healthy.
 */
export function isRedisHealthy(): boolean {
  return globalRedis.isHealthy
}
