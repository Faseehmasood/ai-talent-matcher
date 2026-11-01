import { getDashboardStatsAction } from "@/src/actions/stats.actions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Chart } from "@/components/dashboard/Chart";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { Users, Briefcase, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const response = await getDashboardStatsAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Admin stats failed to load");
  }

  const stats = response.stats!;
  const chartData = response.chartData || [];
  const recentApplications = response.recentApplications || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Platform Command Center</h1>
        <p className="text-muted-foreground text-sm">Real-time health monitor of TalentaSync.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Platform Users"
          value={stats.totalUsers ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Global Job Postings"
          value={stats.totalJobs ?? 0}
          icon={Briefcase}
        />
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications ?? 0}
          icon={TrendingUp}
        />
      </div>

      <div className="w-full">
        <Chart data={chartData} />
      </div>

      <div className="pt-2">
        <RecentApplications applications={recentApplications} />
      </div>
    </div>
  );
}
