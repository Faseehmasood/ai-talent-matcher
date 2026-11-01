import mongoose, { Schema, Document } from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "hr" | "candidate"
  avatar?: string
  refreshToken?: string
  isGoogleUser?: boolean
  needsRoleSelection?: boolean
  isActive: boolean
  bio?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
  skills?: string[]
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
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    needsRoleSelection: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      maxlength: [150, "Bio cannot exceed 150 characters"],
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

userSchema.index({ role: 1, isActive: 1, createdAt: -1 })

userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (
  this: IUser,
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (this: IUser): string {
  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email,
      role: this.role,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15m",
    } as jwt.SignOptions
  )
}

userSchema.methods.generateRefreshToken = function (this: IUser): string {
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
  mongoose.models.User || mongoose.model<IUser>("User", userSchema)
