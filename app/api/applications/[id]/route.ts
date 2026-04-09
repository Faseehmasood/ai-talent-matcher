import { NextRequest } from "next/server"
import { getJobApplications } from "@/src/controllers/application.controller"

// GET — Job ki applications dekho (HR)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return getJobApplications(req, { params })
}