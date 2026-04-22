import { NextRequest, NextResponse } from "next/server"
import { RateLimiterMemory } from "rate-limiter-flexible"
import { jwtVerify } from "jose"

const globalLimiter = new RateLimiterMemory({ points: 100, duration: 60 })
const authLimiter = new RateLimiterMemory({ points: 5, duration: 60 })

// Token ko decode karne ka secret (Wahi jo .env mein hai)
const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("accessToken")?.value
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  // 1. RATE LIMITING (Wahi purana logic)
  if (pathname.startsWith("/api")) {
    try {
      const isLogin = pathname.includes("/api/auth/login")
      isLogin ? await authLimiter.consume(ip) : await globalLimiter.consume(ip)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Slow down!" }, { status: 429 })
    }
  }

  // 2. AUTH & ROLE PROTECTION 🛡️
  const isProtectedPath = pathname.startsWith("/hr") || 
                         pathname.startsWith("/admin") || 
                         pathname.startsWith("/candidate")

  if (isProtectedPath) {
    // Agar token nahi hai -> Seedha Login 
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
      // 🛠️ MAGIC: Token ko kholo aur Role nikalo 
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const userRole = payload.role as string

      //  ROLE CHECK: Agar galat dashboard hai toh redirect karo
      if (pathname.startsWith("/admin") && userRole !== "admin") {
        return NextResponse.redirect(new URL("/candidate/dashboard", req.url)) // Ya unauthorized page
      }
      if (pathname.startsWith("/hr") && userRole !== "hr") {
        return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
      }
      if (pathname.startsWith("/candidate") && userRole !== "candidate") {
        return NextResponse.redirect(new URL("/hr/dashboard", req.url))
      }

    } catch (error) {
      // Agar token kharab hai ya expire hai
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}