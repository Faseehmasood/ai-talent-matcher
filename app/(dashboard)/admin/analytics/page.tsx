"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts"
import { TrendingUp, Users, Briefcase, CheckCircle } from "lucide-react"

// Dummy Data for Platform Growth
const growthData = [
  { month: "Jan", users: 400, jobs: 240 },
  { month: "Feb", users: 520, jobs: 300 },
  { month: "Mar", users: 780, jobs: 450 },
  { month: "Apr", users: 1100, jobs: 600 },
]

// User Distribution Data
const userData = [
  { name: "Candidates", value: 850, color: "#94a3b8" }, // Slate
  { name: "HR Managers", value: 150, color: "#1e293b" }, // Dark
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Deep dive into platform growth and user activity.</p>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "User Growth", value: "+24%", icon: Users, color: "text-green-500" },
          { label: "Job Postings", value: "+18%", icon: Briefcase, color: "text-blue-500" },
          { label: "Hiring Rate", value: "12.5%", icon: CheckCircle, color: "text-purple-500" },
          { label: "Platform Health", value: "99.9%", icon: TrendingUp, color: "text-orange-500" },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border bg-card">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Platform Growth Trend (Line Chart) */}
        <Card className="rounded-3xl border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">User vs Job Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#1e293b" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="jobs" stroke="#94a3b8" strokeWidth={3} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution (Pie Chart) */}
        <Card className="rounded-3xl border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">User Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center gap-4 ml-4">
               {userData.map((item) => (
                 <div key={item.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                   <span className="text-xs font-medium">{item.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}