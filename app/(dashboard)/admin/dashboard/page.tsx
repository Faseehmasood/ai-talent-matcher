import { getDashboardStatsAction } from "@/src/actions/stats.actions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Chart } from "@/components/dashboard/Chart";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { Users, Briefcase, Building2, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Poore platform ka data fetch karo server par 
  const response = await getDashboardStatsAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Admin stats failed to load");
  }

  const stats = response.stats!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Platform Command Center</h1>
        <p className="text-muted-foreground text-sm">Real-time health monitor of TalentaSync.</p>
      </div>

      {/*  ASLI PLATFORM STATS  */}
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

      {/* Analytics Graph (Poore platform ka trend dikhayega) */}
      <div className="w-full">
        {/* Note: Admin ke liye hum chartData alag fetch kar sakte hain future mein */}
        <Chart data={[]} /> 
      </div>
      
      {/* Niche table mein hum 'Recent Users' dikha sakte hain baad mein */}
    </div>
  );
}