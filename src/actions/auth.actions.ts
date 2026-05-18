"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { registerSchema } from "@/src/lib/validations";
import { cookies } from "next/headers";
import { loginSchema } from "@/src/lib/validations";
import { createNotification } from "./notification.actions";
import { RegisterInput, LoginInput} from "@/src/lib/validations"

 

export async function registerUserAction(formData: RegisterInput) {
  try {
  
    await connectDB();

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      return { 
        success: false, 
        message: result.error.issues[0].message 
      };
    }

    const { name, email, password, role, phoneNumber } = result.data;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { success: false, message: "User with this email already exists!" };
    }


    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      
    });

    if(newUser.role === "hr"){
      const admin=await User.findOne({role:"admin"});
      await createNotification({        recipient: admin._id.toString(),
      sender: newUser._id.toString(),
      message: `New HR Registered: ${newUser.name} is waiting for review.`,
      link: "/admin/users",
      type: "info"
    });
    }

 
    return {
      success: true,
      message: "Registration successful! You can now login.",
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber
      }
    };

  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);
    return { success: false, message: "Internal Server Error" };
  }
}




 

export async function loginUserAction(formData: LoginInput) {
  try {
    await connectDB();

    
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

 
    const { email, password } = result.data;
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "Invalid email or password!" };
    }

 
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, message: "Invalid email or password!" };
    }

   
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });


    const cookieStore = await cookies(); 

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, 
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

     
    return {
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        
        avatar: user.avatar || "",           
        bio: user.bio || "",                 
        phoneNumber: user.phoneNumber || "",
        skills: user.skills || [], 
      }
    };

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return { success: false, message: "Something went wrong on the server" };
  }
}