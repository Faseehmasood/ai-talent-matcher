"use server"

import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"
import {
  registerSchema,
  loginSchema,
  RegisterInput,
  LoginInput,
} from "@/src/lib/validations"
import { cookies } from "next/headers"
import { createNotification } from "./notification.actions"
import { signAccessAndRefreshTokens } from "@/src/lib/auth-server"
import { RateLimiterMemory } from "rate-limiter-flexible"

const authRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
})

export async function registerUserAction(formData: RegisterInput) {
  try {
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      return {
        success: false,
        message: result.error.issues[0].message,
      }
    }

    const { name, email, password, role, phoneNumber } = result.data
    const normalizedEmail = email.toLowerCase()

    try {
      await authRateLimiter.consume(`register:${normalizedEmail}`)
    } catch {
      return {
        success: false,
        message: "Too many registration attempts. Please wait a minute.",
      }
    }

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
      phoneNumber,
      isActive: true,
    })

    if (newUser.role === "hr") {
      const admin = await User.findOne({ role: "admin" }).select("_id").lean()
      if (admin) {
        await createNotification({
          recipient: admin._id.toString(),
          sender: newUser._id.toString(),
          message: `New HR Registered: ${newUser.name} is waiting for review.`,
          link: "/admin/users",
          type: "info",
        })
      }
    }

    return {
      success: true,
      message: "Registration successful! You can now login.",
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
      },
    }
  } catch {
    return { success: false, message: "Internal Server Error" }
  }
}

export async function loginUserAction(formData: LoginInput) {
  try {
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message }
    }

    const { email, password } = result.data
    const normalizedEmail = email.toLowerCase()

    try {
      await authRateLimiter.consume(`login:${normalizedEmail}`)
    } catch {
      return {
        success: false,
        message: "Too many login attempts. Please try again in 60 seconds.",
      }
    }

    await connectDB()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return { success: false, message: "Invalid email or password!" }
    }

    if (user.isActive === false) {
      return {
        success: false,
        message:
          "Your account has been suspended. Please contact an administrator.",
      }
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return { success: false, message: "Invalid email or password!" }
    }

    const { accessToken, refreshToken } = await signAccessAndRefreshTokens({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const cookieStore = await cookies()
    const isProd = process.env.NODE_ENV === "production"

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    })

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return {
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        skills: user.skills || [],
        isGoogleUser: Boolean(user.isGoogleUser),
      },
    }
  } catch {
    return { success: false, message: "Something went wrong on the server" }
  }
}
