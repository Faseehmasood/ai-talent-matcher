import { Search, MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getAllActiveJobsAction } from "@/src/actions/job.actions"

export const revalidate = 0

export default async function PublicJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; jobType?: string }>
}) {
  const params = await searchParams
  const search = params?.search || ""
  const jobType = params?.jobType || "all"

  const response = await getAllActiveJobsAction(search, jobType)
  const allJobs = response.jobs || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
              T
            </div>
            <span className="font-bold text-lg tracking-tight">TalentaSync</span>
          </Link>
          <Button
            asChild
            variant="outline"
            className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
          >
            <Link href="/login">Login to Apply</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">All Open Positions</h1>
          <form method="GET" action="/jobs" className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search job title, skills, or location..."
                className="h-14 pl-12 rounded-2xl bg-card border-border shadow-sm"
              />
            </div>
            <select
              name="jobType"
              defaultValue={jobType}
              className="h-14 px-4 rounded-2xl bg-card border border-border text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <Button type="submit" className="h-14 px-8 rounded-2xl gap-2 font-bold">
              Search
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allJobs.length > 0 ? (
            allJobs.map((job: any) => {
              const companyName = job.company || job.postedBy?.name || "TalentaSync Partner"
              const logoInitials = companyName.substring(0, 2).toUpperCase()
              const salaryDisplay =
                job.salary?.min || job.salary?.max
                  ? `${job.salary.min?.toLocaleString() || 0} - ${
                      job.salary.max?.toLocaleString() || 0
                    } ${job.salary.currency || "USD"}`
                  : "Competitive"

              return (
                <Card
                  key={job._id}
                  className="rounded-[2rem] border-border overflow-hidden hover:border-primary/40 transition-all group bg-card/50"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-primary">
                      {logoInitials}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">{companyName}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-y-4 pt-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary/60" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground capitalize">
                      <Briefcase className="w-4 h-4 text-primary/60" /> {job.jobType}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground col-span-2">
                      <DollarSign className="w-4 h-4 text-primary/60" /> {salaryDisplay}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 p-4 border-t border-border">
                    <Button asChild className="w-full rounded-2xl h-11 font-bold group/btn shadow-md">
                      <Link href={`/candidate/jobs/${job._id}`}>
                        Apply Now{" "}
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No active job openings match your search criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
