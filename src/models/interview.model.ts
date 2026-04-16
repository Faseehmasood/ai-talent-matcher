import mongoose, { Schema, Document } from "mongoose"

export interface IInterview extends Document {
  job: mongoose.Types.ObjectId
  candidate: mongoose.Types.ObjectId
  interviewer: mongoose.Types.ObjectId
  interviewDate: Date
  startTime: string
  endTime: string
  type: "onsite" | "remote"
  location?: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
}

const interviewSchema = new Schema<IInterview>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    interviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    interviewDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ["onsite", "remote"], default: "onsite" },
    location: { type: String },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    notes: { type: String },
  },
  { timestamps: true }
)

export const Interview = mongoose.models.Interview || mongoose.model<IInterview>("Interview", interviewSchema)