"use client"

import { StatsCard } from "@/components/dashboard/StatsCard"
import { Chart } from "@/components/dashboard/Chart"
import { RecentApplications } from "@/components/dashboard/RecentApplications"
import { Briefcase, Users, Eye } from "lucide-react"

export default function HRDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Simple & Bold Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Overview</h1>
        <p className="text-muted-foreground text-sm">
          Everything you need to manage your recruitment pipeline.
        </p>
      </div>

      {/* 2. Key Metrics (Stats Cards) */}
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

      {/* 3. Analytics Section (Full Width Chart) ✅ */}
      <div className="w-full">
        <Chart />
      </div>

      {/* 4. Activity Section (Recent Applications) ✅ */}
      <div className="pt-2">
        <RecentApplications />
      </div>

    </div>
  )
}