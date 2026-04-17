"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight } from "lucide-react"

// Mock data: Sirf is candidate ki apni applications
const myRecentApps = [
  {
    id: "APP-001",
    jobTitle: "Frontend Developer",
    company: "Tech Solutions",
    date: "Apr 10, 2026",
    status: "shortlisted",
  },
  {
    id: "APP-002",
    jobTitle: "React Native Developer",
    company: "Mobile Apps Inc.",
    date: "Apr 12, 2026",
    status: "pending",
  },
  {
    id: "APP-003",
    jobTitle: "UI/UX Designer",
    company: "Creative Hub",
    date: "Apr 05, 2026",
    status: "rejected",
  },
]

const statusColor = (status: string) => {
  switch (status) {
    case "shortlisted": return "bg-blue-100 text-blue-700"
    case "pending": return "bg-yellow-100 text-yellow-700"
    case "rejected": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

export function CandidateRecentApps() {
  return (
    <Card className="rounded-3xl border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">My Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myRecentApps.map((app) => (
              <TableRow key={app.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-semibold text-sm">{app.jobTitle}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{app.company}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{app.date}</TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-0 ${statusColor(app.status)}`}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                    View Details <ArrowRight className="w-3 h-3" />
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