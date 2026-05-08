import { getAllPlatformJobsAction } from "@/src/actions/job.actions";
import { AdminJobsTable } from "@/components/dashboard/AdminJobsTable";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";

// REASONING: Admin dashboard hamesha live hona chahiye 
export const revalidate = 0;

export default async function AdminJobsPage() {
  // 1. Database se saari jobs mangwayein (Active, Draft, Closed) 
  const response = await getAllPlatformJobsAction();

  // 2. Security: Agar Admin nahi hai toh nikaal do 
  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "FORBIDDEN") {
      redirect("/login");
    }
    throw new Error("Failed to fetch platform jobs");
  }

  const jobs = response.jobs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Platform Jobs</h1>
        <p className="text-muted-foreground text-sm">
          Review and moderate {jobs.length} job postings across TalentaSync.
        </p>
      </div>

      {/*  ASLI DATA TABLE  */}
      <Card className="rounded-[2rem] border-border overflow-hidden shadow-sm bg-card">
        <CardContent className="p-0">
          <AdminJobsTable jobs={jobs} />
        </CardContent>
      </Card>
    </div>
  );
}