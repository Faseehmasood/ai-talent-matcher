"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Bell } from "lucide-react"

export default function HRSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">HR Settings</h1>
      <Card className="rounded-3xl border-border">
        <CardHeader className="flex flex-row items-center gap-3"><div className="p-2 bg-muted rounded-lg"><Lock className="w-5 h-5" /></div><CardTitle className="text-lg">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Current</Label><Input type="password" placeholder="••••••••" className="rounded-xl" /></div>
            <div className="space-y-2"><Label>New</Label><Input type="password" placeholder="••••••••" className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Confirm</Label><Input type="password" placeholder="••••••••" className="rounded-xl" /></div>
          </div>
          <Button className="rounded-xl px-6">Update Security</Button>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-border">
        <CardHeader className="flex flex-row items-center gap-3"><div className="p-2 bg-muted rounded-lg"><Bell className="w-5 h-5" /></div><CardTitle className="text-lg">Hiring Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
            <div><p className="font-semibold text-sm">Application Emails</p><p className="text-xs text-muted-foreground">Notify me when someone applies to my jobs.</p></div>
            <div className="w-10 h-5 bg-primary rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}