import { NextRequest} from "next/server"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError"

// Token se user ka data nikalna
export const verifyJWT = async (req: NextRequest) => {
  try {
    // Cookie ya Header se token lo
    const token =
      req.cookies.get("accessToken")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "")

    // Token nahi mila
    if (!token) {
      throw new ApiError(401, "Unauthorized - No token provided")
    }

    // Token verify karo
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      _id: string
      email: string
      role: string
    }

    return decodedToken

  } catch (error) {
    // Token expire ya invalid
    if (error instanceof ApiError) throw error
    throw new ApiError(401, "Unauthorized - Invalid token")
  }
}