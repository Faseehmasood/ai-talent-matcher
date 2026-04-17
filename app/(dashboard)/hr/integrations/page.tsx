"use client"
import { Plug, Zap } from "lucide-react"

export default function HRIntegrationsPage() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center">
        <Plug className="w-10 h-10 text-orange-500 opacity-20" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">App Integrations</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2">
          <Zap className="w-3 h-3 text-orange-500" /> Connect Zoom, Slack & Google Calendar
        </p>
        <span className="mt-4 inline-block px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coming Soon</span>
      </div>
    </div>
  )
}