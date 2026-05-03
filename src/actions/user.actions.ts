"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model"; // Ensure path is correct
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import { updateProfileSchema, changePasswordSchema } from "@/src/lib/validations";
import { uploadOnCloudinary } from "../utils/cloudinary";

// Environment Variable Safety
const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);


// PRIVATE HELPER: Token Verification

async function verifyToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return { payload: null, error: "UNAUTHORIZED" };

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { payload, error: null };
  } catch {
    return { payload: null, error: "TOKEN_EXPIRED" };
  }
}


// 1. UPDATE PROFILE ACTION 

export async function updateProfileAction(data: any) {
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, message: error || "UNAUTHORIZED" };
    console.log("DATA:", data)           // ← YEH ADD KARO
    console.log("SKILLS:", data.skills)

    // Zod Validation Check
    const result = updateProfileSchema.safeParse(data);
    if (!result.success) return { success: false, message: result.error.issues[0].message };

    //  REASONING: { new: true } use kiya hai taake updated record wapas mile 
    const updatedUser = await User.findByIdAndUpdate(
      payload._id, 
      { $set: result.data }, 
      { new: true } 
    ).select("-password");

    console.log("UPDATED USER SKILLS:", updatedUser?.skills)
    console.log("UPDATED USER:", updatedUser)

    if (!updatedUser) return { success: false, message: "User not found" };

    revalidatePath("/profile"); 
    revalidatePath("/hr/candidates");
    
    //  ASLI KAAM: Naya user data bhej rahe hain taake Zustand update ho sakay
    return { 
      success: true, 
      message: "Profile updated successfully!",
      user: JSON.parse(JSON.stringify(updatedUser)) // Clean for client
    };
  } catch (error: any) {
    return { success: false, message: "Failed to update profile" };
  }
}


// 2. CHANGE PASSWORD ACTION 

export async function changePasswordAction(formData: any) {
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, message: error || "UNAUTHORIZED" };

    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, message: result.error.issues[0].message };
    }

    const { oldPassword, newPassword } = result.data;

    const user = await User.findById(payload._id).select("+password");
    if (!user) return { success: false, message: "User not found" };

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      return { success: false, message: "Old password is incorrect!" };
    }

    user.password = newPassword;
    await user.save(); 

    return { success: true, message: "Password updated successfully!" };

  } catch (error: any) {
    console.error("PASSWORD_CHANGE_ERROR:", error.message);
    return { success: false, message: "Internal Server Error" };
  }
}


// 3. LOGOUT ACTION 

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return { success: true, message: "Logged out successfully" };
}


// 4. UPDATE AVATAR ACTION 

export async function updateUserAvatarAction(formData: FormData) {
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, code: error };

    const avatarFile = formData.get("avatar") as File;
    if (!avatarFile) return { success: false, message: "No file provided" };

    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const avatarUrl = await uploadOnCloudinary(buffer, avatarFile.name);

    if (!avatarUrl) return { success: false, message: "Upload failed" };

    //  REASONING: Photo update ke baad updated user mangwao
    const updatedUser = await User.findByIdAndUpdate(
      payload._id, 
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select("-password");

    revalidatePath("/profile");
    
    return { 
      success: true, 
      avatar: avatarUrl,
      user: JSON.parse(JSON.stringify(updatedUser)) // Zustand sync ke liye
    };
  } catch (error) {
    return { success: false, message: "Server Error" };
  }
}

// Toggle user status (HR/Admin only)

export async function toggleUserStatusAction(userId: string) {
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, message: error || "UNAUTHORIZED" };

    // SECURITY LOCK: Sirf HR ya Admin hi status badal saktay hain
    if (payload.role !== "admin" && payload.role !== "hr") {
      return { success: false, message: "Forbidden: Unauthorized action" };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, message: "User not found" };

    // LOGIC: Status ko toggle karo (true -> false | false -> true) 
    targetUser.isActive = !targetUser.isActive;
    await targetUser.save({ validateBeforeSave: false });

    // Refresh saare relevant pages
    revalidatePath("/hr/candidates");
    revalidatePath("/admin/users");

    return { 
      success: true, 
      message: targetUser.isActive ? "User Activated!" : "User Archived successfully!" 
    };
  } catch (error: any) {
    console.error("TOGGLE_STATUS_ERROR:", error.message);
    return { success: false, message: "Server Error" };
  }
}
