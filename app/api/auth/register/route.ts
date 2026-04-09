import { NextRequest } from "next/server"
import { register } from "@/src/controllers/auth.controller"

export async function POST(req: NextRequest) {
  return register(req)
}