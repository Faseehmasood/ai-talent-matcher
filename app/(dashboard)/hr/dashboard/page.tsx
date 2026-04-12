import { StatsCard } from "@/components/dashboard/StatsCard"
import { Chart } from "@/components/dashboard/Chart"
import { Schedule } from "@/components/dashboard/Schedule"
import { RecentApplications } from "@/components/dashboard/RecentApplications"
import { Briefcase, Users, Eye } from "lucide-react"

export default function HRDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of notes regarding HR management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total opened jobs"
          value={352}
          icon={Briefcase}
        />
        <StatsCard
          title="Total applicants"
          value={18780}
          icon={Users}
        />
        <StatsCard
          title="Total reviewed"
          value={18780}
          icon={Eye}
        />
      </div>

      {/* Chart + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div className="lg:col-span-1">
          <Schedule />
        </div>
      </div>

      {/* Recent Applications */}
      <RecentApplications />

    </div>
  )
}