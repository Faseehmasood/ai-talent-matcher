import { NextRequest, NextResponse } from "next/server"
import { Interview } from "../models/interview.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler"
import { verifyJWT } from "../middleware/auth"
import { interviewSchema } from "../lib/validations"
import connectDB from "../lib/db"

// 1. Schedule a new interview (HR only)
export const scheduleInterview = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)

  if (user.role !== "hr") {
    throw new ApiError(403, "Only HR can schedule interviews!")
  }

  const body = await req.json()
  const result = interviewSchema.safeParse(body)

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message)
  }

  const interview = await Interview.create({
    job: result.data.jobId,           // mapping jobId -> job
    candidate: result.data.candidateId, // mapping candidateId -> candidate
    interviewer: user._id,
    interviewDate: result.data.interviewDate,
    startTime: result.data.startTime,
    endTime: result.data.endTime,
    type: result.data.type,
    location: result.data.location,
    notes: result.data.notes,
  })

   if (!interview) {
    throw new ApiError(500, "Failed to create interview record")
  }

  return NextResponse.json(new ApiResponse(201, interview, "Interview scheduled!"), { status: 201 })
})

// 2. Get My Schedule (For HR Dashboard)
export const getMySchedule = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)

  const interviews = await Interview.find({ interviewer: user._id })
    .populate("candidate", "name email avatar")
    .populate("job", "title")
    .sort({ interviewDate: 1, startTime: 1 }) // Date wise arrange ho jaye ga

  return NextResponse.json(new ApiResponse(200, interviews, "Schedule fetched!"))
})

// 3. Get Candidate's Schedule (For Candidate Dashboard)
export const getCandidateSchedule = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)

  const interviews = await Interview.find({ candidate: user._id })
    .populate("interviewer", "name email")
    .populate("job", "title company")
    .sort({ interviewDate: 1, startTime: 1 })

  return NextResponse.json(new ApiResponse(200, interviews, "Your schedule fetched!"))
})

// 4. Update Interview Status (HR or Candidate)
export const updateInterviewStatus = asyncHandler(async (req: NextRequest, context?: { params: any }) => {
  await connectDB()
  const user = await verifyJWT(req)

  // 🛠️ FIX: ID body se nahi, URL (context) se lo
  const interviewId = context?.params?.id;

  const body = await req.json();
  const { status, notes } = body;

  const allowedStatuses = ["scheduled", "completed", "cancelled", "rescheduled"]
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value!")
  }

  // Ab interview sahi dhoonde ga
  const interview = await Interview.findById(interviewId)
  if (!interview) throw new ApiError(404, "Interview not found!")

  // Validation: Sirf interviewer ya candidate khud update kar sakta hai
  if (interview.interviewer.toString() !== user._id.toString() && 
      interview.candidate.toString() !== user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this interview!")
  }

  interview.status = status
  if (notes) interview.notes = notes
  await interview.save()

  return NextResponse.json(new ApiResponse(200, interview, "Status updated successfully!"))
})