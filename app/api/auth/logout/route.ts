import { NextRequest } from "next/server"
import { logout } from "@/src/controllers/auth.controller"

export async function POST(req: NextRequest) {
  return logout(req)
}