import { NextRequest, NextResponse } from "next/server"
import { Job } from "@/src/models/job.model"
import { Application } from "@/src/models/application.model"
import { Interview } from "@/src/models/interview.model"
import { User } from "@/src/models/users.model"
import { ApiResponse } from "@/src/utils/ApiResponse"
import { ApiError } from "@/src/utils/ApiError"
import { asyncHandler } from "@/src/utils/asyncHandler"
import { verifyJWT } from "@/src/middleware/auth"
import connectDB from "@/src/lib/db"

export const getDashboardStats = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)

  // 1. Security Check: Sirf HR aur Admin allowed hain
  if (user.role !== "admin" && user.role !== "hr") {
    throw new ApiError(403, "Only HR and Admin can access dashboard stats!")
  }

  // 2. Logic for Admin
  if (user.role === "admin") {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalJobs: await Job.countDocuments(),
      totalApplications: await Application.countDocuments(),
    }
    return NextResponse.json(new ApiResponse(200, stats, "Admin Stats fetched!"))
  }

  // 3. Logic for HR (Agar yahan tak pohancha hai toh matlab HR hi hai)
  const myJobs = await Job.find({ postedBy: user._id }).select("_id")
  const jobIds = myJobs.map(job => job._id)

  const stats = {
    totalJobs: myJobs.length,
    totalApplications: await Application.countDocuments({ job: { $in: jobIds } }),
    totalInterviews: await Interview.countDocuments({ interviewer: user._id }),
  }

  return NextResponse.json(new ApiResponse(200, stats, "HR Stats fetched!"))
})

// 🛠️ Yahan hum MongoDB Aggregation use kar rahe hain (Advanced Data Mining)
export const getChartStats = asyncHandler(async (req: NextRequest) => {
  await connectDB()
  const user = await verifyJWT(req)

  // Security: Sirf HR aur Admin stats dekh saken
  if (user.role !== "hr" && user.role !== "admin") {
    throw new ApiError(403, "Not authorized!")
  }

  // 1. Pehle HR ki saari Jobs ki IDs nikaalo (Scaling logic)
  const myJobs = await Job.find({ postedBy: user._id }).select("_id")
  const jobIds = myJobs.map(job => job._id)

  // 2. Aggregation Pipeline (Asli Magic ✨)
  const chartData = await Application.aggregate([
    {
      // Stage 1: Sirf woh applications lo jo is HR ki jobs par hain
      $match: { job: { $in: jobIds } }
    },
    {
      // Stage 2: Har application ki 'createdAt' date se Mahina (Month) nikalo
      $group: {
        _id: { $month: "$createdAt" }, // 1 for Jan, 2 for Feb etc.
        count: { $sum: 1 }             // Har record par +1 karo
      }
    },
    {
      // Stage 3: Results ko Month ke hisaab se seedha (Sort) karo
      $sort: { "_id": 1 }
    }
  ])

  // Month numbers (1, 2) ko Names (Jan, Feb) mein badalne ke liye:
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  const formattedData = chartData.map(item => ({
    month: monthNames[item._id - 1],
    applicants: item.count
  }))

  return NextResponse.json(
    new ApiResponse(200, formattedData, "Chart data fetched successfully!")
  )
})