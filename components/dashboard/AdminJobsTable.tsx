"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { JobDetailModal } from "./JobDetailModal"
import { AdminDeleteJobModal} from "./AdminDeleteJobModal"

export function AdminJobsTable({ jobs }: { jobs: any[] }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { setMounted(true) }, [])

  // REASONING: Hydration mismatch rokne ke liye guard lagaya 
  if (!mounted) return <div className="p-20 text-center text-muted-foreground animate-pulse font-medium">Synchronizing global directory...</div>

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "closed": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="font-bold px-6 py-4 text-xs uppercase tracking-widest">Job Details</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-widest">Posted By (HR)</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-widest">Current Status</TableHead>
            <TableHead className="text-right px-8 font-bold text-xs uppercase tracking-widest">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <TableRow key={job._id} className="border-border hover:bg-muted/5 transition-colors">
                <TableCell className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">{job.title}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">{job.company} • {job.location}</span>
                   </div>
                </TableCell>
                
                <TableCell>
                   <div className="flex items-center gap-3">
                      <Avatar className="w-7 h-7 border border-border">
                         <AvatarFallback className="text-[8px] font-bold bg-primary/5 text-primary">
                            {job.postedBy?.name?.substring(0, 2).toUpperCase() || "HR"}
                         </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{job.postedBy?.name || "Unknown HR"}</span>
                        <span className="text-[9px] text-muted-foreground">{job.postedBy?.email}</span>
                      </div>
                   </div>
                </TableCell>

                <TableCell>
                   <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase border-0 ${statusColor(job.status)}`}>
                      {job.status}
                   </Badge>
                </TableCell>

                <TableCell className="text-right px-6">
                   <div className="flex items-center justify-end gap-1">
                      {/* View Action (Same Modal) */}
                      <JobDetailModal job={job} />

                      {/*  SPECIAL ADMIN DELETE MODAL (Reasoning included)  */}
                      <AdminDeleteJobModal job={job} />
                   </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic">
                No job postings found on the platform.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}