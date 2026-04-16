import { NextRequest } from "next/server"
import { getDashboardStats } from "@/src/controllers/stats.controller"

// GET /api/stats -> Dashboard ke numbers laao
export async function GET(req: NextRequest) {
  return getDashboardStats(req)
}