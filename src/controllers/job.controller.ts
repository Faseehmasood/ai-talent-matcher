import { NextRequest, NextResponse } from "next/server"
import { Job } from "../models/job.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { verifyJWT } from "../middleware/auth"
import connectDB from "../lib/db"

// ==================
// CREATE JOB — Sirf HR
// ==================
export const createJob = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // Auth check — Sirf HR
  const user = await verifyJWT(req)
  if (user.role !== "hr" && user.role !== "admin") {
    throw new ApiError(403, "Only HR can create jobs!")
  }

  const {
    title,
    description,
    company,
    location,
    salary,
    skills,
    jobType,
  } = await req.json()

  // Validation
  if (!title || !description || !company || !location || !skills || !jobType) {
    throw new ApiError(400, "All fields are required!")
  }

  // Job banao
  const job = await Job.create({
    title,
    description,
    company,
    location,
    salary,
    skills,
    jobType,
    postedBy: user._id, // HR ka ID
  })

  return NextResponse.json(
    new ApiResponse(201, job, "Job created successfully!"),
    { status: 201 }
  )
})

// ==================
// GET ALL JOBS — Public
// ==================
export const getAllJobs = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // URL se query params lo
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const jobType = searchParams.get("jobType") || ""
  const location = searchParams.get("location") || ""

  // Skip calculate karo — Pagination ke liye
  const skip = (page - 1) * limit

  // Filter banao
  const filter: Record<string, unknown> = {
    status: "active", // Sirf active jobs
  }

  // Search — Title ya Company mein
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ]
  }

  // Job Type filter
  if (jobType) {
    filter.jobType = jobType
  }

  // Location filter
  if (location) {
    filter.location = { $regex: location, $options: "i" }
  }

  // Jobs lo with pagination
  const jobs = await Job.find(filter)
    .populate("postedBy", "name email") // HR ki info
    .sort({ createdAt: -1 }) // Naye pehle
    .skip(skip)
    .limit(limit)

  // Total count
  const total = await Job.countDocuments(filter)

  return NextResponse.json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Jobs fetched successfully!"
    ),
    { status: 200 }
  )
})

// ==================
// GET SINGLE JOB — Public
// ==================
export const getJobById = asyncHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  await connectDB()

  const jobId = context?.params?.id

  if (!jobId) {
    throw new ApiError(400, "Job ID is required!")
  }

  const job = await Job.findById(jobId).populate("postedBy", "name email")

  if (!job) {
    throw new ApiError(404, "Job not found!")
  }

  return NextResponse.json(
    new ApiResponse(200, job, "Job fetched successfully!"),
    { status: 200 }
  )
})

// ==================
// UPDATE JOB — Sirf HR
// ==================
export const updateJob = asyncHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  await connectDB()

  // Auth check
  const user = await verifyJWT(req)
  if (user.role !== "hr" && user.role !== "admin") {
    throw new ApiError(403, "Only HR can update jobs!")
  }

  const jobId = context?.params?.id
  const updates = await req.json()

  // Job dhundo
  const job = await Job.findById(jobId)
  if (!job) {
    throw new ApiError(404, "Job not found!")
  }

  // Sirf apni job update kar sake HR
  if (
    user.role === "hr" &&
    job.postedBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only update your own jobs!")
  }

  // Update karo
  const updatedJob = await Job.findByIdAndUpdate(
    jobId,
    { $set: updates },
    { new: true } // Updated document return karo
  )

  return NextResponse.json(
    new ApiResponse(200, updatedJob, "Job updated successfully!"),
    { status: 200 }
  )
})

// ==================
// DELETE JOB — Sirf HR/Admin
// ==================
export const deleteJob = asyncHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  await connectDB()

  // Auth check
  const user = await verifyJWT(req)
  if (user.role !== "hr" && user.role !== "admin") {
    throw new ApiError(403, "Only HR can delete jobs!")
  }

  const jobId = context?.params?.id

  // Job dhundo
  const job = await Job.findById(jobId)
  if (!job) {
    throw new ApiError(404, "Job not found!")
  }

  // Sirf apni job delete kar sake HR
  if (
    user.role === "hr" &&
    job.postedBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only delete your own jobs!")
  }

  await Job.findByIdAndDelete(jobId)

  return NextResponse.json(
    new ApiResponse(200, null, "Job deleted successfully!"),
    { status: 200 }
  )
})

// ==================
// GET HR JOBS — Sirf HR apni jobs dekhe
// ==================
export const getMyJobs = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // Auth check
  const user = await verifyJWT(req)
  if (user.role !== "hr" && user.role !== "admin") {
    throw new ApiError(403, "Only HR can access this!")
  }

  const jobs = await Job.find({ postedBy: user._id })
    .sort({ createdAt: -1 })

  return NextResponse.json(
    new ApiResponse(200, jobs, "Your jobs fetched successfully!"),
    { status: 200 }
  )
})