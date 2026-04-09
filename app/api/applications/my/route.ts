import { NextRequest } from "next/server"
import { getMyApplications } from "@/src/controllers/application.controller"

// GET — Apni applications dekho
export async function GET(req: NextRequest) {
  return getMyApplications(req)
}