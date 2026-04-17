"use client"

import { Search, Filter, Briefcase, Trash2, ExternalLink, User } from "lucide-react"
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

const allPlatformJobs = [
  {
    id: "J-101",
    title: "Frontend Developer",
    company: "Tech Solutions",
    postedBy: "Sophia Williams",
    applicants: 15,
    status: "active",
    date: "Apr 10, 2026",
  },
  {
    id: "J-102",
    title: "Backend Engineer",
    company: "Soft Corp",
    postedBy: "Ali Ahmed",
    applicants: 8,
    status: "active",
    date: "Apr 12, 2026",
  },
  {
    id: "J-103",
    title: "Graphic Designer",
    company: "Creative Hub",
    postedBy: "John Doe",
    applicants: 25,
    status: "closed",
    date: "Apr 05, 2026",
  },
]

export default  function AdminJobsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Jobs</h1>
        <p className="text-muted-foreground">Monitor and manage all job postings across the platform.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Total Active Jobs</p>
              <p className="text-xl font-bold">42</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Total Applicants</p>
              <p className="text-xl font-bold">1,250</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Placement Rate</p>
              <p className="text-xl font-bold">12%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company or HR name..."
            className="pl-9 h-11 rounded-xl bg-background"
          />
        </div>
        <Button variant="outline" className="h-11 rounded-xl gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Jobs Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-sm font-semibold">Global Job Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Posted By (HR)</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPlatformJobs.map((job) => (
                  <TableRow key={job.id} className="border-border hover:bg-muted/5">
                    <TableCell className="text-xs font-mono text-muted-foreground">{job.id}</TableCell>
                    <TableCell className="font-semibold text-sm">{job.title}</TableCell>
                    <TableCell className="text-sm">{job.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {job.postedBy.substring(0,1)}
                        </div>
                        <span className="text-xs font-medium">{job.postedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{job.applicants}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-0 ${
                        job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}