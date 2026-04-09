import { NextRequest } from "next/server"
import { refreshAccessToken } from "@/src/controllers/auth.controller"

export async function POST(req: NextRequest) {
  return refreshAccessToken(req)
}