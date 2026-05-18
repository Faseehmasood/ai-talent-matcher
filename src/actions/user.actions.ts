"use server";

import connectDB from "@/src/lib/db";
import { User } from "@/src/models/users.model";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import { updateProfileSchema, changePasswordSchema } from "@/src/lib/validations";
import { uploadOnCloudinary } from "../utils/cloudinary";
import connection from "@/src/lib/db";

const secretKey = process.env.ACCESS_TOKEN_SECRET;
if (!secretKey) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);


 
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


 

export async function updateProfileAction(data: any) {
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, message: error || "UNAUTHORIZED" };
    console.log("DATA:", data)         
    console.log("SKILLS:", data.skills)

    
    const result = updateProfileSchema.safeParse(data);
    if (!result.success) return { success: false, message: result.error.issues[0].message };

     
    const updatedUser = await User.findByIdAndUpdate(
      payload._id, 
      { $set: result.data }, 
      { new: true } 
    ).select("-password");

    if (!updatedUser) return { success: false, message: "User not found" };

    revalidatePath("/profile"); 
    revalidatePath("/hr/candidates");
    
    return { 
      success: true, 
      message: "Profile updated successfully!",
      user: JSON.parse(JSON.stringify(updatedUser)) 
    };
  } catch (error: any) {
    return { success: false, message: "Failed to update profile" };
  }
}


 

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


 

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return { success: true, message: "Logged out successfully" };
}


 

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

     
    const updatedUser = await User.findByIdAndUpdate(
      payload._id, 
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select("-password");

    revalidatePath("/profile");
    
    return { 
      success: true, 
      avatar: avatarUrl,
      user: JSON.parse(JSON.stringify(updatedUser))
    };
  } catch (error) {
    return { success: false, message: "Server Error" };
  }
}



export async function toggleUserStatusAction(userId: string) {
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    if (error || !payload) return { success: false, message: error || "UNAUTHORIZED" };

    if (payload.role !== "admin" && payload.role !== "hr") {
      return { success: false, message: "Forbidden: Unauthorized action" };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, message: "User not found" };

    
    targetUser.isActive = !targetUser.isActive;
    await targetUser.save({ validateBeforeSave: false });

  
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


 

 

export async function getAllUsersAction() {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    
    if (error || !payload || payload.role !== "admin") {
      return { success: false, code: "FORBIDDEN" };
    }

   
    const users = await User.find({ 
        _id: { $ne: payload._id } 
    })
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .lean();

    return {
      success: true,
      users: JSON.parse(JSON.stringify(users))
    };
  } catch (error: any) {
    return { success: false, code: "SERVER_ERROR" };
  }
}


 

export async function adminUpdateUserAction(userId: string, data: { name: string, role: string }) {
  await connection();
  try {
    await connectDB();
    const { payload, error } = await verifyToken();
    
     
    if (error || !payload || payload.role !== "admin") {
      return { success: false, message: "Forbidden" };
    }

   
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name: data.name, role: data.role } },
      { new: true }
    );

    if (!updatedUser) return { success: false, message: "User not found" };

    
    revalidatePath("/admin/users");
    revalidatePath("/hr/candidates");

    return { success: true, message: "User updated successfully!" };
  } catch (error: any) {
    return { success: false, message: "Server Error" };
  }
}


export async function adminCreateUserAction(userData: any) {
  await connection();
  try {
    await connectDB();
    
     
    const { payload, error } = await verifyToken();
    if (error || !payload || payload.role !== "admin") {
      return { success: false, message: "Forbidden: Only Admins can create internal accounts!" };
    }


    const { name, email, password, role } = userData;
    const existingUser = await User.findOne({ email });
    if (existingUser) return { success: false, message: "User with this email already exists!" };

    
 
    const newUser = await User.create({
      name,
      email,
      password, 
      role,
      isVerified: true, 
    });

    
    revalidatePath("/admin/users");

    return { 
      success: true, 
      message: `${role.toUpperCase()} account created for ${name}! 🎊`,
      user: JSON.parse(JSON.stringify(newUser))
    };

  } catch (error: any) {
    console.error("ADMIN_CREATE_USER_ERROR:", error.message);
    return { success: false, message: "Server encountered an error" };
  }
}