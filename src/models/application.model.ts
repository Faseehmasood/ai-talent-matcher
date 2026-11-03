import mongoose, { Schema, Document } from "mongoose"
import { GithubVerificationReport } from "@/src/services/github-verification.agent"
import {
  AIProcessingState,
  AIApplicationAnalysis,
  ExperienceAnalysis,
} from "@/types"

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId
  candidate: mongoose.Types.ObjectId
  resume: string
  coverLetter?: string
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired"
  matchScore?: number
  resumeHash?: string
  extractedGithubUsername?: string
  extractedLinks?: string[]
  ocrUsed?: boolean
  githubVerification?: GithubVerificationReport | null
  aiProcessing?: AIProcessingState
  aiAnalysis?: AIApplicationAnalysis | null
  createdAt: Date
  updatedAt: Date
}

const aiProcessingSchema = new Schema<AIProcessingState>(
  {
    status: {
      type: String,
      enum: [
        "QUEUED",
        "PARSING_PDF",
        "EMBEDDING_CHUNKS",
        "VERIFYING_GITHUB",
        "SCORING_CANDIDATE",
        "COMPLETED",
        "FAILED",
      ],
      default: "QUEUED",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    error: {
      type: String,
    },
    cachedHit: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const experienceAnalysisSchema = new Schema<ExperienceAnalysis>(
  {
    claimedYears: {
      type: Number,
      default: 0,
    },
    relevantYears: {
      type: Number,
      default: 0,
    },
    seniorityFit: {
      type: String,
      enum: ["underqualified", "matched", "overqualified"],
      default: "matched",
    },
    summary: {
      type: String,
      default: "",
    },
  },
  { _id: false }
)

const aiAnalysisSchema = new Schema<AIApplicationAnalysis>(
  {
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    skillsMatchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    experienceRelevanceScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    githubVerificationScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    educationDomainScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingCriticalSkills: {
      type: [String],
      default: [],
    },
    experienceAnalysis: {
      type: experienceAnalysisSchema,
      required: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    redFlags: {
      type: [String],
      default: [],
    },
    executiveSummary: {
      type: String,
      default: "",
    },
    suggestedInterviewQuestions: {
      type: [String],
      default: [],
    },
    githubReport: {
      type: Schema.Types.Mixed,
      default: null,
    },
    rubricVersion: {
      type: String,
      default: "v1",
    },
    jobRequirementsHash: {
      type: String,
      index: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

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
    resumeHash: {
      type: String,
      index: true,
    },
    extractedGithubUsername: {
      type: String,
      default: "",
    },
    extractedLinks: {
      type: [String],
      default: [],
    },
    ocrUsed: {
      type: Boolean,
      default: false,
    },
    githubVerification: {
      type: Schema.Types.Mixed,
      default: null,
    },
    aiProcessing: {
      type: aiProcessingSchema,
      default: () => ({
        status: "QUEUED",
        progress: 0,
        cachedHit: false,
        updatedAt: new Date(),
      }),
    },
    aiAnalysis: {
      type: aiAnalysisSchema,
      default: null,
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
// Optimize Two-Tier SHA-256 cache recovery lookups by resumeHash + jobRequirementsHash
applicationSchema.index({
  resumeHash: 1,
  "aiAnalysis.jobRequirementsHash": 1,
})

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", applicationSchema)
