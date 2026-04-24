"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationDetailModal } from "./ApplicationDetailModal"

// INTERFACE: Asli data ka dhancha
interface RecentApplicationsProps {
  applications: any[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  const statusColor = (status: string) => {
    switch (status) {
      case "hired": return "bg-green-100 text-green-700";
      case "shortlisted": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="rounded-3xl border-border shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Recently Applied</CardTitle>
        <p className="text-xs text-muted-foreground">Latest candidates for your job postings.</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-6 font-bold text-xs uppercase">Candidate</TableHead>
              <TableHead className="font-bold text-xs uppercase">Applied Role</TableHead>
              <TableHead className="font-bold text-xs uppercase">Status</TableHead>
              <TableHead className="text-right px-6 font-bold text-xs uppercase">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app: any) => (
                <TableRow key={app._id} className="border-border hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                          {app.candidate?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold">{app.candidate?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{app.job?.title}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <ApplicationDetailModal application={{
                      name: app.candidate?.name,
                      role: app.job?.title,
                      status: app.status,
                      date: new Date(app.createdAt).toLocaleDateString(),
                      initials: app.candidate?.name?.substring(0, 2).toUpperCase()
                    }} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No recent applications found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}