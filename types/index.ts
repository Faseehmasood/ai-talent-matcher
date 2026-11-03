import { GithubVerificationReport } from "@/src/services/github-verification.agent"

export type { GithubVerificationReport }

export type AIProcessingStatus =
  | "QUEUED"
  | "PARSING_PDF"
  | "EMBEDDING_CHUNKS"
  | "VERIFYING_GITHUB"
  | "SCORING_CANDIDATE"
  | "COMPLETED"
  | "FAILED"

export interface AIProcessingState {
  status: AIProcessingStatus
  progress: number
  error?: string
  cachedHit?: boolean
  updatedAt: string | Date
}

export interface ExperienceAnalysis {
  claimedYears: number
  relevantYears: number
  seniorityFit: "underqualified" | "matched" | "overqualified"
  summary: string
}

export interface AIMatchEvaluation {
  matchScore: number
  skillsMatchScore: number
  experienceRelevanceScore: number
  githubVerificationScore: number
  educationDomainScore: number
  matchedSkills: string[]
  missingCriticalSkills: string[]
  experienceAnalysis: ExperienceAnalysis
  strengths: string[]
  redFlags: string[]
  executiveSummary: string
  suggestedInterviewQuestions: string[]
}

export interface AIApplicationAnalysis extends AIMatchEvaluation {
  githubReport?: GithubVerificationReport | null
  rubricVersion?: string
  jobRequirementsHash?: string
  evaluatedAt?: string | Date
}

export interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "hr" | "candidate"
  avatar?: string
}

export interface Job {
  _id: string
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
  postedBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface Application {
  _id: string
  job: Job
  candidate: {
    _id: string
    name: string
    email: string
    avatar?: string
    phoneNumber?: string
  }
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
  createdAt: string
  updatedAt: string
}
