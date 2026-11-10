"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { loginHRAction } from "@/src/actions/auth.actions"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/src/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DEMO_RECRUITERS = [
  {
    company: "Vercel Labs",
    name: "Elena Rostova",
    email: "elena.recruiter@vercel.com",
  },
  {
    company: "Stripe",
    name: "Sarah Jenkins",
    email: "sarah.tech@stripe.com",
  },
  {
    company: "Meta AI",
    name: "Alex Rivera",
    email: "alex.hr@meta.com",
  },
]

export default function HRLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await loginHRAction({ email, password })
      if (response.success && response.user) {
        setAuth(response.user as any)
        router.push("/hr/dashboard")
      } else {
        setErrorMessage(response.message || "Authentication failed")
      }
    } catch {
      setErrorMessage("Network error: Unable to reach authentication server.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (recruiterEmail: string) => {
    setEmail(recruiterEmail)
    setPassword("Password123!")
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background blur effect - exactly matching candidate login & register */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Card - exactly matching platform geometry, borders, radius, and shadows */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-card border border-border rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6"
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
            type="button"
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Header */}
        <div>
          <h2 className="text-2xl font-black tracking-tight">Recruiter Sign In</h2>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your talent pipeline &amp; AI scorecards</p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{errorMessage}</p>
            </div>
            {errorMessage.includes("Candidate Portal") && (
              <Link
                href="/login"
                className="font-bold underline hover:opacity-80 block pl-6"
              >
                Go to Candidate Login &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Work Email</label>
            <Input
              type="email"
              placeholder="recruiter@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-border/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-border/60 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In to Recruiter Console"}
          </Button>
        </form>

        {/* Quick Demo Recruiter Accounts (Sleek grid) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Demo Recruiter Accounts:
            </span>
            <span className="text-[10px] text-muted-foreground">Click to autofill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_RECRUITERS.map((r) => {
              const isSelected = email === r.email
              return (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => handleQuickFill(r.email)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/60 bg-muted/40 hover:bg-muted hover:border-border"
                  }`}
                >
                  <span className="block text-xs font-bold truncate text-foreground leading-snug">
                    {r.company}
                  </span>
                  <span className="block text-[11px] text-muted-foreground truncate">
                    {r.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Candidate Switcher Banner — exact symmetric mirror of candidate login's HR banner */}
        <div className="pt-2 border-t border-border/80">
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">Looking for jobs as an engineer?</span>
              <span className="text-muted-foreground text-[11px] block">Apply to verified tech roles</span>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-xl font-bold shrink-0 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/login">Candidate Login &rarr;</Link>
            </Button>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
