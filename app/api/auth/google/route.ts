import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  const state = crypto.randomUUID()
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")

  googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!)
  googleAuthUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
  )
  googleAuthUrl.searchParams.set("response_type", "code")
  googleAuthUrl.searchParams.set("scope", "openid email profile")
  googleAuthUrl.searchParams.set("access_type", "offline")
  googleAuthUrl.searchParams.set("prompt", "select_account")
  googleAuthUrl.searchParams.set("state", state)

  const response = NextResponse.redirect(googleAuthUrl.toString())
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  })

  return response
}
