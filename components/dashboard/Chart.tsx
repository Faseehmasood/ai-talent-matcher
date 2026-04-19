"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { month: "Jan", onSite: 40, hybrid: 30, remote: 20 },
  { month: "Feb", onSite: 55, hybrid: 40, remote: 35 },
  { month: "Mar", onSite: 45, hybrid: 35, remote: 25 },
  { month: "Apr", onSite: 60, hybrid: 45, remote: 40 },
  { month: "May", onSite: 70, hybrid: 55, remote: 45 },
  { month: "Jun", onSite: 65, hybrid: 50, remote: 35 },
  { month: "Jul", onSite: 80, hybrid: 60, remote: 50 },
]

export function Chart() {
  return (
    <Card className="rounded-3xl border-border shadow-sm bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Applicant Jobs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total jobs applied by candidates in your company
            </p>
          </div>

          {/* 🛠️ FIXED MONTHLY LABEL (DROPDOWN REMOVED) ✅ */}
          <div className="px-3 py-1 bg-muted rounded-xl text-xs font-bold text-muted-foreground">
            Monthly
          </div>
        </div>

        {/* Growth Statistics */}
        <div className="mt-4">
          <span className="text-3xl font-bold tracking-tighter">9.42%</span>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs">
            We&apos;re seeing a steady increase in candidate applications every week.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barSize={8} barGap={6}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                fontSize: "12px"
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ paddingBottom: "20px", fontSize: "11px", fontWeight: "600" }}
              formatter={(value) => (
                <span className="text-muted-foreground uppercase tracking-widest ml-1">{value}</span>
              )}
            />
            {/* Bars with Original Colors */}
            <Bar dataKey="onSite" name="On-Site" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="hybrid" name="Hybrid" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            <Bar dataKey="remote" name="Remote" fill="#1e293b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}