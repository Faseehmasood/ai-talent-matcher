"use client"
import { FileText, Lock } from "lucide-react"

export default function HRDocumentsPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center">
        <FileText className="w-10 h-10 text-primary opacity-20" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Documents Library</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2">
          <Lock className="w-3 h-3" /> Under Development - Coming in Phase 2
        </p>
      </div>
    </div>
  )
}