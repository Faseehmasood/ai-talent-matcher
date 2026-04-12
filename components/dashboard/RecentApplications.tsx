import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const applications = [
  {
    id: "C-001",
    name: "Mirha Fatima",
    role: "Frontend Developer",
    level: "Senior",
    date: "Apr 10, 2026",
    status: "shortlisted",
    initials: "MF",
  },
  {
    id: "C-002",
    name: "Ali Ahmed",
    role: "Backend Developer",
    level: "Mid",
    date: "Apr 09, 2026",
    status: "pending",
    initials: "AA",
  },
  {
    id: "C-003",
    name: "Sara Khan",
    role: "UI/UX Designer",
    level: "Junior",
    date: "Apr 08, 2026",
    status: "reviewing",
    initials: "SK",
  },
  {
    id: "C-004",
    name: "Ahmed Raza",
    role: "DevOps Engineer",
    level: "Senior",
    date: "Apr 07, 2026",
    status: "hired",
    initials: "AR",
  },
  {
    id: "C-005",
    name: "Fatima Malik",
    role: "React Developer",
    level: "Mid",
    date: "Apr 06, 2026",
    status: "rejected",
    initials: "FM",
  },
]

// Status ka color
const statusColor = (status: string) => {
  switch (status) {
    case "hired":
      return "bg-green-100 text-green-700"
    case "shortlisted":
      return "bg-blue-100 text-blue-700"
    case "reviewing":
      return "bg-yellow-100 text-yellow-700"
    case "pending":
      return "bg-gray-100 text-gray-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function RecentApplications() {
  return (
    <Card className="rounded-2xl border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              Recently Applied
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Total jobs applied by candidates in your company
            </p>
          </div>
          {/* Weekly Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1">
            <span className="text-sm font-medium">Weekly</span>
            <span className="text-sm text-muted-foreground">▼</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                {/* ID */}
                <TableCell className="text-sm text-muted-foreground">
                  {app.id}
                </TableCell>

                {/* Name + Avatar */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs">
                        {app.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{app.name}</span>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell className="text-sm">{app.role}</TableCell>

                {/* Level */}
                <TableCell className="text-sm">{app.level}</TableCell>

                {/* Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {app.date}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(app.status)}`}
                  >
                    {app.status}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}