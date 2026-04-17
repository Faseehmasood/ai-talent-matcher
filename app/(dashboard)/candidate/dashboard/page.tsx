import { StatsCard } from "@/components/dashboard/StatsCard"
import { CandidateRecentApps } from "@/components/dashboard/CandidateRecentApps" // ✅ Naya component
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react"

export default function CandidateDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications Overview</h1>
        <p className="text-muted-foreground text-sm">Track your job applications and interview status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Applied" value={3} icon={Briefcase} />
        <StatsCard title="Shortlisted" value={1} icon={CheckCircle} />
        <StatsCard title="Pending" value={1} icon={Clock} />
        <StatsCard title="Rejected" value={1} icon={XCircle} />
      </div>

      {/* ✅ Yahan ab sirf iski apni applications nazar aayengi */}
      <CandidateRecentApps /> 
    </div>
  )
}