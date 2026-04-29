import { getDashboardStatsAction } from "@/src/actions/stats.actions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";
import { redirect } from "next/navigation";


export const revalidate = 0;

export default async function CandidateDashboardPage() {
  const response = await getDashboardStatsAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "TOKEN_EXPIRED") {
      redirect("/login");
    }
    throw new Error(response.code || "Failed to load stats");
  }

  //  DATA EXTRACTION 
  const { totalApplied, shortlisted, pending, rejected } = response.stats || {
    totalApplied: 0,
    shortlisted: 0,
    pending: 0,
    rejected: 0
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm">Quick overview of your application status.</p>
      </div>

      {/*  ASLI CARDS WITH REJECTED/PENDING  */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Applied" 
          value={totalApplied ?? 0} 
          icon={Briefcase} 
        />
        <StatsCard 
          title="Shortlisted" 
          value={shortlisted ?? 0} 
          icon={CheckCircle} 
        />
        <StatsCard 
          title="In Review (Pending)" 
          value={pending ?? 0} 
          icon={Clock} 
        />
        <StatsCard 
          title="Rejected" 
          value={rejected ?? 0} 
          icon={XCircle} 
        />
      </div>
    </div>
  );
}