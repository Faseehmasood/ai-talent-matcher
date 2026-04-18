"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, ShieldCheck, Mail, Lock, UserCog } from "lucide-react"

export function AddUserModal() {
  const [loading, setLoading] = useState(false)

  // Form handle karne ka function (Abhi sirf console log kare ga)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log("Creating new internal user...")
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <Dialog>
      {/* 1. Trigger Button - Jo Navbar mein nazar aaye ga */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl gap-2 border-border shadow-sm hover:bg-muted transition-all">
          <UserPlus className="w-4 h-4" /> 
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </DialogTrigger>

      {/* 2. Modal Content */}
      <DialogContent className="sm:max-w-[450px] rounded-3xl border-border shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 text-primary">
            <UserCog className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Create Internal Account</DialogTitle>
          <DialogDescription>
            Add a staff member or trusted HR partner to the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="staff-name">Full Name</Label>
            <Input id="staff-name" placeholder="e.g. Ali Ahmed" required className="rounded-xl h-11 border-border/60" />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="staff-email">Office Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="staff-email" type="email" placeholder="name@company.com" required className="pl-10 rounded-xl h-11 border-border/60" />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>System Role</Label>
            <select className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer">
              <option value="hr">HR Manager (Recruitment)</option>
              <option value="admin">Sub-Admin (Platform Control)</option>
              <option value="candidate">Candidate (Manual Entry)</option>
            </select>
          </div>

          {/* Temporary Password */}
          <div className="space-y-2">
            <Label htmlFor="staff-pass">Temporary Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="staff-pass" type="text" defaultValue="Pass@1234" required className="pl-10 rounded-xl h-11 font-mono border-border/60" />
            </div>
            <p className="text-[10px] text-muted-foreground italic px-1">*User can change this password after their first login.</p>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button variant="ghost" type="button" className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl px-8 font-bold" disabled={loading}>
              {loading ? "Processing..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}