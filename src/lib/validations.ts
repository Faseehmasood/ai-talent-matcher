import { z } from "zod"

// ==================
// AUTH VALIDATIONS
// ==================
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters!")
    .max(50, "Name cannot exceed 50 characters!"),
  email: z
    .string()
    .email("Invalid email format!"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters!")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase and number!"
    ),
  role: z
    .enum(["admin", "hr", "candidate"])
    .default("candidate"),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format!"),
  password: z
    .string()
    .min(1, "Password is required!"),
})

// ==================
// JOB VALIDATIONS
// ==================
export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters!")
    .max(100, "Title cannot exceed 100 characters!"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters!"),
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters!"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters!"),
  salary: z.object({
    min: z.number().min(0, "Minimum salary cannot be negative!"),
    max: z.number().min(0, "Maximum salary cannot be negative!"),
    currency: z.string().default("USD"),
  }),
  skills: z
    .array(z.string())
    .min(1, "At least one skill is required!"),
  status: z.enum(["active", "closed", "draft"]).optional(),
  jobType: z.enum([
    "full-time",
    "part-time", 
    "remote",
    "hybrid"
  ]),
})

export const updateJobSchema = createJobSchema.partial()
// .partial() = Sab fields optional ho jaate hain! ✅

// ==================
// APPLICATION VALIDATIONS
// ==================
export const applicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required!"),
  coverLetter: z
    .string()
    .max(1000, "Cover letter cannot exceed 1000 characters!")
    .optional(),
})

// Interview Validations

export const interviewSchema = z.object({
  jobId: z.string().min(1, "Job ID is required!"),
  candidateId: z.string().min(1, "Candidate ID is required!"),
  interviewDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format! Use YYYY-MM-DD",
  }),
  startTime: z.string().min(1, "Start time is required!"), // e.g. "09:00"
  endTime: z.string().min(1, "End time is required!"),   // e.g. "09:30"
  type: z.enum(["onsite", "remote"]).default("onsite"), 
  location: z.string().min(1, "Location (Address or Link) is required!"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters!").optional(),
})




// ==================
// TYPE EXPORTS
// ==================
// TypeScript types automatically ban jaate hain! ✅
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
export type InterviewInput = z.infer<typeof interviewSchema>



// 1. Profile Update (Text only)
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(150).optional(),
  phoneNumber: z.string().optional(),
})

// 2. Password Change
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})