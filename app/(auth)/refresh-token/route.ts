import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers"; //  Next.js 15 Headers

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

export async function GET(req: NextRequest) {
  const cookieStore = await cookies(); //  Await cookies
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await connectDB();

    // 1. Refresh Token verify karo
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
    const userId = payload._id as string;

    // 2. User dhoondo
    const user = await User.findById(userId);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new Error("Invalid Session");
    }

    // 3. Naya Access Token banao
    const newAccessToken = await new SignJWT({ 
        _id: user._id.toString(), 
        role: user.role, 
        email: user.email 
      })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(JWT_SECRET);

    // 4. Successful Response 
    const response = NextResponse.next();
    
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;

  } catch (error) {
    console.log("REFRESH_CRASH:", error);
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}