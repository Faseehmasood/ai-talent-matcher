import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import {
  signAccessAndRefreshTokens,
  setAuthCookiesOnResponse,
} from "@/src/lib/auth-server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const incomingState = searchParams.get("state")
  const storedState = req.cookies.get("oauth_state")?.value

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url))
  }

  if (!incomingState || !storedState || incomingState !== storedState) {
    const csrfRes = NextResponse.redirect(
      new URL("/login?error=invalid_oauth_state", req.url)
    )
    csrfRes.cookies.delete("oauth_state")
    return csrfRes
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL("/login?error=token_failed", req.url)
      )
    }

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )

    const googleUser = await userRes.json()

    if (!googleUser.email || googleUser.verified_email === false) {
      return NextResponse.redirect(
        new URL("/login?error=unverified_email", req.url)
      )
    }

    await connectDB()
    let user = await User.findOne({ email: googleUser.email.toLowerCase() })
    const isNewUser = !user

    if (user && user.isActive === false) {
      return NextResponse.redirect(
        new URL("/login?error=account_suspended", req.url)
      )
    }

    if (!user) {
      try {
        user = await User.create({
          name: String(googleUser.name || "Google User").slice(0, 50),
          email: googleUser.email.toLowerCase(),
          password: `google_${crypto.randomBytes(24).toString("hex")}A1`,
          role: "candidate",
          avatar: googleUser.picture || "",
          isGoogleUser: true,
          needsRoleSelection: true,
          isActive: true,
        })
      } catch {
        return NextResponse.redirect(
          new URL("/login?error=user_create_failed", req.url)
        )
      }
    }

    const { accessToken, refreshToken } = await signAccessAndRefreshTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const redirectPath =
      isNewUser || user.needsRoleSelection
        ? "/select-role"
        : `/${user.role}/dashboard`

    const response = NextResponse.redirect(new URL(redirectPath, req.url))
    response.cookies.delete("oauth_state")
    setAuthCookiesOnResponse(response, accessToken, refreshToken)

    return response
  } catch {
    return NextResponse.redirect(new URL("/login?error=server_error", req.url))
  }
}
