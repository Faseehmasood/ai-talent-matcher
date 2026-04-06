import { RateLimiterMemory } from "rate-limiter-flexible"
import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "../utils/ApiError"

// Rate Limiter setup
const rateLimiter = new RateLimiterMemory({
  points: 100, 
  duration: 60,   
})

export const rateLimit = async (req: NextRequest) => {
  try {
    // IP address lo request se
    const ip = req.headers.get("x-forwarded-for") || 
      req.headers.get("x-real-ip") || 
      "unknown"

    // IP ke against check karo
    await rateLimiter.consume(ip)

  } catch (error) {
    // Limit cross ho gayi!
    throw new ApiError(
      429,
      "Too many requests — Please try again later!"
    )
  }
}