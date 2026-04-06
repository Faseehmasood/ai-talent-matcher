import mongoose, { Schema, Document } from "mongoose"

// Job ka structure — TypeScript ke liye
export interface IJob extends Document {
  title: string
  description: string
  company: string
  location: string
  salary: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  jobType: "full-time" | "part-time" | "remote" | "hybrid"
  status: "active" | "closed" | "draft"
  postedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Job ka Schema — MongoDB ke liye
const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    salary: {
      min: {
        type: Number,
        required: [true, "Minimum salary is required"],
      },
      max: {
        type: Number,
        required: [true, "Maximum salary is required"],
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    skills: {
      type: [String], // Array of strings
      required: [true, "Skills are required"],
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "hybrid"],
      required: [true, "Job type is required"],
    },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "draft",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User model se connected
      required: [true, "Posted by is required"],
    },
  },
  {
    timestamps: true,
  }
)

export const Job = mongoose.models.Job || 
  mongoose.model<IJob>("Job", jobSchema)