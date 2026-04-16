import { NextRequest } from "next/server"
import { getChartStats } from "@/src/controllers/stats.controller"

export async function GET(req: NextRequest) {
  return getChartStats(req)
}