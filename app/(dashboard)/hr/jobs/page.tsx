import { getMyJobsAction } from "@/src/actions/job.actions";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";
import { JobDetailModal } from "@/components/dashboard/JobDetailModal";
import { EditJobModal } from "@/components/dashboard/EditJobModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card"; // ✅ Unused hataye
import { redirect } from "next/navigation";
import { deleteJobAction } from "@/src/actions/job.actions";

export const dynamic = "force-dynamic"; // ✅ Updated

export default async function HRJobsPage() {
  const response = await getMyJobsAction();

  if (!response.success) {
    if (
      response.code === "UNAUTHORIZED" ||
      response.code === "TOKEN_EXPIRED" // ✅ Add kiya
    ) {
      redirect("/login");
    }
    throw new Error("Failed to load jobs");
  }

  const jobs = response.jobs || [];

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "draft":  return "bg-yellow-100 text-yellow-700";
      default:       return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
        <CreateJobModal />
      </div>

      <Card className="rounded-3xl border-border overflow-hidden shadow-sm">
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
                  <TableRow key={job._id} className="border-border hover:bg-muted/5">
                    <TableCell className="px-6 font-bold text-sm">{job.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.location}</TableCell>
                    <TableCell className="text-sm capitalize">{job.jobType}</TableCell>
                    <TableCell>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${statusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1">
                        <JobDetailModal job={job} />
                        <EditJobModal job={job} />
                        <DeleteConfirmModal 
                          itemName={job.title} 
                          onDelete={() => deleteJobAction(job._id)} // onDelete mein action call kiya
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No jobs posted yet.
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