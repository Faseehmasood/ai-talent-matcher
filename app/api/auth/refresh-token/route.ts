import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  
  const { searchParams } = new URL(req.url);
  const callback = searchParams.get("callback") || "/";

  // Agar refresh token hi nahi hai, toh seedha login
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await connectDB();

    // 1. Verify Refresh Token
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
    
    // 2. Database mein user dhoondo
    const user = await User.findById(payload._id);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new Error("Invalid Session");
    }

    // 3. Naya Access Token generate karo
    const newAccessToken = await new SignJWT({ 
        _id: user._id.toString(), 
        role: user.role, 
        email: user.email 
      })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(JWT_SECRET);

    // 4. Successful Response: Wapas wahi bhejo jahan se user aaya tha ✅
    const response = NextResponse.redirect(new URL(callback, req.url));
    
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.log("REFRESH_ERROR:", error.message);
    const response = NextResponse.redirect(new URL("/login", req.url));
    // Error case mein cookies saaf karo
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}