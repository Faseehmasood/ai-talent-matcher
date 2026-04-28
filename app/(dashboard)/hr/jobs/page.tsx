import { getMyJobsAction } from "@/src/actions/job.actions";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";
import { JobRowActions } from "@/components/dashboard/JobRowActions"; // ✅ Naya Wrapper
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

// Refresh logic
export const revalidate = 0;

export default async function HRJobsPage() {
  const response = await getMyJobsAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Failed to load jobs");
  }

  const jobs = response.jobs || [];

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "draft": return "bg-yellow-100 text-yellow-700";
      default: return "bg-red-100 text-red-700";
    }
  };

  const jobTypeColor = (type: string) => {
    switch (type) {
      case "full-time": return "bg-blue-100 text-blue-700";
      case "remote": return "bg-purple-100 text-purple-700";
      case "hybrid": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground text-sm">Control and monitor all your active job postings.</p>
        </div>
        <CreateJobModal />
      </div>

      {/* Table Section */}
      <Card className="rounded-3xl border-border overflow-hidden shadow-sm bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-bold px-6">Job Title</TableHead>
                <TableHead className="font-bold">Location</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job: any) => (
                  <TableRow key={job._id} className="border-border hover:bg-muted/5 transition-colors">
                    <TableCell className="px-6 font-bold text-sm text-foreground">{job.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.location}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border-0 ${jobTypeColor(job.jobType)}`}>
                        {job.jobType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border-0 ${statusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </TableCell>
                    
                    {/* 🛠️ ASLI ACTION COLUMN: Replaced old Modals with JobRowActions ✅ */}
                    <TableCell className="text-right px-6">
                      <JobRowActions job={job} />
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                    No jobs posted yet. Click "Create Job" to get started.
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