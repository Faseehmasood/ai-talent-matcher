import { NextRequest } from "next/server"
import { updateApplicationStatus } from "@/src/controllers/application.controller"

// PATCH — Status update karo (HR)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return updateApplicationStatus(req, { params })
}