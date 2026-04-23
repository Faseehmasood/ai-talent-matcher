import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose" //  jose use karenge token parhne ke liye

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("accessToken")?.value
  const refreshToken = req.cookies.get("refreshToken")?.value

  // 1. Auth routes ko ignore karo
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const isProtectedPath = pathname.startsWith("/hr") || 
                         pathname.startsWith("/admin") || 
                         pathname.startsWith("/candidate")

  if (isProtectedPath) {
    // 🛡️ LAYER A: Agar Token bilkul hi nahi hai
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    //  LAYER B: Access Token nahi hai par Refresh Token hai (Silent Refresh Trigger) 
    if (!accessToken && refreshToken) {
      const url = new URL("/api/auth/refresh-token", req.url)
      url.searchParams.set("callback", pathname)
      return NextResponse.redirect(url)
    }

    //  LAYER C: Role Protection (Asli Security yahan hai) 
    if (accessToken) {
      try {
        // Token ko decode karo
        const { payload } = await jwtVerify(accessToken, JWT_SECRET)
        const userRole = payload.role as string

        // Path check karo ke kya role sahi kamray mein ja raha hai?
        if (pathname.startsWith("/admin") && userRole !== "admin") {
          return NextResponse.redirect(new URL("/candidate/dashboard", req.url)) // Wrong room? Send home!
        }
        if (pathname.startsWith("/hr") && userRole !== "hr") {
          return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
        }
        if (pathname.startsWith("/candidate") && userRole !== "candidate") {
          return NextResponse.redirect(new URL("/hr/dashboard", req.url))
        }
        
      } catch (error) {
        // Agar token expire ho chuka hai toh refresh pe bhejo
        const url = new URL("/api/auth/refresh-token", req.url)
        url.searchParams.set("callback", pathname)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}