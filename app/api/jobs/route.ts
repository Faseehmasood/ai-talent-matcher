import { NextRequest } from "next/server"
import { createJob, getAllJobs } from "@/src/controllers/job.controller"

// GET — Sab jobs dekho (Public)
export async function GET(req: NextRequest) {
  return getAllJobs(req)
}

// POST — Job banao (Sirf HR)
export async function POST(req: NextRequest) {
  return createJob(req)
}