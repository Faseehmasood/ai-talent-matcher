"use client"
import { Mail, Clock } from "lucide-react"

export default function HREmailTemplatesPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
        <Mail className="w-10 h-10 text-blue-500 opacity-20" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground mt-2">
          Automated communication drafts for candidates.
        </p>
        <p className="mt-4 text-xs font-medium text-muted-foreground/50 italic flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" /> Estimated release: Next Sprint
        </p>
      </div>
    </div>
  )
}