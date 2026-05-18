"use client"

import { useState } from "react"
import { Search, MapPin, Briefcase, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { IntroAnimation } from "@/components/ui/IntroAnimation"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary: { min: number; max: number; currency: string }
  jobType: string
}

export default function HomeClient({ jobs }: { jobs: Job[] }) {
  const [introComplete, setIntroComplete] = useState(false)

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
              <Button asChild className="rounded-xl font-bold px-6 shadow-xl shadow-primary/20">
                <Link href="/login">Login</Link>
              </Button>
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
                <Link href="/login">View All Jobs <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-medium">
                No jobs posted yet — check back soon.
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <div
                    key={job._id}
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
                        <p className="text-lg font-black text-foreground">
                          {job.salary?.min}k — {job.salary?.max}k {job.salary?.currency}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.jobType}</p>
                      </div>
                      <Button asChild className="rounded-2xl h-12 px-8 font-black shadow-lg shadow-primary/20">
                        <Link href="/login">Apply Now</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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