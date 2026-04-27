import { getHRApplicationsAction } from "@/src/actions/application.actions";
import { ApplicationDetailModal } from "@/components/dashboard/ApplicationDetailModal";
import { ScheduleModal } from "@/components/dashboard/ScheduleModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { redirect } from "next/navigation";

//  ASLI MAGIC: Refresh logic
export const revalidate = 0;

export default async function HRApplicationsPage() {
  // 1. Database se real applications mangwao 
  const response = await getHRApplicationsAction();

  // 2. Security Barrier 
  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "TOKEN_EXPIRED") {
      redirect("/login");
    }
    throw new Error("Failed to load applications");
  }

  const applications = response.applications || [];

  // Helper: Status ke colors set karo
  const statusColor = (status: string) => {
    switch (status) {
      case "hired": return "bg-green-100 text-green-700";
      case "shortlisted": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Applications Manager</h1>
        <p className="text-muted-foreground text-sm">You have {applications.length} total applicants to review.</p>
      </div>

      <Card className="rounded-3xl border-border overflow-hidden shadow-sm bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-bold px-6">Candidate Details</TableHead>
                <TableHead className="font-bold">Target Role</TableHead>
                <TableHead className="font-bold">Apply Date</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app: any) => (
                  <TableRow key={app._id} className="border-border hover:bg-muted/5 transition-colors">
                    {/*  ASLI DATA MAPPING  */}
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border shadow-sm">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                            {app.candidate?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold">{app.candidate?.name}</span>
                           <span className="text-[10px] text-muted-foreground">{app.candidate?.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-medium">{app.job?.title}</TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString('en-GB')}
                    </TableCell>

                    <TableCell>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase border-0 ${statusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right px-6">
                       <div className="flex items-center justify-end gap-2">
                          {/*  WIRING MODALS WITH REAL DATA  */}
                          <ApplicationDetailModal application={{
                            id: app._id,
                            name: app.candidate?.name,
                            email: app.candidate?.email,
                            role: app.job?.title,
                            resume: app.resume,
                            coverLetter: app.coverLetter,
                            status: app.status,
                            date: new Date(app.createdAt).toLocaleDateString(),
                            initials: app.candidate?.name?.substring(0, 2).toUpperCase()
                          }} />

                          {/* Interview Schedule Modal */}
                          <ScheduleModal 
                            candidateId={app.candidate?._id} 
                            jobId={app.job?._id} 
                            candidateName={app.candidate?.name} 
                            jobTitle={app.job?.title} 
                          />
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No active applications found in your pipeline.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}