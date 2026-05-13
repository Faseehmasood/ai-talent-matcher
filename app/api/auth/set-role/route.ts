import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { Notification } from "@/src/models/notification.model"
import { SignJWT, jwtVerify } from "jose"

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json()

    if (!role || !["candidate", "hr"].includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 })
    }

    const accessToken = req.cookies.get("accessToken")?.value
    if (!accessToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET)
    const userId = payload._id as string

    await connectDB()

    const user = await User.findByIdAndUpdate(
      userId,
      { role, needsRoleSelection: false },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // HR ne register kiya — admin ko notification bhejo
    if (role === "hr") {
      try {
        const admin = await User.findOne({ role: "admin" })
        if (admin) {
          await Notification.create({
            recipient: admin._id.toString(),
            sender: user._id.toString(),
            message: `New HR Registered via Google: ${user.name} is waiting for review.`,
            link: "/admin/users",
            type: "info",
          })
        }
      } catch (notifError) {
        console.error("NOTIFICATION_ERROR:", notifError)
      }
    }

    const newAccessToken = await new SignJWT({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(ACCESS_SECRET)

    const newRefreshToken = await new SignJWT({
      _id: user._id.toString(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(REFRESH_SECRET)

    user.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })

    // Zustand store update karo role ke saath
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
            window.location.href = "/${role}/dashboard";
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    )

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    })

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response

  } catch (error: any) {
    console.error("SET_ROLE_ERROR:", error.message)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}