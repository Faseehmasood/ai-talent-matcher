"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Briefcase } from "lucide-react"
import Link from "next/link"
import { loginUserAction } from "@/src/actions/auth.actions"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/src/store/useAuthStore"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const response = await loginUserAction({ email, password })

    if (response.success && response.user) {
      setAuth(response.user as any)
      const role = response.user.role
      if (role === "admin") router.push("/admin/dashboard")
      else if (role === "hr") router.push("/hr/dashboard")
      else router.push("/candidate/dashboard")
    } else {
      alert(response.message)
    }
    setLoading(false)
  }

  // const handleGoogleLogin = () => {
  //   window.location.href = "/api/auth/google"
  // }

  return (
    <div className="min-h-screen flex">

    
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="font-bold text-background text-lg">TalentaSync</p>
            <p className="text-xs text-background/60">Your Recruitment Platform</p>
          </div>
        </div>

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

    
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-22">
            <div className="w-18 h-20 bg-foreground rounded-xl flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-background" />
            </div>
            <div>
              <p className="font-bold text-2xl">TalentaSync</p>
              <p className="text-sm text-muted-foreground">Your Recruitment Platform</p>
            </div>
          </div>

          
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

        
          <form onSubmit={handleLogin} className="space-y-4">

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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

          </form>

          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          {/* <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl flex items-center gap-3"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button> */}

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