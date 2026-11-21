import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("accessToken")?.value
  const refreshToken = req.cookies.get("refreshToken")?.value

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/hr/login" ||
    pathname === "/hr-login" ||
    pathname === "/employers/login" ||
    pathname === "/candidate/login"

  if (isAuthRoute) {
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET)
        if (payload.needsRoleSelection === true) {
          return NextResponse.redirect(new URL("/select-role", req.url))
        }
        const role = payload.role as string
        if (role === "admin")
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        if (role === "hr")
          return NextResponse.redirect(new URL("/hr/dashboard", req.url))
        return NextResponse.redirect(new URL("/candidate/dashboard", req.url))
      } catch {
        // Proceed to login/register if token is expired/invalid
      }
    }
    return NextResponse.next()
  }

  const isDynamicAccountRoute = /^\/[^/]+\/(profile|settings)(\/|$)/.test(pathname)

  const isProtectedPath =
    (pathname.startsWith("/hr") &&
      pathname !== "/hr/login" &&
      pathname !== "/hr-login") ||
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/candidate") && pathname !== "/candidate/login") ||
    pathname === "/select-role" ||
    isDynamicAccountRoute

  if (isProtectedPath) {
    if (!accessToken && !refreshToken) {
      const redirectTarget = pathname.startsWith("/hr") ? "/hr/login" : "/login"
      return NextResponse.redirect(new URL(redirectTarget, req.url))
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
        const needsRoleSelection = payload.needsRoleSelection === true

        const roleHome =
          userRole === "admin"
            ? "/admin/dashboard"
            : userRole === "hr"
            ? "/hr/dashboard"
            : "/candidate/dashboard"

        // Enforce Google OAuth onboarding gate before entering any dashboard
        if (needsRoleSelection && pathname !== "/select-role") {
          return NextResponse.redirect(new URL("/select-role", req.url))
        }
        if (!needsRoleSelection && pathname === "/select-role") {
          return NextResponse.redirect(new URL(roleHome, req.url))
        }

        // Enforce valid role segment on dynamic /[role]/profile and /[role]/settings routes
        if (isDynamicAccountRoute) {
          const [, segment, section] = pathname.split("/")
          if (segment !== userRole) {
            return NextResponse.redirect(
              new URL(`/${userRole}/${section}`, req.url)
            )
          }
          return NextResponse.next()
        }

        if (pathname.startsWith("/admin") && userRole !== "admin") {
          return NextResponse.redirect(new URL(roleHome, req.url))
        }
        if (pathname.startsWith("/hr") && userRole !== "hr") {
          return NextResponse.redirect(new URL(roleHome, req.url))
        }
        if (pathname.startsWith("/candidate") && userRole !== "candidate") {
          return NextResponse.redirect(new URL(roleHome, req.url))
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
