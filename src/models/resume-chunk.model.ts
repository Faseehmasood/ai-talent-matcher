import mongoose, { Schema, Document } from "mongoose"
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL_VERSION,
} from "@/src/lib/gemini"

export type ResumeSectionType =
  | "summary"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "general"

export interface IResumeChunk extends Document {
  applicationId?: mongoose.Types.ObjectId
  candidateId: mongoose.Types.ObjectId
  jobId?: mongoose.Types.ObjectId
  resumeHash: string
  sectionType: ResumeSectionType
  chunkIndex: number
  chunkText: string
  embedding: number[]
  embeddingModel: string
  extractedLinks: string[]
  extractedGithubUsername?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * ============================================================================
 * MONGODB ATLAS SEARCH INDEX DEFINITIONS (FOR PRODUCTION ATLAS CLUSTER)
 * ============================================================================
 *
 * 1. Atlas Vector Search Index (Name: "resume_vector_index", Collection: "resumechunks"):
 * {
 *   "fields": [
 *     {
 *       "type": "vector",
 *       "path": "embedding",
 *       "numDimensions": 768,
 *       "similarity": "dotProduct"
 *     },
 *     {
 *       "type": "filter",
 *       "path": "candidateId"
 *     },
 *     {
 *       "type": "filter",
 *       "path": "jobId"
 *     },
 *     {
 *       "type": "filter",
 *       "path": "sectionType"
 *     },
 *     {
 *       "type": "filter",
 *       "path": "embeddingModel"
 *     }
 *   ]
 * }
 *
 * 2. Atlas BM25 Full-Text Search Index (Name: "resume_bm25_index", Collection: "resumechunks"):
 * {
 *   "mappings": {
 *     "dynamic": false,
 *     "fields": {
 *       "chunkText": {
 *         "type": "string",
 *         "analyzer": "lucene.standard"
 *       },
 *       "sectionType": {
 *         "type": "string",
 *         "analyzer": "lucene.keyword"
 *       },
 *       "candidateId": {
 *         "type": "objectId"
 *       },
 *       "jobId": {
 *         "type": "objectId"
 *       }
 *     }
 *   }
 * }
 * ============================================================================
 */

const resumeChunkSchema = new Schema<IResumeChunk>(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "candidateId is required"],
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },
    resumeHash: {
      type: String,
      required: [true, "resumeHash (SHA-256) is required"],
      index: true,
    },
    sectionType: {
      type: String,
      enum: ["summary", "experience", "projects", "skills", "education", "general"],
      default: "general",
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 15,
    },
    chunkText: {
      type: String,
      required: [true, "chunkText is required"],
    },
    embedding: {
      type: [Number],
      required: [true, "768-dimensional embedding vector is required"],
      validate: {
        validator: (arr: number[]) =>
          Array.isArray(arr) && arr.length === EMBEDDING_DIMENSIONS,
        message: `Embedding vector must have exactly ${EMBEDDING_DIMENSIONS} dimensions`,
      },
    },
    embeddingModel: {
      type: String,
      default: EMBEDDING_MODEL_VERSION,
      index: true,
    },
    extractedLinks: {
      type: [String],
      default: [],
    },
    extractedGithubUsername: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

// Idempotent deduplication index per candidate + SHA-256 resume hash + chunk index
resumeChunkSchema.index(
  { candidateId: 1, resumeHash: 1, chunkIndex: 1 },
  { unique: true }
)

// Fast lookup by application or job pipeline
resumeChunkSchema.index({ applicationId: 1, chunkIndex: 1 })
resumeChunkSchema.index({ jobId: 1, candidateId: 1 })

export const ResumeChunk =
  mongoose.models.ResumeChunk ||
  mongoose.model<IResumeChunk>("ResumeChunk", resumeChunkSchema)
