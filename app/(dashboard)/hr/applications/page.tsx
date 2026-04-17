import { Search, Filter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// 1. Modal import kiya ✅
import { ScheduleModal } from "@/components/dashboard/ScheduleModal"

const applications = [
  {
    id: "A-001",
    candidate: "Mirha Fatima",
    initials: "MF",
    job: "Frontend Developer",
    appliedDate: "Apr 10, 2026",
    status: "shortlisted",
  },
  {
    id: "A-002",
    candidate: "Ali Ahmed",
    initials: "AA",
    job: "Backend Developer",
    appliedDate: "Apr 09, 2026",
    status: "pending",
  },
  {
    id: "A-003",
    candidate: "Sara Khan",
    initials: "SK",
    job: "UI/UX Designer",
    appliedDate: "Apr 08, 2026",
    status: "reviewing",
  },
  {
    id: "A-004",
    candidate: "Ahmed Raza",
    initials: "AR",
    job: "DevOps Engineer",
    appliedDate: "Apr 07, 2026",
    status: "hired",
  },
  {
    id: "A-005",
    candidate: "Fatima Malik",
    initials: "FM",
    job: "React Developer",
    appliedDate: "Apr 06, 2026",
    status: "rejected",
  },
]

const statusColor = (status: string) => {
  switch (status) {
    case "hired": return "bg-green-100 text-green-700"
    case "shortlisted": return "bg-blue-100 text-blue-700"
    case "reviewing": return "bg-yellow-100 text-yellow-700"
    case "pending": return "bg-gray-100 text-gray-700"
    case "rejected": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export default function HRApplicationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Manage candidate applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: 5, color: "bg-gray-100 text-gray-700" },
          { label: "Pending", value: 1, color: "bg-gray-100 text-gray-700" },
          { label: "Reviewing", value: 1, color: "bg-yellow-100 text-yellow-700" },
          { label: "Shortlisted", value: 1, color: "bg-blue-100 text-blue-700" },
          { label: "Hired", value: 1, color: "bg-green-100 text-green-700" },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${stat.color}`}>
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Applications Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {app.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs">
                          {app.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {app.candidate}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{app.job}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {app.appliedDate}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      
                      {/* 2. ScheduleModal yahan add kiya ✅ */}
                      <ScheduleModal 
                        candidateName={app.candidate} 
                        jobTitle={app.job} 
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