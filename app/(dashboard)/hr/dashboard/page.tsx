import { getDashboardStatsAction } from "@/src/actions/stats.actions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Chart } from "@/components/dashboard/Chart";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { Briefcase, Users, Eye } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function HRDashboardPage() {
  const response = await getDashboardStatsAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "TOKEN_EXPIRED") {
      redirect("/login");
    }
    throw new Error(response.code || "Failed to load dashboard");
  }

  const { totalJobs, totalApplications, totalInterviews } = response.stats ?? {
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
  };

  // CHART DATA NIKALO
  const chartData = response.chartData ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time recruitment analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total opened jobs" value={totalJobs || 0} icon={Briefcase} />
        <StatsCard title="Total applicants" value={totalApplications || 0} icon={Users} />
        <StatsCard title="Total interviews" value={totalInterviews || 0} icon={Eye} />
      </div>

      <div className="w-full">
        {/*  ASLI DATA PASS KAR DIYA */}
        <Chart data={chartData} />
      </div>

      <div className="pt-2">
        <RecentApplications />
      </div>
    </div>
  );
}