import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import {
  signAccessAndRefreshTokens,
  setAuthCookiesOnResponse,
} from "@/src/lib/auth-server"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  const { searchParams } = new URL(req.url)
  const rawCallback = searchParams.get("callback") || "/"
  // Prevent Open Redirect: allow only single-slash internal relative paths
  const safeCallback =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/"

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET
    if (!refreshSecret) {
      throw new Error("REFRESH_TOKEN_SECRET missing")
    }

    const { payload } = await jwtVerify(
      refreshToken,
      new TextEncoder().encode(refreshSecret)
    )

    await connectDB()
    const user = await User.findById(payload._id)
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new Error("Invalid or revoked session")
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await signAccessAndRefreshTokens({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      })

    user.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })

    const response = NextResponse.redirect(new URL(safeCallback, req.url))
    setAuthCookiesOnResponse(response, newAccessToken, newRefreshToken)
    return response
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")
    return response
  }
}
