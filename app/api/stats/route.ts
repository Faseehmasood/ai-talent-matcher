import { NextRequest } from "next/server"
import { getDashboardStatsAction } from "@/src/controllers/stats.controller"

export async function GET(req: NextRequest) {
  return Response.json(await getDashboardStatsAction())
}