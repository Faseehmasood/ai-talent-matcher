"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

// INTERFACE: Batao ke kaisa data chahiye
interface ChartProps {
  data: { month: string; applicants: number }[];
}

export function Chart({ data }: ChartProps) {
  // Agar database khali hai toh yeh "Placeholder" dikhayega
  const defaultData = [
    { month: "No Data", applicants: 0 }
  ];

  return (
    <Card className="rounded-3xl border-border shadow-sm bg-card">
      <CardHeader>
         <CardTitle className="text-lg font-bold tracking-tight">Monthly Application Trend</CardTitle>
         <p className="text-xs text-muted-foreground">Applications received across all your jobs.</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.length > 0 ? data : defaultData} barSize={12}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
            <Bar dataKey="applicants" fill="#1e293b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}