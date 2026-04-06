import mongoose, { Schema, Document } from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "hr" | "candidate"
  avatar?: string
  refreshToken?: string // ← Naya add kiya
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
  generateAccessToken(): string
  generateRefreshToken(): string 
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "hr", "candidate"],
      default: "candidate",
    },
    avatar: {
      type: String,
    },
    refreshToken: {
      type: String, 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Password encrypt karo save se pehle
userSchema.pre("save", async function(this: IUser) {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Password compare karo
userSchema.methods.comparePassword = async function(
  this: IUser,
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

// Access Token generate karo
userSchema.methods.generateAccessToken = function(this: IUser): string {
  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET as string, 
    {
      expiresIn: "15m", 
    } as jwt.SignOptions
  )
}

// Refresh Token generate karo
userSchema.methods.generateRefreshToken = function(this: IUser): string {
  return jwt.sign(
    {
      _id: this._id.toString(),
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    } as jwt.SignOptions
  )
}

export const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema)