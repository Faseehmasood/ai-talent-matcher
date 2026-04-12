import { StatsCard } from "@/components/dashboard/StatsCard"
import { Chart } from "@/components/dashboard/Chart"
import { RecentApplications } from "@/components/dashboard/RecentApplications"
import { Users, Briefcase, Building2, TrendingUp } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of entire platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={1250}
          icon={Users}
        />
        <StatsCard
          title="Total Jobs"
          value={352}
          icon={Briefcase}
        />
        <StatsCard
          title="Companies"
          value={48}
          icon={Building2}
        />
        <StatsCard
          title="Success Rate"
          value="95%"
          icon={TrendingUp}
        />
      </div>

      {/* Chart */}
      <Chart />

      {/* Recent Applications */}
      <RecentApplications />

    </div>
  )
}