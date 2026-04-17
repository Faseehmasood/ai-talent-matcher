"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BellRing } from "lucide-react"

export default function CandidateSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Job Settings</h1>
      <Card className="rounded-3xl border-border">
        <CardHeader className="flex flex-row items-center gap-3"><div className="p-2 bg-green-50 rounded-lg"><BellRing className="w-5 h-5 text-green-600" /></div><CardTitle className="text-lg">Job Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
            <div><p className="font-semibold text-sm">Status Updates</p><p className="text-xs text-muted-foreground">Get notified when an HR shortlists you.</p></div>
            <div className="w-10 h-5 bg-green-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}