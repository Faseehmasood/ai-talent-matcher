"use client"

import { Search, MapPin, Briefcase, DollarSign, Filter, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { JobViewAndApplyModal } from "@/components/dashboard/JobViewAndApplyModal"

const activeJobs = [
  {
    id: "J-001",
    title: "Frontend Developer",
    company: "Tech Company",
    location: "Karachi, Pakistan",
    jobType: "Full-time",
    salary: "50k - 80k PKR",
    postedAt: "2 hours ago",
    skills: ["React", "Next.js", "Tailwind"],
    companyLogo: "TC"
  },
  {
    id: "J-002",
    title: "Backend Developer",
    company: "Soft Solutions",
    location: "Lahore, Pakistan",
    jobType: "Remote",
    salary: "100k - 150k PKR",
    postedAt: "5 hours ago",
    skills: ["Node.js", "Express", "MongoDB"],
    companyLogo: "SS"
  },
  {
    id: "J-003",
    title: "UI/UX Designer",
    company: "Creative Studio",
    location: "Islamabad, Pakistan",
    jobType: "Hybrid",
    salary: "70k - 90k PKR",
    postedAt: "1 day ago",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    companyLogo: "CS"
  },
  {
    id: "J-004",
    title: "React Native Developer",
    company: "Mobile Apps Inc.",
    location: "Remote",
    jobType: "Full-time",
    salary: "120k - 180k PKR",
    postedAt: "3 days ago",
    skills: ["React Native", "Firebase", "Redux"],
    companyLogo: "MA"
  }
]

export default function CandidateJobsPage() {
  return (
    <div className="space-y-8">
      {/* Hero / Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Explore Opportunities</h1>
        <p className="text-muted-foreground text-lg">
          Find the perfect role that matches your skills and ambitions.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by job title, keywords or company..." 
            className="w-full pl-10 h-12 rounded-2xl bg-background border border-border px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl gap-2 border-border shadow-sm">
          <Filter className="w-4 h-4" />
          More Filters
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeJobs.map((job) => (
          <Card key={job.id} className="rounded-3xl border-border overflow-hidden hover:border-primary/50 transition-all group shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                {job.companyLogo}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Job Meta Info */}
              <div className="grid grid-cols-2 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary/70" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 text-primary/70" />
                  {job.jobType}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 text-primary/70" />
                  {job.salary}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary/70" />
                  {job.postedAt}
                </div>
              </div>

              {/* Skills Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="rounded-lg font-normal bg-muted/50 border-0">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t border-border p-4">
              <JobViewAndApplyModal job={job} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}