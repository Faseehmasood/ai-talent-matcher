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
    <Card className="rounded-2xl border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Applicant Jobs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total jobs applied by candidates in your company
            </p>
          </div>
          {/* Weekly Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1">
            <span className="text-sm font-medium">Weekly</span>
            <span className="text-sm text-muted-foreground">▼</span>
          </div>
        </div>

        {/* Growth */}
        <div className="mt-2">
          <span className="text-2xl font-bold">9.42%</span>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;re seeing a steady increase in candidate applications every week.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barSize={8} barGap={4}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs capitalize">{value}</span>
              )}
            />
            <Bar dataKey="onSite" name="On-Site" fill="#94a3b8" radius={4} />
            <Bar dataKey="hybrid" name="Hybrid" fill="#fbbf24" radius={4} />
            <Bar dataKey="remote" name="Remote" fill="#1e293b" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}