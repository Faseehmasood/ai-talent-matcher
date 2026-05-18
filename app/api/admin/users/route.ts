import { NextRequest } from "next/server"
import { adminCreateUser } from "@/src/controllers/user.controller"

export async function POST(req: NextRequest) {
  return adminCreateUser(req)
}