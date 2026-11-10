"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface CandidateRecentAppsProps {
  applications?: any[]
}

const statusColor = (status: string) => {
  switch (status) {
    case "hired":
      return "bg-green-100 text-green-700"
    case "shortlisted":
      return "bg-blue-100 text-blue-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function CandidateRecentApps({ applications = [] }: CandidateRecentAppsProps) {
  return (
    <Card className="rounded-3xl border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">My Recent Applications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead>Job Title</TableHead>
              <TableHead>Location / Type</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app: any) => (
                <TableRow key={app._id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-semibold text-sm">
                    {app.job?.title || "Position Unavailable"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {app.job?.location || "Remote"} ({app.job?.jobType || "Full-time"})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-GB") : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase border-0 ${statusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  You have not submitted any applications yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
