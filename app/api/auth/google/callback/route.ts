import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { SignJWT } from "jose"

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url))
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
      return NextResponse.redirect(new URL("/login?error=token_failed", req.url))
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const googleUser = await userRes.json()

    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=no_email", req.url))
    }

    await connectDB()
    let user = await User.findOne({ email: googleUser.email })
    const isNewUser = !user

    if (!user) {
      try {
        user = await User.create({
          name: googleUser.name,
          email: googleUser.email,
          password: `google_${googleUser.id}_${Date.now()}`,
          role: "candidate",
          avatar: googleUser.picture,
          isGoogleUser: true,
          needsRoleSelection: true,
        })
      } catch (createError: any) {
        console.log("CREATE ERROR:", createError.message)
        return NextResponse.redirect(new URL("/login?error=user_create_failed", req.url))
      }
    }

    const accessToken = await new SignJWT({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(ACCESS_SECRET)

    const refreshToken = await new SignJWT({
      _id: user._id.toString(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(REFRESH_SECRET)

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const redirectUrl = (isNewUser || user.needsRoleSelection)
      ? `/select-role`
      : `/${user.role}/dashboard`

    const userDataForStore = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      isGoogleUser: true,
    }

    const response = new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            try {
              localStorage.setItem('auth-storage', JSON.stringify({
                state: {
                  user: ${JSON.stringify(userDataForStore)},
                  isAuthenticated: true
                },
                version: 0
              }));
            } catch(e) {}
            window.location.href = "${redirectUrl}";
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    )

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60,
      path: "/",
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response

  } catch (error: any) {
    console.error("GOOGLE_CALLBACK_ERROR:", error.message)
    return NextResponse.redirect(new URL("/login?error=server_error", req.url))
  }
}