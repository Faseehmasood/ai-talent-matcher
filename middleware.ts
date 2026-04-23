import { NextRequest, NextResponse } from "next/server"
import { RateLimiterMemory } from "rate-limiter-flexible"
import { jwtVerify } from "jose"

// 1. Rate Limiters Setup
const globalLimiter = new RateLimiterMemory({ points: 100, duration: 60 })
const authLimiter = new RateLimiterMemory({ points: 5, duration: 60 })

// Secret for JWT (must match your .env)
const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  //  FIX 1: Refresh route ko middleware se azad karo (Loop Break) 
  if (pathname.startsWith("/api/auth/refresh-token")) {
    return NextResponse.next()
  }

  //  Dono cookies pakro
  const accessToken = req.cookies.get("accessToken")?.value
  const refreshToken = req.cookies.get("refreshToken")?.value
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  // LAYER 1: RATE LIMITING (APIs Only) 

  if (pathname.startsWith("/api")) {
    try {
      const isLogin = pathname.includes("/api/auth/login")
      isLogin ? await authLimiter.consume(ip) : await globalLimiter.consume(ip)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Slow down!" }, { status: 429 })
    }
  }

  // LAYER 2: AUTH & ROLE PROTECTION

  const isProtectedPath = pathname.startsWith("/hr") || 
                         pathname.startsWith("/admin") || 
                         pathname.startsWith("/candidate")

  if (isProtectedPath) {
    
    //  SCENARIO A: Access token expire hai par Refresh token hai -> SILENT REFRESH 
    if (!accessToken && refreshToken) {
      console.log(" Rewrite: Triggering Silent Refresh for", pathname)
      const url = req.nextUrl.clone()
      url.pathname = "/api/auth/refresh-token"
      return NextResponse.rewrite(url)
    }

    //  SCENARIO B: Dono token gayab hain -> LOGIN BHEJO 
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    //  SCENARIO C: Access token mojood hai -> VERIFY ROLE 
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET)
        const userRole = payload.role as string

        // Role vs Path Mismatch Check
        if (pathname.startsWith("/admin") && userRole !== "admin") {
          return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
        }
        if (pathname.startsWith("/hr") && userRole !== "hr") {
          return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
        }
        if (pathname.startsWith("/candidate") && userRole !== "candidate") {
          return NextResponse.redirect(new URL("/hr/dashboard", req.url))
        }
      } catch (error) {
        // Agar verify fail ho (expire ho) lekin refresh token ho -> Refresh again
        if (refreshToken) {
          const url = req.nextUrl.clone()
          url.pathname = "/api/auth/refresh-token"
          return NextResponse.rewrite(url)
        }
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }
  }

  //  SCENARIO D: Login hai par wapas /login ya /register par jana chahta hai
  if (accessToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

// MATCHER: Static files aur assets ko skip karo 
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}