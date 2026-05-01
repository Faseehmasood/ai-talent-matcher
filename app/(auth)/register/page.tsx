"use client"

import { useState } from "react"
import { registerUserAction } from "@/src/actions/auth.actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Briefcase, UserCircle, UserPlus, Phone, Mail, User } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 1. State mein phoneNumber add kiya ✅
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "", // 🛠️
    role: "candidate"
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await registerUserAction(formData)
      if (response.success) {
        alert("Account created successfully! 🎉")
        router.push("/login") 
      } else {
        alert(response.message)
      }
    } catch (error) {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Side (Wahi purani consistent logic) ... */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 text-background">
         {/* ... Branding Content ... */}
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Create an account</h2>
            <p className="text-muted-foreground mt-2">Enter your details to join TalentaSync.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input required placeholder="John Doe" className="h-12 pl-10 rounded-xl border-border/60" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" required placeholder="name@example.com" className="h-12 pl-10 rounded-xl border-border/60" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            {/* 🛠️ NEW: PHONE NUMBER INPUT ✅ */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input required type="tel" placeholder="+92 300 1234567" className="h-12 pl-10 rounded-xl border-border/60" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="h-12 rounded-xl border-border/60 pr-10" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {/* Role Toggles (Candidate / HR) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => setFormData({...formData, role: "candidate"})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === "candidate" ? "border-primary bg-primary/5 font-bold" : "border-border/40 opacity-60"}`}><UserCircle className="w-4 h-4" /> Candidate</button>
              <button type="button" onClick={() => setFormData({...formData, role: "hr"})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === "hr" ? "border-primary bg-primary/5 font-bold" : "border-border/40 opacity-60"}`}><Briefcase className="w-4 h-4" /> HR Manager</button>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold text-md mt-4 shadow-lg shadow-primary/20">
              {loading ? "Creating Account..." : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-foreground font-bold hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}