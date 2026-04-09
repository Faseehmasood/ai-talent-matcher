import { NextRequest, NextResponse } from "next/server"
import { Application } from "../models/application.model"
import { Job } from "../models/job.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { verifyJWT } from "../middleware/auth"
import { uploadOnCloudinary } from "../utils/cloudinary"
import { applicationSchema } from "../lib/validations"
import connectDB from "../lib/db"

// ==================
// APPLY FOR JOB — Sirf Candidate
// ==================
export const applyForJob = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  // Auth check — Sirf Candidate
  const user = await verifyJWT(req)
  if (user.role !== "candidate") {
    throw new ApiError(403, "Only candidates can apply for jobs!")
  }

  // FormData se data nikalo — File bhi hai!
  const formData = await req.formData()
  const jobId = formData.get("jobId") as string
  const coverLetter = formData.get("coverLetter") as string
  const resumeFile = formData.get("resume") as File

  // Zod validation
  const result = applicationSchema.safeParse({ jobId, coverLetter })
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message)
  }

  // Resume zaroori hai
  if (!resumeFile) {
    throw new ApiError(400, "Resume is required!")
  }

  // File type check karo
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
  if (!allowedTypes.includes(resumeFile.type)) {
    throw new ApiError(400, "Only PDF and Images allowed!")
  }

  // File size check — 5MB max
  if (resumeFile.size > 5 * 1024 * 1024) {
    throw new ApiError(400, "File size cannot exceed 5MB!")
  }

  // Job exist karta hai?
  const job = await Job.findById(jobId)
  if (!job) {
    throw new ApiError(404, "Job not found!")
  }

  // Job active hai?
  if (job.status !== "active") {
    throw new ApiError(400, "This job is no longer accepting applications!")
  }

  // Pehle apply kiya hua hai?
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: user._id,
  })
  if (existingApplication) {
    throw new ApiError(409, "You have already applied for this job!")
  }

  // File ko Buffer mein convert karo
  const bytes = await resumeFile.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Cloudinary pe upload karo
  const resumeUrl = await uploadOnCloudinary(buffer, resumeFile.name)
  if (!resumeUrl) {
    throw new ApiError(500, "Resume upload failed!")
  }

  // Application banao
  const application = await Application.create({
    job: jobId,
    candidate: user._id,
    resume: resumeUrl,
    coverLetter: coverLetter || "",
  })

  return NextResponse.json(
    new ApiResponse(201, application, "Application submitted successfully!"),
    { status: 201 }
  )
})

// ==================
// GET MY APPLICATIONS — Candidate apni applications dekhe
// ==================
export const getMyApplications = asyncHandler(async (req: NextRequest) => {
  await connectDB()

  const user = await verifyJWT(req)
  if (user.role !== "candidate") {
    throw new ApiError(403, "Only candidates can access this!")
  }

  const applications = await Application.find({ candidate: user._id })
    .populate("job", "title company location jobType salary status")
    .sort({ createdAt: -1 })

  return NextResponse.json(
    new ApiResponse(200, applications, "Applications fetched successfully!"),
    { status: 200 }
  )
})

// ==================
// GET JOB APPLICATIONS — HR dekhe
// ==================
export const getJobApplications = asyncHandler(
  async (req: NextRequest, context?: { params: Record<string, string> }) => {
    await connectDB()

    const user = await verifyJWT(req)
    if (user.role !== "hr" && user.role !== "admin") {
      throw new ApiError(403, "Only HR can access applications!")
    }

    const jobId = context?.params?.id

    // Pagination
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const applications = await Application.find({ job: jobId })
      .populate("candidate", "name email avatar")
      .populate("job", "title company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Application.countDocuments({ job: jobId })

    return NextResponse.json(
      new ApiResponse(
        200,
        {
          applications,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Applications fetched successfully!"
      ),
      { status: 200 }
    )
  }
)

// ==================
// UPDATE APPLICATION STATUS — Sirf HR
// ==================
export const updateApplicationStatus = asyncHandler(
  async (req: NextRequest, context?: { params: Record<string, string> }) => {
    await connectDB()

    const user = await verifyJWT(req)
    if (user.role !== "hr" && user.role !== "admin") {
      throw new ApiError(403, "Only HR can update application status!")
    }

    const applicationId = context?.params?.id
    const { status } = await req.json()

    // Valid status check
    const validStatuses = [
      "pending",
      "reviewing",
      "shortlisted",
      "rejected",
      "hired",
    ]
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status!")
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { $set: { status } },
      { new: true }
    ).populate("candidate", "name email")

    if (!application) {
      throw new ApiError(404, "Application not found!")
    }

    return NextResponse.json(
      new ApiResponse(200, application, "Application status updated!"),
      { status: 200 }
    )
  }
)