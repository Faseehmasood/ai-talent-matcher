import { 
  FileCheck, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X,
  MoreHorizontal
} from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const applications = [
  {
    id: "APP-101",
    candidate: { name: "Mirha Fatima", email: "mirha@gmail.com", initials: "MF" },
    jobTitle: "Frontend Developer",
    appliedDate: "Apr 10, 2026",
    status: "Shortlisted",
    matchScore: 85
  },
  
  {
    id: "APP-102",
    candidate: { name: "Ali Ahmed", email: "ali@gmail.com", initials: "AA" },
    jobTitle: "Backend Developer",
    appliedDate: "Apr 11, 2026",
    status: "Pending",
    matchScore: 72
  },
  {
    id: "APP-103",
    candidate: { name: "Sara Khan", email: "sara@gmail.com", initials: "SK" },
    jobTitle: "UI/UX Designer",
    appliedDate: "Apr 12, 2026",
    status: "Rejected",
    matchScore: 45
  }
]

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground">Track and manage all job applications</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Applications</p>
              <p className="text-xl font-bold">128</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="text-xl font-bold">42</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-xl font-bold">18</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search applications..." className="pl-9 rounded-xl h-11 border-border bg-card" />
        </div>
        <Button variant="outline" className="rounded-xl h-11 gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      {/* Applications Table */}
      <Card className="rounded-2xl border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Applied Job</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" />
                      <AvatarFallback>{app.candidate.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{app.candidate.name}</span>
                      <span className="text-xs text-muted-foreground">{app.candidate.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{app.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{app.id}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${app.matchScore > 70 ? 'bg-green-500' : app.matchScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${app.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{app.matchScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`
                    text-[10px] px-2 py-0 border-none
                    ${app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' : 
                      app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}
                  `}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuLabel>Manage Application</DropdownMenuLabel>
                      <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> View Resume</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-blue-600"><Check className="w-4 h-4" /> Shortlist</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-600"><X className="w-4 h-4" /> Reject</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}