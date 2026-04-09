import { NextRequest } from "next/server"
import { getMyJobs } from "@/src/controllers/job.controller"

export async function GET(req: NextRequest) {
  return getMyJobs(req)
}