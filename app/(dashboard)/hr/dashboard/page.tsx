import { getDashboardStatsAction } from "@/src/actions/stats.actions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Chart } from "@/components/dashboard/Chart";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { Briefcase, Users, Eye } from "lucide-react";
import { redirect } from "next/navigation";

// ASLI MAGIC: Har baar database se tazza (fresh) data mangwao 
export const revalidate = 0;

export default async function HRDashboardPage() {
  // 1. Database se Parallel ginti mangwao 
  const response = await getDashboardStatsAction();

  // 2. Security Barrier: Agar login nahi hai ya token expire hai 
  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "TOKEN_EXPIRED") {
      redirect("/login");
    }
    // Agar koi aur server error hai toh Next.js error page dikhayega
    throw new Error(response.code || "Failed to load dashboard data");
  }

  // 3. Data Extraction (Safe falling back to 0) 
  const { totalJobs, totalApplications, totalInterviews } = response.stats ?? {
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          HR Overview
        </h1>
        <p className="text-muted-foreground text-sm">
          Real-time recruitment analytics from your database.
        </p>
      </div>

      {/* 4. ASLI STATS CARDS (No Flicker, Direct from Server)  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total opened jobs" 
          value={totalJobs ?? 0} 
          icon={Briefcase} 
        />
        <StatsCard 
          title="Total applicants" 
          value={totalApplications ?? 0} 
          icon={Users} 
        />
        <StatsCard 
          title="Total interviews" 
          value={totalInterviews ?? 0} 
          icon={Eye} 
        />
      </div>

      {/* Analytics Graph (Dummy abhi, wiring baad mein) */}
      <div className="w-full">
        <Chart />
      </div>

      {/* Activity Table (Dummy abhi, wiring baad mein) */}
      <div className="pt-2">
        <RecentApplications />
      </div>
    </div>
  );
}