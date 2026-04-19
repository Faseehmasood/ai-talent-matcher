import { NextRequest } from "next/server"
import { updateAccountDetails } from "@/src/controllers/user.controller"

export async function PATCH(req: NextRequest) {
  return updateAccountDetails(req)
}