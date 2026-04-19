import { NextRequest } from "next/server"
import { changeCurrentPassword } from "@/src/controllers/user.controller"

export async function PATCH(req: NextRequest) {
  return changeCurrentPassword(req)
}