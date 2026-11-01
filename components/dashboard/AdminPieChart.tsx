"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

export function AdminPieChart({ data }: { data: any[] }) {
  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981"]; // Admin, HR, Candidate
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}