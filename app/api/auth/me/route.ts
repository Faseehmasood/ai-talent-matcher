import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/src/lib/auth-server"

export async function GET(req: NextRequest) {
  const session = await verifySession(undefined, req)
  if (!session.success) {
    return NextResponse.json(
      { success: false, code: session.error, message: session.message },
      { status: session.status }
    )
  }

  return NextResponse.json(
    {
      success: true,
      user: session.user,
    },
    { status: 200 }
  )
}
