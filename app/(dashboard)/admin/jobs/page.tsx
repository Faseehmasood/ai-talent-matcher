"use client"

import { Search, Filter, Briefcase, User, ExternalLink } from "lucide-react"
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

// 1. Delete Modal Import kiya ✅
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal"

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

export default function AdminJobsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Jobs</h1>
        <p className="text-muted-foreground text-sm">Monitor and moderate all job listings across TalentaSync.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Jobs", value: 42, icon: Briefcase, color: "text-primary bg-primary/5" },
          { label: "Total Applicants", value: "1,250", icon: User, color: "text-orange-600 bg-orange-50" },
          { label: "Placement Rate", value: "12%", icon: ExternalLink, color: "text-green-600 bg-green-50" },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title, company or HR..." className="pl-9 rounded-xl h-11" />
        </div>
        <Button variant="outline" className="h-11 rounded-xl gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Jobs Table */}
      <Card className="rounded-3xl border-border overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border py-4">
          <CardTitle className="text-sm font-bold uppercase text-muted-foreground/80">Global Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-[80px] font-bold">ID</TableHead>
                  <TableHead className="font-bold">Job Title</TableHead>
                  <TableHead className="font-bold">Posted By (HR)</TableHead>
                  <TableHead className="font-bold">Apps</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right px-8 font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPlatformJobs.map((job) => (
                  <TableRow key={job.id} className="border-border hover:bg-muted/5 transition-colors">
                    <TableCell className="text-xs font-mono text-muted-foreground">{job.id}</TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-bold text-sm">{job.title}</span>
                          <span className="text-[10px] text-muted-foreground">{job.company}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium bg-muted px-2 py-1 rounded-lg">{job.postedBy}</span>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{job.applicants}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase border-0 ${
                        job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      
                      {/* 2. ADMIN DELETE ACTION MODAL ✅ */}
                      <DeleteConfirmModal 
                        itemName={`${job.title} at ${job.company}`} 
                        onDelete={() => console.log("Admin Deleted Job:", job.id)} 
                      />

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