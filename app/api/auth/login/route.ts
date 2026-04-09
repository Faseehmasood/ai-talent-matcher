import { NextRequest } from "next/server"
import { login } from "@/src/controllers/auth.controller"

export async function POST(req: NextRequest) {
  return login(req)
}