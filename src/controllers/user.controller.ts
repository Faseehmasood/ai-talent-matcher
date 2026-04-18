import { asyncHandler } from "../utils/asyncHandler"
import { NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "../middleware/auth"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { User } from "../models/users.model" // 💡 Make sure name is 'user.model'
import connectDB from "@/src/lib/db"

// ==========================================
// 1. ADMIN CREATE USER (Staff/Partner)
// ==========================================
export const adminCreateUser = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  
  const currentUser = await verifyJWT(req)
  if (currentUser.role !== "admin") {
    throw new ApiError(403, "Only System Admins can perform this action!")
  }

  const { name, email, password, role } = await req.json()

  const existingUser = await User.findOne({ email })
  if (existingUser) throw new ApiError(400, "User already exists!")

  const newUser = await User.create({
    name,
    email,
    password, 
    role,
    isVerified: true, // Admin add kar raha hai toh auto-verify
  })

  const createdUser = await User.findById(newUser._id).select("-password")

  return NextResponse.json(new ApiResponse(201, createdUser, "Internal Account Created!"))
})

// ==========================================
// 2. TOGGLE USER STATUS (Suspend/Activate) ✅
// ==========================================
export const toggleUserStatus = asyncHandler(async (req: NextRequest, context?: { params: Promise<any> | any }) => {
  await connectDB()
  
  // 1. SECURITY: Sirf Admin suspend/activate kar sakta hai
  const currentUser = await verifyJWT(req)
  if (currentUser.role !== "admin") {
    throw new ApiError(403, "Unauthorized! Only admins can manage user status.")
  }

  // 2. Extract User ID (Next.js 15 standard)
  const params = context?.params instanceof Promise ? await context.params : context?.params
  const userId = params?.id

  if (!userId) throw new ApiError(400, "User ID is required!")

  // 3. User ko dhoondo
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, "User not found!")

  // 4. LOGIC: Admin khud ko suspend nahi kar sakta (Safety Check)
  if (user._id.toString() === currentUser._id.toString()) {
    throw new ApiError(400, "You cannot suspend your own admin account!")
  }

  // 5. TOGGLE STATUS: true hai toh false, false hai toh true
  user.isActive = !user.isActive
  await user.save({ validateBeforeSave: false }) // Password hashing skip karne ke liye

  const message = user.isActive ? "User account has been activated!" : "User account has been suspended!"

  return NextResponse.json(new ApiResponse(200, {
    _id: user._id,
    name: user.name,
    isActive: user.isActive
  }, message))
})