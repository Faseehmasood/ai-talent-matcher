import { NextRequest } from "next/server"
import { updateUserAvatar } from "@/src/controllers/user.controller"

export async function PATCH(req: NextRequest) {
  return updateUserAvatar(req)
}