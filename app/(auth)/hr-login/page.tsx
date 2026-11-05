"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Cpu,
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import { loginHRAction } from "@/src/actions/auth.actions"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/src/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DEMO_RECRUITERS = [
  {
    company: "Vercel Partner Labs",
    name: "Elena Rostova",
    email: "elena.recruiter@vercel.com",
    role: "Staff Technical Recruiter",
  },
  {
    company: "Stripe",
    name: "Sarah Jenkins",
    email: "sarah.tech@stripe.com",
    role: "Head of Tech Talent",
  },
  {
    company: "Meta AI",
    name: "Alex Rivera",
    email: "alex.hr@meta.com",
    role: "Principal AI Partner",
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
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background ambient enterprise glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-cyan-600/10 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid lg:grid-cols-12"
      >
        {/* Left Side: Enterprise Feature Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Top Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white block">
                  TalentaSync
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block -mt-1">
                  Recruiter Command Center
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Enterprise Portal
              </span>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                Autonomous AI Hiring Intelligence
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empower your hiring team with real-time code verification, 768-d semantic vector matching, and zero-hallucination scorecards.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-750">
                <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">Autonomous GitHub Audits</span>
                  <span className="text-slate-400">Gemini 2.5 Flash live code verification & claim checks.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-750">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">Deterministic Scoring Engine</span>
                  <span className="text-slate-400">Strictly weighted technical, experience & education metrics.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Recruiter Selector for 1-Click Testing */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Test Recruiter Logins (Click to autofill):
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_RECRUITERS.map((r) => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => handleQuickFill(r.email)}
                  className="text-left px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/40 text-xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-300 block">
                      {r.name} · {r.company}
                    </span>
                    <span className="text-[10px] text-slate-400">{r.email}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Fill →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Recruiter Sign-In Form */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Recruiter Portal Access
              </h2>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> B2B Hiring Console
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Please enter your authorized corporate recruiter credentials.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-3 text-rose-200 text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMessage}</p>
                {errorMessage.includes("Candidate Portal") && (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 font-bold text-rose-300 underline hover:text-white"
                  >
                    Go to Candidate Login <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Corporate Work Email
              </label>
              <Input
                type="email"
                placeholder="elena.recruiter@vercel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-950/70 border-slate-750 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
                </label>
                <span className="text-[11px] text-slate-500">Default: Password123!</span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-slate-950/70 border-slate-750 text-white placeholder:text-slate-500 pr-12 focus-visible:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/25 transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating Recruiter Session...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Recruiter Console <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Switch to Candidate Login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Looking for open jobs as an engineer or candidate?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300 underline ml-1 inline-flex items-center gap-1"
              >
                Go to Candidate Portal <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
