import { Briefcase, Plus, Search, Filter } from "lucide-react"
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

// Status color
const statusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-700"
    case "draft": return "bg-yellow-100 text-yellow-700"
    case "closed": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

// Job Type color
const jobTypeColor = (type: string) => {
  switch (type) {
    case "full-time": return "bg-blue-100 text-blue-700"
    case "remote": return "bg-purple-100 text-purple-700"
    case "hybrid": return "bg-orange-100 text-orange-700"
    case "part-time": return "bg-pink-100 text-pink-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function HRJobsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job postings
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Draft Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Closed Jobs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Jobs Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {job.id}
                  </TableCell>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.location}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${jobTypeColor(job.jobType)}`}>
                      {job.jobType}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.applicants}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.createdAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-red-500">
                        Delete
                      </Button>
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