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

// ==================
// TYPE EXPORTS
// ==================
// TypeScript types automatically ban jaate hain! ✅
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>