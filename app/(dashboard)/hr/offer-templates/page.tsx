"use client"
import { FileEdit, Sparkles } from "lucide-react"

export default function HROfferTemplatesPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center">
        <FileEdit className="w-10 h-10 text-purple-500 opacity-20" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Offer Templates</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage professional offer letter drafts.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-purple-600 font-bold text-sm">
          <Sparkles className="w-4 h-4" /> Feature in Progress
        </div>
      </div>
    </div>
  )
}