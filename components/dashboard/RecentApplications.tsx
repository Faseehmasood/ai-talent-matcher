"use client"

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

// 1. ApplicationDetailModal import rakha hai ✅
import { ApplicationDetailModal } from "./ApplicationDetailModal"

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

export function RecentApplications() {
  return (
    <Card className="rounded-3xl border-border shadow-sm bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">
              Recently Applied
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Total jobs applied by candidates in your company
            </p>
          </div>

          {/* 🛠️ FIXED MONTHLY LABEL (DROPDOWN REMOVED) ✅ */}
          <div className="px-3 py-1 bg-muted rounded-xl text-xs font-bold text-muted-foreground">
            Monthly
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="px-6 font-bold text-xs uppercase tracking-wider">Candidate ID</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Full Name</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Level</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right px-6 font-bold text-xs uppercase tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id} className="border-border hover:bg-muted/5 transition-colors">
                {/* ID */}
                <TableCell className="px-6 text-xs font-mono text-muted-foreground">
                  {app.id}
                </TableCell>

                {/* Name + Avatar */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                        {app.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-foreground">{app.name}</span>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell className="text-sm font-medium">{app.role}</TableCell>

                {/* Level */}
                <TableCell>
                   <span className="text-xs bg-muted px-2 py-1 rounded-lg font-medium text-muted-foreground">
                      {app.level}
                   </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border-0 ${statusColor(app.status)}`}
                  >
                    {app.status}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="text-right px-6">
                  {/* 🛠️ VIEW DETAIL MODAL CONNECTED ✅ */}
                  <ApplicationDetailModal application={app} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}