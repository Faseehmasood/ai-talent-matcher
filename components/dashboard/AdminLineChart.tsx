"use client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export function AdminLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
        <YAxis hide />
        <Tooltip contentStyle={{borderRadius: "12px", border: "none", boxShadow: "0 10px 15px rgba(0,0,0,0.1)"}} />
        <Line type="monotone" dataKey="users" name="New Users" stroke="#8b5cf6" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="jobs" name="New Jobs" stroke="#3b82f6" strokeWidth={3} dot={false} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  )
}