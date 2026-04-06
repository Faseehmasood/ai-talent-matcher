import { NextRequest, NextResponse } from "next/server"
import { RateLimiterMemory } from "rate-limiter-flexible"

// Global Rate Limiter
const globalLimiter = new RateLimiterMemory({
  points: 100, 
  duration: 60, 
})

// Login ke liye strict limiter
const authLimiter = new RateLimiterMemory({
  points: 5, 
  duration: 60,
})

export async function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown"

  // Login route pe extra strict
  const isAuthRoute = req.nextUrl.pathname.includes("/api/auth/login")

  try {
    if (isAuthRoute) {
      // Login pe sirf 5 attempts
      await authLimiter.consume(ip)
    } else {
      // Baaki sab pe 100 requests
      await globalLimiter.consume(ip)
    }
  } catch (error) {
    // Limit cross ho gayi!
    return NextResponse.json(
      {
        success: false,
        message: isAuthRoute
          ? "Too many login attempts — Try again after 1 minute!"
          : "Too many requests — Please slow down!",
      },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

// Sirf API routes pe apply karo
export const config = {
  matcher: "/api/:path*",
}