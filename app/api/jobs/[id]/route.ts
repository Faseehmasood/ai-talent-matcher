import { NextRequest } from "next/server"
import {
  getJobById,
  updateJob,
  deleteJob,
} from "@/src/controllers/job.controller"

// GET — Single job dekho
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return getJobById(req, { params })
}

// PUT — Job update karo
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return updateJob(req, { params })
}

// DELETE — Job delete karo
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return deleteJob(req, { params })
}