import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { Notification } from "@/src/models/notification.model"
import {
  verifySession,
  signAccessAndRefreshTokens,
  setAuthCookiesOnResponse,
} from "@/src/lib/auth-server"

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession(undefined, req)
    if (!session.success) {
      return NextResponse.json(
        { success: false, message: session.message },
        { status: session.status }
      )
    }

    const { role } = await req.json()
    if (!role || !["candidate", "hr"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role selection" },
        { status: 400 }
      )
    }

    await connectDB()
    const existingUser = await User.findById(session.user._id)
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Critical Security Gate: Prevent existing accounts from escalating privileges
    if (!existingUser.needsRoleSelection) {
      return NextResponse.json(
        {
          success: false,
          code: "ROLE_ALREADY_FINALIZED",
          message: "Role has already been finalized for this account.",
        },
        { status: 403 }
      )
    }

    existingUser.role = role
    existingUser.needsRoleSelection = false

    const { accessToken, refreshToken } = await signAccessAndRefreshTokens({
      _id: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role,
      name: existingUser.name,
    })

    existingUser.refreshToken = refreshToken
    await existingUser.save({ validateBeforeSave: false })

    if (role === "hr") {
      try {
        const admin = await User.findOne({ role: "admin" }).select("_id").lean()
        if (admin) {
          await Notification.create({
            recipient: admin._id.toString(),
            sender: existingUser._id.toString(),
            message: `New HR Registered via Google: ${existingUser.name} is waiting for review.`,
            link: "/admin/users",
            type: "info",
          })
        }
      } catch {
        // Non-fatal notification failure
      }
    }

    const userDataForStore = {
      _id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      avatar: existingUser.avatar || "",
      bio: existingUser.bio || "",
      phoneNumber: existingUser.phoneNumber || "",
      skills: existingUser.skills || [],
      isGoogleUser: Boolean(existingUser.isGoogleUser),
    }

    const response = NextResponse.json(
      {
        success: true,
        redirectUrl: `/${role}/dashboard`,
        user: userDataForStore,
      },
      { status: 200 }
    )

    setAuthCookiesOnResponse(response, accessToken, refreshToken)
    return response
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
