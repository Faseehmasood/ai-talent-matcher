import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import connectDB from "@/src/lib/db"
import { User } from "@/src/models/users.model"

export type UserRole = "admin" | "hr" | "candidate"

export interface AuthenticatedUser {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  avatar?: string
  bio?: string
  phoneNumber?: string
  skills?: string[]
  isGoogleUser?: boolean
  needsRoleSelection?: boolean
}

export type VerifySessionResult =
  | {
      success: true
      user: AuthenticatedUser
      error: null
    }
  | {
      success: false
      user: null
      error: "UNAUTHORIZED" | "TOKEN_EXPIRED" | "ACCOUNT_SUSPENDED" | "FORBIDDEN"
      status: 401 | 403
      message: string
    }

function getAccessSecret(): Uint8Array {
  const secret = process.env.ACCESS_TOKEN_SECRET
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables")
  }
  return new TextEncoder().encode(secret)
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.REFRESH_TOKEN_SECRET
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables")
  }
  return new TextEncoder().encode(secret)
}

export async function verifySession(
  allowedRoles?: UserRole[],
  req?: NextRequest
): Promise<VerifySessionResult> {
  try {
    let token: string | undefined

    if (req) {
      token =
        req.cookies.get("accessToken")?.value ||
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    } else {
      const cookieStore = await cookies()
      token = cookieStore.get("accessToken")?.value
    }

    if (!token) {
      return {
        success: false,
        user: null,
        error: "UNAUTHORIZED",
        status: 401,
        message: "Authentication required.",
      }
    }

    let payload: { _id?: string; email?: string; role?: string }
    try {
      const verified = await jwtVerify(token, getAccessSecret())
      payload = verified.payload as { _id?: string; email?: string; role?: string }
    } catch {
      return {
        success: false,
        user: null,
        error: "TOKEN_EXPIRED",
        status: 401,
        message: "Session expired or invalid token.",
      }
    }

    if (!payload._id) {
      return {
        success: false,
        user: null,
        error: "UNAUTHORIZED",
        status: 401,
        message: "Malformed authentication token.",
      }
    }

    await connectDB()
    const dbUser = await User.findById(payload._id)
      .select(
        "_id name email role isActive avatar bio phoneNumber skills isGoogleUser needsRoleSelection"
      )
      .lean()

    if (!dbUser) {
      return {
        success: false,
        user: null,
        error: "UNAUTHORIZED",
        status: 401,
        message: "User account no longer exists.",
      }
    }

    if (dbUser.isActive === false) {
      return {
        success: false,
        user: null,
        error: "ACCOUNT_SUSPENDED",
        status: 403,
        message: "Your account has been suspended. Contact an administrator.",
      }
    }

    const authUser: AuthenticatedUser = {
      _id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      isActive: Boolean(dbUser.isActive),
      avatar: dbUser.avatar || "",
      bio: dbUser.bio || "",
      phoneNumber: dbUser.phoneNumber || "",
      skills: dbUser.skills || [],
      isGoogleUser: Boolean(dbUser.isGoogleUser),
      needsRoleSelection: Boolean(dbUser.needsRoleSelection),
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
      return {
        success: false,
        user: null,
        error: "FORBIDDEN",
        status: 403,
        message: "You do not have permission to perform this action.",
      }
    }

    return {
      success: true,
      user: authUser,
      error: null,
    }
  } catch {
    return {
      success: false,
      user: null,
      error: "UNAUTHORIZED",
      status: 401,
      message: "Authentication verification failed.",
    }
  }
}

export async function signAccessAndRefreshTokens(user: {
  _id: string
  email: string
  role: string
  name?: string
}): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await new SignJWT({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name || "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessSecret())

  const refreshToken = await new SignJWT({
    _id: user._id.toString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecret())

  return { accessToken, refreshToken }
}

export function setAuthCookiesOnResponse(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const isProd = process.env.NODE_ENV === "production"

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  })

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })
}
