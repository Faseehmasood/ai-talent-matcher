"use client"

import { useState } from "react"
import { adminCreateUserAction } from "@/src/actions/user.actions" 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Lock, UserCog, Loader2, ShieldCheck } from "lucide-react"

export function AddUserModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "Staff123!",
    role: "hr"
  })

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      return alert("Please fill in all required fields!")
    }

    setLoading(true)
    try {
      const response = await adminCreateUserAction(formData)

      if (response.success) {
        alert(response.message)
        setOpen(false) 
        setFormData({ name: "", email: "", password: "Staff123!", role: "hr" }) 
      } else {
        alert("Error: " + response.message)
      }
    } catch (error) {
      alert("Something went wrong on the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
  
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl gap-2 border-border shadow-sm hover:bg-muted transition-all">
          <UserPlus className="w-4 h-4" /> 
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-border shadow-2xl bg-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 text-primary border border-primary/20">
              <UserCog className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Create Internal Account</DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Manually add a staff member or verified partner to the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {/* full name */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <UserPlus className="w-3 h-3" /> Full Name
              </Label>
              <Input 
                required
                placeholder="e.g. Ali Ahmed"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20" 
              />
            </div>

            {/* email input */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" /> Office Email
              </Label>
              <Input 
                type="email"
                required
                placeholder="ali@talentsync.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20" 
              />
            </div>

            {/* Role selection  */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> System Role
              </Label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="flex h-11 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="hr">HR Manager (Recruiter)</option>
                <option value="admin">Platform Admin (God Mode)</option>
                <option value="candidate">Candidate (Manual Entry)</option>
              </select>
            </div>

            {/* Temporary password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" /> Temporary Password
              </Label>
              <Input 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="rounded-xl h-11 font-mono border-border/60 focus-visible:ring-primary/20" 
              />
              <p className="text-[10px] text-muted-foreground italic px-1">*User should change this after first login.</p>
            </div>
          </div>

          <DialogFooter className="border-t pt-6 border-border/50">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl font-bold">
               Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="rounded-xl px-10 font-black shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}