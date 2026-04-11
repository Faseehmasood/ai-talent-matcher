// Kyun pehle?
// TypeScript ko batana hai data ka structure
// Sab jagah use hoga!

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
  }
  resume: string
  coverLetter?: string
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired"
  matchScore?: number
  createdAt: string
  updatedAt: string
}