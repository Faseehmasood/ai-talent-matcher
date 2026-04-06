import mongoose, { Schema, Document } from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// User ka structure define karo — TypeScript ke liye
export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "hr" | "candidate"
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Methods
  comparePassword(password: string): Promise<boolean>
  generateAccessToken(): string
}

// User ka Schema — MongoDB ke liye
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,       
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
      required: true,
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


userSchema.pre("save", async function(this: IUser) {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Password check karne ka method
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

// Access Token banana ka method
userSchema.methods.generateAccessToken = function (this: IUser): string {
  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    } as jwt.SignOptions
  )
}

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)