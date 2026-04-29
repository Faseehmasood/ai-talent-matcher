import { getAllActiveJobsAction } from "@/src/actions/job.actions"; // Hamara naya action
import { JobViewAndApplyModal } from "@/components/dashboard/JobViewAndApplyModal";
import { MapPin, Briefcase, DollarSign, Clock, Search, Filter } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

//  FRESH DATA LOGIC
export const revalidate = 0;

export default async function CandidateJobsPage() {
  // 1. Database se asli Active Jobs mangwayein server par
  const response = await getAllActiveJobsAction();

  if (!response.success) {
    throw new Error("Failed to load platform jobs");
  }

  const jobs = response.jobs || [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Explore Opportunities</h1>
        <p className="text-muted-foreground text-sm">Real-time job openings from verified recruiters.</p>
      </div>

      {/* 2. ASLI JOBS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job: any) => (
            <Card key={job._id} className="rounded-[2.5rem] border-border overflow-hidden hover:border-primary/50 transition-all group bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {/* Visual Company Logo (First letter) */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                  {job.company?.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {job.company}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-y-3 border-t border-border/40 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" /> {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" /> {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-primary" /> 
                    {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {job.jobType}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/30 border-t border-border p-4">
                {/* WIRING MODAL: Pass the real job object */}
                <JobViewAndApplyModal job={job} />
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-muted/20 rounded-[3rem] border border-dashed">
             <p className="text-muted-foreground font-medium">No active jobs found at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}