import { z } from "zod"

/**
 * Escapes special regular expression characters in user input to prevent
 * Regular Expression Denial of Service (ReDoS) and NoSQL regex injection.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Validates that a binary Buffer has a valid PDF magic header (%PDF-)
 * and does not exceed the maximum allowed byte size (default 5MB).
 */
export function validatePdfBuffer(
  buffer: Buffer,
  maxSizeBytes: number = 5 * 1024 * 1024
): { valid: boolean; message?: string } {
  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, message: "Uploaded PDF file is empty." }
  }
  if (buffer.byteLength > maxSizeBytes) {
    return {
      valid: false,
      message: `Resume file size cannot exceed ${Math.round(maxSizeBytes / (1024 * 1024))}MB!`,
    }
  }
  // %PDF- in ASCII hex: 0x25 0x50 0x44 0x46 0x2D
  if (
    buffer.byteLength < 5 ||
    buffer[0] !== 0x25 ||
    buffer[1] !== 0x50 ||
    buffer[2] !== 0x44 ||
    buffer[3] !== 0x46 ||
    buffer[4] !== 0x2d
  ) {
    return {
      valid: false,
      message: "Invalid file content: File is not a genuine PDF document.",
    }
  }
  return { valid: true }
}

/**
 * Validates that a binary Buffer is a genuine PNG, JPEG, or WebP image
 * and does not exceed the maximum allowed byte size (default 2MB).
 */
export function validateImageBuffer(
  buffer: Buffer,
  maxSizeBytes: number = 2 * 1024 * 1024
): { valid: boolean; message?: string } {
  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, message: "Uploaded image file is empty." }
  }
  if (buffer.byteLength > maxSizeBytes) {
    return {
      valid: false,
      message: `Image file size cannot exceed ${Math.round(maxSizeBytes / (1024 * 1024))}MB!`,
    }
  }
  if (buffer.byteLength < 12) {
    return { valid: false, message: "Invalid image file." }
  }

  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50

  if (!isPng && !isJpeg && !isWebp) {
    return {
      valid: false,
      message: "Only valid PNG, JPEG, or WebP images are allowed.",
    }
  }
  return { valid: true }
}

// PUBLIC AUTH VALIDATION (Strictly forbids self-registration as "admin")
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters!")
    .max(50, "Name cannot exceed 50 characters!"),
  email: z.string().trim().email("Invalid email format!"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters!")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase and number!"
    ),
  role: z.enum(["hr", "candidate"]).default("candidate"),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits!")
    .max(15, "Phone number too long!"),
})

// ADMIN-ONLY ACCOUNT CREATION VALIDATION
export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters!")
    .max(50, "Name cannot exceed 50 characters!"),
  email: z.string().trim().email("Invalid email format!"),
  password: z.string().min(8, "Password must be at least 8 characters!"),
  role: z.enum(["admin", "hr", "candidate"]).default("hr"),
})

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format!"),
  password: z.string().min(1, "Password is required!"),
})

// JOB VALIDATIONS
export const createJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters!")
      .max(100, "Title cannot exceed 100 characters!"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters!"),
    company: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters!"),
    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters!"),
    salary: z.object({
      min: z.number().min(0, "Minimum salary cannot be negative!"),
      max: z.number().min(0, "Maximum salary cannot be negative!"),
      currency: z.string().default("USD"),
    }),
    skills: z
      .array(z.string().trim().min(1))
      .min(1, "At least one skill is required!"),
    status: z.enum(["active", "closed", "draft"]).optional(),
    jobType: z.enum(["full-time", "part-time", "remote", "hybrid"]),
  })
  .refine((data) => data.salary.max >= data.salary.min, {
    message: "Maximum salary must be greater than or equal to minimum salary!",
    path: ["salary", "max"],
  })

export const updateJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters!")
    .max(100, "Title cannot exceed 100 characters!")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters!")
    .optional(),
  company: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters!")
    .optional(),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters!")
    .optional(),
  salary: z
    .object({
      min: z.number().min(0, "Minimum salary cannot be negative!"),
      max: z.number().min(0, "Maximum salary cannot be negative!"),
      currency: z.string().default("USD"),
    })
    .optional(),
  skills: z
    .array(z.string().trim().min(1))
    .min(1, "At least one skill is required!")
    .optional(),
  status: z.enum(["active", "closed", "draft"]).optional(),
  jobType: z.enum(["full-time", "part-time", "remote", "hybrid"]).optional(),
})

export const applicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required!"),
  coverLetter: z
    .string()
    .max(1000, "Cover letter cannot exceed 1000 characters!")
    .optional(),
})

export const interviewSchema = z.object({
  jobId: z.string().min(1, "Job ID is required!"),
  candidateId: z.string().min(1, "Candidate ID is required!"),
  interviewDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format! Use YYYY-MM-DD",
  }),
  startTime: z.string().min(1, "Start time is required!"),
  endTime: z.string().min(1, "End time is required!"),
  type: z.enum(["onsite", "remote"]).default("onsite"),
  location: z.string().trim().min(1, "Location (Address or Link) is required!"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters!").optional(),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(150).optional(),
  phoneNumber: z.string().trim().max(15).optional(),
  skills: z.array(z.string().trim()).optional(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "New password must contain uppercase, lowercase and number!"
    ),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
export type InterviewInput = z.infer<typeof interviewSchema>
