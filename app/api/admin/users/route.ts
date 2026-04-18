import { NextRequest } from "next/server"
import { adminCreateUser } from "@/src/controllers/user.controller"

// POST /api/admin/users -> Sirf Admin access kar sakay ga
export async function POST(req: NextRequest) {
  return adminCreateUser(req)
}