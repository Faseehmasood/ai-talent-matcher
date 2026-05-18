import { NextRequest } from "next/server"
import { applyForJob } from "@/src/controllers/application.controller"


export async function POST(req: NextRequest) {
  return applyForJob(req)
}