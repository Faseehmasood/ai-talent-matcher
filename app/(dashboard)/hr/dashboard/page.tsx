import { getDashboardStatsAction } from "@/src/actions/stats.actions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Chart } from "@/components/dashboard/Chart";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { Briefcase, Users, Eye } from "lucide-react";
import { redirect } from "next/navigation";

//  ASLI MAGIC: Har baar database se tazza (fresh) data mangwao 
export const revalidate = 0;

export default async function HRDashboardPage() {
  // 1. Database se poora data parallel mangwao 
  const response = await getDashboardStatsAction();

  // 2. Security Barrier: Failure cases handle karo 
  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "TOKEN_EXPIRED") {
      redirect("/login");
    }
    // Kisi aur server error ke liye Next.js ka error.tsx trigger hoga
    throw new Error(response.code || "Failed to load dashboard data");
  }

  // 3. Data Extraction (TypeScript Safe) 
  const stats = response.stats || {
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
  };

  const chartData = response.chartData || [];
  const recentApps = response.recentApplications || [];

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

      {/* 4. ASLI STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total opened jobs" 
          value={stats.totalJobs || 0} 
          icon={Briefcase} 
        />
        <StatsCard 
          title="Total applicants" 
          value={stats.totalApplications || 0} 
          icon={Users} 
        />
        <StatsCard 
          title="Total interviews" 
          value={stats.totalInterviews || 0} 
          icon={Eye} 
        />
      </div>

      {/* 5. ASLI MONTHLY CHART  */}
      <div className="w-full">
        <Chart data={chartData} />
      </div>

      {/* 6. ASLI RECENT APPLICATIONS TABLE  */}
      <div className="pt-2">
        <RecentApplications applications={recentApps} />
      </div>
    </div>
  );
}