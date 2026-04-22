"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { registerSchema } from "@/src/lib/validations";
import { cookies } from "next/headers";
import { loginSchema } from "@/src/lib/validations";

// REGISTER 

export async function registerUserAction(formData: any) {
  try {
    // 1. Database se rabta karo
    await connectDB();

    // 2. Data check karo (Zod Validation)
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      return { 
        success: false, 
        message: result.error.issues[0].message 
      };
    }

    // 3. Check karo banda pehle se toh nahi hai?
    const { name, email, password, role } = result.data;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { success: false, message: "User with this email already exists!" };
    }

    // 4. Naya user banao 
    // (Model mein humne pehle hi hashing logic likhi hui hai, woh auto-chalegi)
    const newUser = await User.create({
      name,
      email,
      password,
      role
    });

    // 5. Response bhejo (Password hata kar) 
    return {
      success: true,
      message: "Registration successful! You can now login.",
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    };

  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);
    return { success: false, message: "Internal Server Error" };
  }
}




// Login Portion

export async function loginUserAction(formData: any) {
  try {
    await connectDB();

    // 1. Zod Validation Check 
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

    // 2. User dhoondo email se
    const { email, password } = result.data;
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "Invalid email or password!" };
    }

    // 3. Password match karo (Model method use kiya) 
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, message: "Invalid email or password!" };
    }

    // 4. Tokens generate karo 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 5. Database mein Refresh Token save karo
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 6. BROWSER MEIN COOKIES SET KARO
    const cookieStore = await cookies(); 

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 din
      path: "/",
    });

    // 7. Response bhejo (Safe User Object) ✅
    return {
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return { success: false, message: "Something went wrong on the server" };
  }
}