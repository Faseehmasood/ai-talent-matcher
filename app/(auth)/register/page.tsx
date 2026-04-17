"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Briefcase, UserCircle, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate"
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Integration baad mein karenge, abhi sirf console log
    console.log("Register Data:", formData)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div className="min-h-screen flex">
      
      {/* Left Side — Branding (Same as Login for consistency) */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 text-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="font-bold text-lg">TalentaSync</p>
            <p className="text-xs opacity-60">Your Recruitment Partner</p>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Start your <br />
            journey with <br />
            us today.
          </h1>
          <p className="opacity-60 mt-6 text-lg max-w-md">
            Join thousands of professionals and companies finding their perfect match on our AI-powered platform.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <p className="text-2xl font-bold">100%</p>
            <p className="text-xs opacity-60">Secure Data</p>
          </div>
          <div>
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-xs opacity-60">Smart Support</p>
          </div>
        </div>
      </div>

      {/* Right Side — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center text-background font-bold">T</div>
            <p className="font-bold text-sm">TalentaSync</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground mt-2">Enter your details to get started.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                className="h-12 rounded-xl"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                className="h-12 rounded-xl"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection (Professional Look) */}
            <div className="space-y-2">
              <Label>Register as</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: "candidate"})}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.role === "candidate" ? "border-primary bg-primary/5 font-bold" : "border-border opacity-60"
                  }`}
                >
                  <UserCircle className="w-4 h-4" /> Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: "hr"})}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.role === "hr" ? "border-primary bg-primary/5 font-bold" : "border-border opacity-60"
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> HR Manager
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-md font-semibold gap-2" disabled={loading}>
              {loading ? "Creating account..." : (
                <>
                  <UserPlus className="w-4 h-4" /> Sign Up
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-foreground font-bold hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}