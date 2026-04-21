"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { registerSchema } from "@/src/lib/validations";

// REGISTER ACTION 
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