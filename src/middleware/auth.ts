import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError"

export const verifyJWT = async (req: NextRequest) => {
  try {
    const token =
      req.cookies.get("accessToken")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "")

    console.log("Token:", token) // Debug ke liye

    if (!token) {
      throw new ApiError(401, "Unauthorized - No token provided")
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as {
      _id: string
      email: string
      role: string
    }

    console.log("Decoded:", decodedToken) // Debug ke liye

    return decodedToken

  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(401, "Unauthorized - Invalid token")
  }
}