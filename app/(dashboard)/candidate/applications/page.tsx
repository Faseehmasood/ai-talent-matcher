"use client"

import { Search, Filter, Eye, Clock, CheckCircle2, XCircle, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const myApplications = [
  {
    id: "APP-001",
    jobTitle: "Frontend Developer",
    company: "Tech Company",
    appliedDate: "Apr 10, 2026",
    status: "shortlisted",
  },
  {
    id: "APP-002",
    jobTitle: "Backend Developer",
    company: "Soft Solutions",
    appliedDate: "Apr 09, 2026",
    status: "pending",
  },
  {
    id: "APP-003",
    jobTitle: "UI/UX Designer",
    company: "Creative Studio",
    appliedDate: "Apr 08, 2026",
    status: "reviewing",
  },
  {
    id: "APP-004",
    jobTitle: "React Native Developer",
    company: "Mobile Apps Inc.",
    appliedDate: "Apr 05, 2026",
    status: "rejected",
  }
]

// Status styling logic
const statusConfig = {
  hired: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  shortlisted: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  reviewing: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  pending: { color: "bg-gray-100 text-gray-700", icon: Clock },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
}

export default function CandidateApplicationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of all your job applications in one place.
        </p>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: 4, icon: Building2, color: "text-primary" },
          { label: "Pending", value: 1, icon: Clock, color: "text-gray-500" },
          { label: "Shortlisted", value: 1, icon: CheckCircle2, color: "text-blue-500" },
          { label: "Rejected", value: 1, icon: XCircle, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-70`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search applications by job or company..."
            className="pl-9 h-11 rounded-xl bg-background border-border"
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Applications Table */}
      <Card className="rounded-2xl border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-sm font-semibold">Application History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-[100px]">App ID</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myApplications.map((app) => {
                  const config = statusConfig[app.status as keyof typeof statusConfig]
                  const Icon = config.icon

                  return (
                    <TableRow key={app.id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        {app.id}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {app.jobTitle}
                      </TableCell>
                      <TableCell className="text-sm">
                        {app.company}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {app.appliedDate}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-lg px-2 py-1 border-0 flex items-center gap-1.5 w-fit font-medium capitalize ${config.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-2 rounded-lg hover:bg-primary/5 hover:text-primary">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}