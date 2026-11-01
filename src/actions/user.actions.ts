"use server"

import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { connection } from "next/server"
import {
  updateProfileSchema,
  changePasswordSchema,
  adminCreateUserSchema,
  validateImageBuffer,
} from "@/src/lib/validations"
import { uploadOnCloudinary } from "@/src/utils/cloudinary"
import { verifySession } from "@/src/lib/auth-server"
import { jwtVerify } from "jose"

export async function updateProfileAction(data: unknown) {
  try {
    const session = await verifySession()
    if (!session.success) {
      return { success: false, message: session.message }
    }

    const result = updateProfileSchema.safeParse(data)
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message }
    }

    await connectDB()
    const updatedUser = await User.findByIdAndUpdate(
      session.user._id,
      { $set: result.data },
      { new: true }
    ).select("-password -refreshToken")

    if (!updatedUser) {
      return { success: false, message: "User not found" }
    }

    revalidatePath(`/${session.user.role}/profile`)
    revalidatePath("/hr/candidates")

    return {
      success: true,
      message: "Profile updated successfully!",
      user: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch {
    return { success: false, message: "Failed to update profile" }
  }
}

export async function changePasswordAction(formData: unknown) {
  try {
    const session = await verifySession()
    if (!session.success) {
      return { success: false, message: session.message }
    }

    const result = changePasswordSchema.safeParse(formData)
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message }
    }

    const { oldPassword, newPassword } = result.data

    await connectDB()
    const user = await User.findById(session.user._id).select("+password")
    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (user.isGoogleUser) {
      return {
        success: false,
        message: "Google OAuth accounts cannot change password here.",
      }
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if (!isPasswordCorrect) {
      return { success: false, message: "Old password is incorrect!" }
    }

    user.password = newPassword
    await user.save()

    return { success: true, message: "Password updated successfully!" }
  } catch {
    return { success: false, message: "Internal Server Error" }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value
  const refreshToken = cookieStore.get("refreshToken")?.value

  try {
    let userId: string | undefined

    if (accessToken && process.env.ACCESS_TOKEN_SECRET) {
      try {
        const { payload } = await jwtVerify(
          accessToken,
          new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
        )
        userId = payload._id as string
      } catch {
        // Ignore expired access token, try refreshToken next
      }
    }

    if (!userId && refreshToken && process.env.REFRESH_TOKEN_SECRET) {
      try {
        const { payload } = await jwtVerify(
          refreshToken,
          new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
        )
        userId = payload._id as string
      } catch {
        // Ignore invalid refresh token
      }
    }

    if (userId) {
      await connectDB()
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
      })
    }
  } catch {
    // Proceed to cookie cleanup even if DB cleanup fails
  }

  cookieStore.delete("accessToken")
  cookieStore.delete("refreshToken")
  return { success: true, message: "Logged out successfully" }
}

export async function updateUserAvatarAction(formData: FormData) {
  try {
    const session = await verifySession()
    if (!session.success) {
      return {
        success: false,
        code: session.error,
        message: session.message,
      }
    }

    const avatarFile = formData.get("avatar") as File | null
    if (!avatarFile) {
      return { success: false, message: "No image file provided" }
    }

    const arrayBuffer = await avatarFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const validation = validateImageBuffer(buffer, 2 * 1024 * 1024)
    if (!validation.valid) {
      return { success: false, message: validation.message }
    }

    const avatarUrl = await uploadOnCloudinary(buffer, avatarFile.name)
    if (!avatarUrl) {
      return { success: false, message: "Avatar upload to storage failed" }
    }

    await connectDB()
    const updatedUser = await User.findByIdAndUpdate(
      session.user._id,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select("-password -refreshToken")

    revalidatePath(`/${session.user.role}/profile`)

    return {
      success: true,
      avatar: avatarUrl,
      user: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch {
    return { success: false, message: "Server Error" }
  }
}

export async function toggleUserStatusAction(userId: string) {
  try {
    const session = await verifySession(["admin", "hr"])
    if (!session.success) {
      return { success: false, message: session.message }
    }

    if (session.user._id === userId) {
      return {
        success: false,
        message: "You cannot suspend your own account!",
      }
    }

    await connectDB()
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return { success: false, message: "User not found" }
    }

    // Critical Security Gate: HR can ONLY archive/activate candidates, never admins or other HR users
    if (session.user.role === "hr" && targetUser.role !== "candidate") {
      return {
        success: false,
        message: "Forbidden: HR can only archive or activate candidate accounts.",
      }
    }

    targetUser.isActive = !targetUser.isActive
    if (!targetUser.isActive) {
      targetUser.refreshToken = undefined
    }
    await targetUser.save({ validateBeforeSave: false })

    revalidatePath("/hr/candidates")
    revalidatePath("/hr/candidates/archived")
    revalidatePath("/admin/users")

    return {
      success: true,
      message: targetUser.isActive
        ? "User account activated!"
        : "User account archived/suspended!",
    }
  } catch {
    return { success: false, message: "Server Error" }
  }
}

export async function getAllUsersAction() {
  await connection()
  try {
    const session = await verifySession(["admin"])
    if (!session.success) {
      return { success: false, code: session.error }
    }

    await connectDB()
    const users = await User.find({
      _id: { $ne: session.user._id },
    })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    return {
      success: true,
      users: JSON.parse(JSON.stringify(users)),
    }
  } catch {
    return { success: false, code: "SERVER_ERROR" }
  }
}

export async function adminUpdateUserAction(
  userId: string,
  data: { name: string; role: string }
) {
  await connection()
  try {
    const session = await verifySession(["admin"])
    if (!session.success) {
      return { success: false, message: session.message }
    }

    if (!["admin", "hr", "candidate"].includes(data.role)) {
      return { success: false, message: "Invalid system role" }
    }

    if (!data.name || data.name.trim().length < 2) {
      return { success: false, message: "Name must be at least 2 characters" }
    }

    await connectDB()
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name: data.name.trim(), role: data.role } },
      { new: true }
    ).select("-password -refreshToken")

    if (!updatedUser) {
      return { success: false, message: "User not found" }
    }

    revalidatePath("/admin/users")
    revalidatePath("/hr/candidates")

    return { success: true, message: "User updated successfully!" }
  } catch {
    return { success: false, message: "Server Error" }
  }
}

export async function adminCreateUserAction(userData: unknown) {
  await connection()
  try {
    const session = await verifySession(["admin"])
    if (!session.success) {
      return {
        success: false,
        message: "Forbidden: Only Admins can create internal accounts!",
      }
    }

    const parsed = adminCreateUserSchema.safeParse(userData)
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0].message,
      }
    }

    const { name, email, password, role } = parsed.data
    const normalizedEmail = email.toLowerCase()

    await connectDB()
    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean()
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists!",
      }
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      isActive: true,
    })

    revalidatePath("/admin/users")

    const sanitized = {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
    }

    return {
      success: true,
      message: `${role.toUpperCase()} account created for ${name}!`,
      user: sanitized,
    }
  } catch {
    return { success: false, message: "Server encountered an error" }
  }
}
