import { NextRequest, NextResponse } from "next/server"
import { scheduleInterview, getMySchedule, getCandidateSchedule } from "@/src/controllers/interview.controller"
import { verifyJWT } from "@/src/middleware/auth"

// GET /api/interviews -> Role ke hisaab se schedule laao
export async function GET(req: NextRequest) {
  const user = await verifyJWT(req); // Token se role nikalo

  if (user.role === "candidate") {
    return getCandidateSchedule(req); // Agar candidate hai toh uska data
  }

  return getMySchedule(req); // Warna HR ka data
}

// POST /api/interviews -> Schedule Interview (HR Only)
export async function POST(req: NextRequest) {
  return scheduleInterview(req);
}