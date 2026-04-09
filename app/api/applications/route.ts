import { NextRequest } from "next/server"
import { applyForJob } from "@/src/controllers/application.controller"

// POST — Job ke liye apply karo
export async function POST(req: NextRequest) {
  return applyForJob(req)
}