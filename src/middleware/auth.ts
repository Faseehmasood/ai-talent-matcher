import { NextRequest } from "next/server"
import { ApiError } from "../utils/ApiError"
import { verifySession, AuthenticatedUser } from "../lib/auth-server"

export const verifyJWT = async (req: NextRequest): Promise<AuthenticatedUser> => {
  const session = await verifySession(undefined, req)
  if (!session.success) {
    throw new ApiError(session.status, session.message)
  }
  return session.user
}
