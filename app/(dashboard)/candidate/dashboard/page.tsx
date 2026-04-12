import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentApplications } from "@/components/dashboard/RecentApplications"
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react"

export default function CandidateDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your job applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applied"
          value={12}
          icon={Briefcase}
        />
        <StatsCard
          title="In Review"
          value={5}
          icon={Clock}
        />
        <StatsCard
          title="Shortlisted"
          value={3}
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected"
          value={2}
          icon={XCircle}
        />
      </div>

      {/* Recent Applications */}
      <RecentApplications />

    </div>
  )
}