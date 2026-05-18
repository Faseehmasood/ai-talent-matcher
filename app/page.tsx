"use client"

import { useState } from "react"
import { Search, MapPin, Briefcase, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { IntroAnimation } from "@/components/ui/IntroAnimation"

const featuredJobs = [
  { id: "1", title: "Senior React Developer", company: "TechFlow", location: "Remote", salary: "120k-150k", type: "Full-time" },
  { id: "2", title: "UI/UX Product Designer", company: "Creative Minds", location: "Karachi, PK", salary: "80k-100k", type: "Onsite" },
  { id: "3", title: "Backend Engineer", company: "Secure Systems", location: "Lahore, PK", salary: "110k-140k", type: "Hybrid" },
]

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <>
      {!introComplete ? (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      ) : (
        <div className="min-h-screen bg-background text-foreground">

          {/* NAVBAR */}
          <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-background font-black text-sm tracking-tighter">TS</span>
                </div>
                <span className="font-bold text-xl tracking-tighter">TalentaSync</span>
              </div>

              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" className="rounded-xl font-bold">
                  <Link href="/login">Login</Link>
                </Button>

                        <Button
            type="button"
            variant="outline"
            className="w-35% h-11 rounded-xl flex items-center gap-3 cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
              </div>
            </div>
          </nav>

          {/* HERO SECTION */}
          <section className="relative pt-20 pb-32 px-6 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-3xl rounded-full -z-10 opacity-50" />

            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5">
                <Sparkles className="w-3 h-3 mr-2 fill-primary" />
                AI-Driven Recruitment Platform
              </Badge>

              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-foreground">
                The smartest way to <br />
                <span className="text-primary">hire and get hired.</span>
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                TalentaSync connects top companies with world-class talent through a seamless, automated, and beautiful experience.
              </p>

              <div className="max-w-2xl mx-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search roles like 'React Developer'..."
                  className="h-16 pl-12 rounded-[1.5rem] border-border bg-card shadow-2xl text-md focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </section>

          {/* FEATURED JOBS */}
          <section className="max-w-5xl mx-auto px-6 pb-32">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Recent Opportunities</h2>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Global Listings</p>
              </div>
              <Button asChild variant="link" className="font-bold text-primary gap-2">
                <Link href="/jobs">View All Jobs <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {featuredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 bg-card border border-border rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:border-primary/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center font-black text-muted-foreground text-2xl shadow-inner">
                      {job.company.substring(0, 1)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-x-4 text-sm font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.company}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-lg font-black text-foreground">{job.salary}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.type}</p>
                    </div>
                    <Button asChild className="rounded-2xl h-12 px-8 font-black shadow-lg shadow-primary/20">
                      <Link href="/login">Apply Now</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-16 border-t border-border bg-muted/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
                <span className="text-background font-black text-[9px]">TS</span>
              </div>
              <span className="font-bold text-sm tracking-tighter">TalentaSync</span>
            </div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026 Crafted with Passion for Recruitment</p>
          </footer>

        </div>
      )}
    </>
  )
}
