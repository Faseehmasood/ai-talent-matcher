"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, X, User, Mail, Phone, Briefcase, UserCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { registerUserAction } from "@/src/actions/auth.actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "candidate"
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await registerUserAction({
        ...formData,
        role: formData.role as "admin" | "hr" | "candidate"
      })
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      {/* Background blur effect */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-card border border-border rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6"
      >
        {/* Top Row — Logo + Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-background font-black text-sm tracking-tighter">TS</span>
            </div>
            <span className="font-black text-lg tracking-tighter">TalentaSync</span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Header */}
        <div>
          <h2 className="text-2xl font-black tracking-tight">Create an account</h2>
          <p className="text-muted-foreground text-sm mt-1">Join TalentaSync today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                required
                placeholder="John Doe"
                className="h-12 pl-10 rounded-xl border-border/60"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                required
                placeholder="name@example.com"
                className="h-12 pl-10 rounded-xl border-border/60"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                required
                placeholder="+92 300 1234567"
                className="h-12 pl-10 rounded-xl border-border/60"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="h-12 rounded-xl border-border/60 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: "candidate"})}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                formData.role === "candidate"
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/40 opacity-60 hover:opacity-100"
              }`}
            >
              <UserCircle className="w-4 h-4" /> Candidate
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: "hr"})}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                formData.role === "hr"
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/40 opacity-60 hover:opacity-100"
              }`}
            >
              <Briefcase className="w-4 h-4" /> HR Manager
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            {loading ? "Creating Account..." : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
          </Button>

        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-black hover:underline">
            Sign In
          </Link>
        </p>

      </motion.div>
    </div>
  )
}