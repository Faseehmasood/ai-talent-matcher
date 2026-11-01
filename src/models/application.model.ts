import mongoose, { Schema, Document } from "mongoose"

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

// Prevent TOCTOU duplicate applications at the storage engine level
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true })
// Optimize HR application pipeline queries sorted by AI matchScore and recency
applicationSchema.index({ job: 1, matchScore: -1, createdAt: -1 })
// Optimize Candidate application history and status dashboard aggregations
applicationSchema.index({ candidate: 1, status: 1, createdAt: -1 })

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", applicationSchema)
