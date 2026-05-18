import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("accessToken")?.value
  const refreshToken = req.cookies.get("refreshToken")?.value


  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }


  if (pathname === "/login" || pathname === "/register") {
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET)
        const role = payload.role as string
        if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        if (role === "hr") return NextResponse.redirect(new URL("/hr/dashboard", req.url))
        return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
      } catch {}
    }
    return NextResponse.next()
  }

  const isProtectedPath = pathname.startsWith("/hr") ||
                          pathname.startsWith("/admin") ||
                          pathname.startsWith("/candidate")

  if (isProtectedPath) {

    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (!accessToken && refreshToken) {
      const url = new URL("/api/auth/refresh-token", req.url)
      url.searchParams.set("callback", pathname)
      return NextResponse.redirect(url)
    }


    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET)
        const userRole = payload.role as string

        if (pathname.startsWith("/admin") && userRole !== "admin") {
          return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
        }
        if (pathname.startsWith("/hr") && userRole !== "hr") {
          return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
        }
        if (pathname.startsWith("/candidate") && userRole !== "candidate") {
          return NextResponse.redirect(new URL("/hr/dashboard", req.url))
        }

        return NextResponse.next()

      } catch {
        
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