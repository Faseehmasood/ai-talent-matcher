import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanGithubUsername(raw: string | null | undefined): string {
  if (!raw) return ""
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "")
  cleaned = cleaned.replace(/^[@/]+/, "")
  cleaned = cleaned.replace(/[\/?#].*$/, "")
  return cleaned.trim().replace(/^-+|-+$/g, "")
}

