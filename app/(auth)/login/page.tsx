"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Briefcase } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // API call baad mein karenge
    console.log("Login:", email, password)

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="font-bold text-background text-lg">TalentaSync</p>
            <p className="text-xs text-background/60">Your Recruitment Platform</p>
          </div>
        </div>

        {/* Middle Text */}
        <div>
          <h1 className="text-4xl font-bold text-background leading-tight">
            Find the best <br />
            talent for your <br />
            company
          </h1>
          <p className="text-background/60 mt-4 text-sm">
            Streamline your hiring process with AI-powered recruitment tools.
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="flex gap-8">
          <div>
            <p className="text-2xl font-bold text-background">10k+</p>
            <p className="text-xs text-background/60">Active Jobs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-background">50k+</p>
            <p className="text-xs text-background/60">Candidates</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-background">95%</p>
            <p className="text-xs text-background/60">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo — Sirf Mobile Pe */}
          <div className="flex lg:hidden items-center gap-2 mb-22">
            <div className="w-18 h-20 bg-foreground rounded-xl flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-background" />
            </div>
            <div>
              <p className="font-bold text-2xl">TalentaSync</p>
              <p className="text-sm text-muted-foreground">Your Recruitment Platform</p>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground font-bold hover:underline">
    Register here
  </Link>
          </p>

        </div>
      </div>
    </div>
  )
}