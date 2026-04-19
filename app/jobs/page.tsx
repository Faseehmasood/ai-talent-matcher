"use client"

import { Search, MapPin, Briefcase, DollarSign, Filter, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const allJobs = [
  { id: "J-001", title: "Frontend Developer", company: "Tech Company", location: "Karachi, PK", jobType: "Full-time", salary: "50k - 80k PKR", companyLogo: "TC" },
  { id: "J-002", title: "Backend Developer", company: "Soft Solutions", location: "Lahore, PK", jobType: "Remote", salary: "100k - 150k PKR", companyLogo: "SS" },
  { id: "J-003", title: "UI/UX Designer", company: "Creative Studio", location: "Islamabad, PK", jobType: "Hybrid", salary: "70k - 90k PKR", companyLogo: "CS" },
  // ... aur bhi jobs yahan aayengi
]

export default function PublicJobsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 1. SIMPLE PUBLIC HEADER */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">T</div>
              <span className="font-bold text-lg tracking-tight">TalentaSync</span>
           </Link>
           <Button asChild variant="outline" className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5">
              <Link href="/login">Login to Apply</Link>
           </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* 2. SEARCH & FILTER SECTION */}
        <div className="space-y-4">
           <h1 className="text-4xl font-black tracking-tight">All Open Positions</h1>
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search job title, skills, or company..." className="h-14 pl-12 rounded-2xl bg-card border-border shadow-sm" />
              </div>
              <Button variant="outline" className="h-14 px-8 rounded-2xl gap-2 font-bold border-border">
                <Filter className="w-4 h-4" /> Filters
              </Button>
           </div>
        </div>

        {/* 3. JOBS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {allJobs.map((job) => (
             <Card key={job.id} className="rounded-[2rem] border-border overflow-hidden hover:border-primary/40 transition-all group bg-card/50">
               <CardHeader className="flex flex-row items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-primary">{job.companyLogo}</div>
                 <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
                 </div>
               </CardHeader>
               <CardContent className="grid grid-cols-2 gap-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary/60" /> {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-primary/60" /> {job.jobType}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-primary/60" /> {job.salary}
                  </div>
               </CardContent>
               <CardFooter className="bg-muted/20 p-4 border-t border-border">
                  <Button asChild className="w-full rounded-2xl h-11 font-bold group/btn shadow-md">
                     <Link href="/login">
                        Apply Now <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                     </Link>
                  </Button>
               </CardFooter>
             </Card>
           ))}
        </div>
      </main>
    </div>
  )
}