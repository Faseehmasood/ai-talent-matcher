import mongoose, { Schema, Document } from "mongoose"

//Typescript interface for application
export interface IApplication extends Document {
  job: mongoose.Types.ObjectId
  candidate: mongoose.Types.ObjectId
  resume: string
  coverLetter?: string
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired"
  matchScore?: number
  createdAt: Date
  updatedAt: Date
}

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job", 
      required: [true, "Job is required"],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "Candidate is required"],
    },
    resume: {
      type: String,
      required: [true, "Resume is required"],
    },
    coverLetter: {
      type: String, 
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    matchScore: {
      type: Number,
      min: 0,   
      max: 100, 
    },
  },
  {
    timestamps: true,
  }
)

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", applicationSchema)