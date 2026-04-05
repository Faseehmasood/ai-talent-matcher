import { NextRequest, NextResponse } from "next/server"
import { ApiError } from "./ApiError"

// Yeh ek function hai jo doosre function ko wrap karta hai
type RouteHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

const asyncHandler = (fn: RouteHandler): RouteHandler => {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      // Asli function chalao
      return await fn(req, context)
    } catch (error) {
      // Agar ApiError hai
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            errors: error.errors,
          },
          { status: error.statusCode }
        )
      }

      // Agar koi aur error hai
      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error",
        },
        { status: 500 }
      )
    }
  }
}

export { asyncHandler }