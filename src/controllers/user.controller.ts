import { asyncHandler } from "../utils/asyncHandler"
import { NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "../middleware/auth"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { User } from "../models/users.model"
import connectDB from "@/src/lib/db"
import { uploadOnCloudinary } from "../utils/cloudinary"
import { updateProfileSchema, changePasswordSchema } from "../lib/validations"



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
    isVerified: true, 
  })

  const createdUser = await User.findById(newUser._id).select("-password")

  return NextResponse.json(new ApiResponse(201, createdUser, "Internal Account Created!"))
})




export const toggleUserStatus = asyncHandler(async (req: NextRequest, context?: { params: Promise<any> | any }) => {
  await connectDB()
  
  const currentUser = await verifyJWT(req)
  if (currentUser.role !== "admin") {
    throw new ApiError(403, "Unauthorized! Only admins can manage user status.")
  }

 
  const params = context?.params instanceof Promise ? await context.params : context?.params
  const userId = params?.id

  if (!userId) throw new ApiError(400, "User ID is required!")

  
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, "User not found!")

  
  if (user._id.toString() === currentUser._id.toString()) {
    throw new ApiError(400, "You cannot suspend your own admin account!")
  }

  
  user.isActive = !user.isActive
  await user.save({ validateBeforeSave: false }) 

  const message = user.isActive ? "User account has been activated!" : "User account has been suspended!"

  return NextResponse.json(new ApiResponse(200, {
    _id: user._id,
    name: user.name,
    isActive: user.isActive
  }, message))
})



export const updateAccountDetails = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)
  const body = await req.json()

  
  const result = updateProfileSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.issues[0].message)

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: result.data },
    { new: true }
  ).select("-password")

  return NextResponse.json(new ApiResponse(200, updatedUser, "Account details updated!"))
})



export const updateUserAvatar = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)
  const formData = await req.formData()
  const avatarFile = formData.get("avatar") as File

  if (!avatarFile) throw new ApiError(400, "Please upload an image")

  // Cloudinary Buffer 
  const bytes = await avatarFile.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const avatarUrl = await uploadOnCloudinary(buffer, avatarFile.name)

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { avatar: avatarUrl } },
    { new: true }
  ).select("-password")

  return NextResponse.json(new ApiResponse(200, updatedUser, "Avatar updated successfully!"))
})



export const changeCurrentPassword = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)
  const { oldPassword, newPassword } = await req.json()

  const dbUser = await User.findById(user._id)
  if (!(await dbUser.comparePassword(oldPassword))) {
    throw new ApiError(400, "Old password does not match")
  }

  dbUser.password = newPassword
  await dbUser.save({ validateBeforeSave: false }) // Auto-hashes via Mongoose pre-save hook 

  return NextResponse.json(new ApiResponse(200, {}, "Password changed successfully!"))
})