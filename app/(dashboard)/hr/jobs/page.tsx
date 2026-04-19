"use client"

import { Briefcase, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ==========================================
// 1. ALL MODALS IMPORTED ✅
// ==========================================
import { CreateJobModal } from "@/components/dashboard/CreateJobModal"
import { JobDetailModal } from "@/components/dashboard/JobDetailModal"
import { EditJobModal } from "@/components/dashboard/EditJobModal"
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal"

const jobs = [
  {
    id: "J-001",
    title: "Frontend Developer",
    company: "Tech Company",
    location: "Karachi, Pakistan",
    jobType: "full-time",
    status: "active",
    applicants: 12,
    createdAt: "Apr 10, 2026",
  },
  {
    id: "J-002",
    title: "Backend Developer",
    company: "Tech Company",
    location: "Lahore, Pakistan",
    jobType: "remote",
    status: "draft",
    applicants: 0,
    createdAt: "Apr 09, 2026",
  },
  {
    id: "J-003",
    title: "UI/UX Designer",
    company: "Tech Company",
    location: "Islamabad, Pakistan",
    jobType: "hybrid",
    status: "closed",
    applicants: 25,
    createdAt: "Apr 08, 2026",
  },
]

// Status Colors Logic
const statusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-700"
    case "draft": return "bg-yellow-100 text-yellow-700"
    case "closed": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

// Job Type Colors Logic
const jobTypeColor = (type: string) => {
  switch (type) {
    case "full-time": return "bg-blue-100 text-blue-700"
    case "remote": return "bg-purple-100 text-purple-700"
    case "hybrid": return "bg-orange-100 text-orange-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function HRJobsPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Jobs Management</h1>
          <p className="text-muted-foreground text-sm">
            Review and manage all your platform job listings.
          </p>
        </div>
        
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Active Jobs", value: 1, color: "bg-green-50 text-green-600" },
          { title: "Draft Jobs", value: 1, color: "bg-yellow-50 text-yellow-600" },
          { title: "Closed Jobs", value: 1, color: "bg-red-50 text-red-600" },
        ].map((stat) => (
          <Card key={stat.title} className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search job listings..." className="pl-9 rounded-xl h-11 border-border bg-card" />
        </div>
        <Button variant="outline" className="gap-2 h-11 rounded-xl shadow-sm">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Main Jobs Table */}
      <Card className="rounded-3xl border-border overflow-hidden shadow-sm bg-card">
        <CardHeader className="bg-muted/30 border-b border-border py-4">
          <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80">Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[80px] font-bold">ID</TableHead>
                <TableHead className="font-bold">Job Title</TableHead>
                <TableHead className="font-bold">Location</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Applicants</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="border-border hover:bg-muted/5 transition-colors">
                  <TableCell className="text-muted-foreground text-xs font-mono">{job.id}</TableCell>
                  <TableCell className="font-bold text-sm">{job.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{job.location}</TableCell>
                  <TableCell>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border-0 ${jobTypeColor(job.jobType)}`}>
                      {job.jobType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-bold">{job.applicants}</TableCell>
                  <TableCell>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border-0 ${statusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      
                      {/* 2. VIEW ACTION MODAL ✅ */}
                      <JobDetailModal job={job} />

                      {/* 3. EDIT ACTION MODAL ✅ */}
                      <EditJobModal job={job} />

                      {/* 4. DELETE ACTION MODAL ✅ */}
                      <DeleteConfirmModal 
                        itemName={job.title} 
                        onDelete={() => console.log("Deleting:", job.id)} 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}