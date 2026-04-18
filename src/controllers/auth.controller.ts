import { NextRequest, NextResponse } from "next/server"
import { User } from "../models/users.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import connectDB from "../lib/db"
import jwt from "jsonwebtoken"
import { registerSchema, loginSchema } from "../lib/validations"

// REGISTER

export const register = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  
const body = await req.json()

const result = registerSchema.safeParse(body)
if (!result.success) {
  throw new ApiError(400, result.error.issues[0].message)
}

const { name, email, password, role } = result.data

  // Email already exist?
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists!")
  }

  // User banao
  const user = await User.create({
    name,
    email,
    password,
    role: role || "candidate",
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  return NextResponse.json(
    new ApiResponse(201, createdUser, "User registered successfully!"),
    { status: 201 }
  )
})

// LOGIN

export const login = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // Yeh lagao ✅
const body = await req.json()

const result = loginSchema.safeParse(body)
if (!result.success) {
  throw new ApiError(400, result.error.issues[0].message)
}

const { email, password } = result.data

  // User dhundo
  const user = await User.findOne({ email })

  if (user && user.isActive === false) {
    throw new ApiError(403, "Your account has been suspended. Contact Admin.")
  }

  if (!user) {
    throw new ApiError(404, "User not found!")
  }

  // Password check
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials!")
  }

  // Dono token banao
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  // Refresh Token DB mein save karo
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  // Response banao
  const response = NextResponse.json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful!"
    ),
    { status: 200 }
  )

  // Dono cookies set karo
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60, // 15 minutes
  })

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 din
  })

  return response
})

// ==================
// REFRESH TOKEN
// ==================
export const refreshAccessToken = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // Cookie se refresh token lo
  const incomingRefreshToken =
    req.cookies.get("refreshToken")?.value ||
    req.headers.get("x-refresh-token")

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized - No refresh token!")
  }

  // Verify karo
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET as string
  ) as { _id: string }

  // User dhundo
  const user = await User.findById(decodedToken._id)
  if (!user) {
    throw new ApiError(401, "Invalid refresh token!")
  }

  // DB mein stored token se match karo
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token expired or used!")
  }

  // Naye tokens banao
  const accessToken = user.generateAccessToken()
  const newRefreshToken = user.generateRefreshToken()

  // Naya refresh token DB mein save karo
  user.refreshToken = newRefreshToken
  await user.save({ validateBeforeSave: false })

  // Response
  const response = NextResponse.json(
    new ApiResponse(200, null, "Access token refreshed!"),
    { status: 200 }
  )

  // Nayi cookies set karo
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
  })

  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
})

// ==================
// LOGOUT
// ==================
export const logout = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // Auth check karo
  const token =
    req.cookies.get("accessToken")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "")

  if (token) {
    // DB se refresh token delete karo
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { _id: string }

    await User.findByIdAndUpdate(decoded._id, {
      $unset: { refreshToken: 1 },
    })
  }

  // Cookies delete karo
  const response = NextResponse.json(
    new ApiResponse(200, null, "Logout successful!"),
    { status: 200 }
  )

  response.cookies.set("accessToken", "", { maxAge: 0 })
  response.cookies.set("refreshToken", "", { maxAge: 0 })

  return response
})