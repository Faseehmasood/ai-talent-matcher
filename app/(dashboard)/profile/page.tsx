"use client"

import { useState } from "react"
import { User, Mail, Shield, Camera, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Card */}
        <Card className="rounded-3xl border-border overflow-hidden h-fit">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-muted">
                <AvatarImage src="" />
                <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">SW</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold">Sophia Williams</h2>
            <p className="text-sm text-muted-foreground capitalize">Administrator</p>
            <div className="mt-6 w-full pt-6 border-t border-border space-y-3">
               <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" /> Two-Factor Enabled
               </div>
               <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Save className="w-3.5 h-3.5" /> Last updated: Today
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Info Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-border">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Sophia Williams" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="sophia@admin.com" disabled className="rounded-xl bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio / Headline</Label>
                <Input defaultValue="Lead Recruiter with 5 years experience" className="rounded-xl" />
              </div>
              <Button className="rounded-xl px-8 gap-2">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border">
            <CardHeader>
              <CardTitle className="text-lg text-red-500">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Button variant="destructive" className="rounded-xl">Delete Account</Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}