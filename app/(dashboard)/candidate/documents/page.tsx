"use client"
import { FolderLock, Sparkles, FileStack } from "lucide-react"

export default function CandidateDocumentsPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto">
      {/* Icon Stack for a premium look */}
      <div className="relative">
        <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center rotate-6">
           <FileStack className="w-10 h-10 text-green-600 opacity-20 -rotate-6" />
        </div>
        <div className="absolute inset-0 w-24 h-24 bg-green-100/50 rounded-[2.5rem] flex items-center justify-center -rotate-3 transition-transform hover:rotate-0">
           <FolderLock className="w-10 h-10 text-green-600" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents Vault</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your personal library for Resumes, Portfolio links, and Experience Certificates is coming soon.
        </p>
      </div>

      {/* Feature Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        {["Resume storage", "Quick Apply", "Cloud Backup"].map((tag) => (
          <span key={tag} className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-4 flex items-center gap-2 text-green-600 font-bold text-xs">
        <Sparkles className="w-4 h-4 animate-pulse" />
        Coming in Phase 2 Upgrade
      </div>
    </div>
  )
}