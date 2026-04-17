"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Globe, Eye } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Security / Password Section */}
        <Card className="rounded-3xl border-border">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg font-semibold">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" />
              </div>
            </div>
            <Button className="rounded-xl px-6">Update Password</Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="rounded-3xl border-border">
          <CardHeader className="flex flex-row items-center gap-3">
             <div className="p-2 bg-muted rounded-lg">
               <Bell className="w-5 h-5" />
             </div>
             <CardTitle className="text-lg font-semibold">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
              <div>
                <p className="font-semibold text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates about your job applications via email.</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                 <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
              <div>
                <p className="font-semibold text-sm">Interview Reminders</p>
                <p className="text-xs text-muted-foreground">Get notified 1 hour before an interview starts.</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                 <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}