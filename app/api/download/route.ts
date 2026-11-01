import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/src/lib/auth-server"
import connectDB from "@/src/lib/db"
import { Application } from "@/src/models/application.model"
import { Job } from "@/src/models/job.model"

const ALLOWED_STORAGE_HOSTS = new Set(["res.cloudinary.com"])

export async function GET(req: NextRequest) {
  const session = await verifySession(["hr", "admin", "candidate"], req)
  if (!session.success) {
    return NextResponse.json(
      { success: false, message: session.message },
      { status: session.status }
    )
  }

  const { searchParams } = new URL(req.url)
  const fileUrl = searchParams.get("url")

  if (!fileUrl) {
    return NextResponse.json(
      { success: false, message: "File URL is required" },
      { status: 400 }
    )
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(fileUrl)
  } catch {
    return NextResponse.json(
      { success: false, message: "Malformed file URL" },
      { status: 400 }
    )
  }

  // Strict SSRF Protection: Enforce HTTPS and Cloudinary hostname allowlist
  if (
    parsedUrl.protocol !== "https:" ||
    !ALLOWED_STORAGE_HOSTS.has(parsedUrl.hostname)
  ) {
    return NextResponse.json(
      {
        success: false,
        code: "FORBIDDEN_STORAGE_HOST",
        message: "Forbidden file storage origin",
      },
      { status: 403 }
    )
  }

  try {
    await connectDB()
    const application = await Application.findOne({ resume: fileUrl })
      .select("candidate job")
      .lean()

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Resume record not found" },
        { status: 404 }
      )
    }

    if (session.user.role === "candidate") {
      if (application.candidate.toString() !== session.user._id) {
        return NextResponse.json(
          { success: false, message: "Forbidden: Not your application resume" },
          { status: 403 }
        )
      }
    } else if (session.user.role === "hr") {
      const job = await Job.findOne({
        _id: application.job,
        postedBy: session.user._id,
      })
        .select("_id")
        .lean()

      if (!job) {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden: Resume does not belong to your job pipeline",
          },
          { status: 403 }
        )
      }
    }

    const upstreamController = new AbortController()
    const timeoutId = setTimeout(() => upstreamController.abort(), 15000)

    const response = await fetch(parsedUrl.toString(), {
      signal: upstreamController.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch resume from storage" },
        { status: 502 }
      )
    }

    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Candidate_Resume.pdf"`,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
