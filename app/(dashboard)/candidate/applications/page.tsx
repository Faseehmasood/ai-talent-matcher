import { getMyApplicationsAction } from "@/src/actions/candidate.actions";
import { JobDetailModal } from "@/components/dashboard/JobDetailModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function CandidateApplicationsPage() {
  // 1. Asli History fetch karo
  const response = await getMyApplicationsAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED") redirect("/login");
    throw new Error("Failed to load applications");
  }

  const applications = response.applications || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Applied Jobs</h1>
      
      <div className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-6 font-bold">Job Title</TableHead>
              <TableHead className="font-bold">Company</TableHead>
              <TableHead className="font-bold">Date Applied</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right px-8 font-bold">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app: any) => (
                <TableRow key={app._id} className="border-border hover:bg-muted/5">
                  <TableCell className="px-6 font-bold text-sm">{app.job?.title}</TableCell>
                  <TableCell className="text-sm font-medium">{app.job?.company}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary border-0 rounded-full uppercase text-[9px] font-black">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    {/* Reuse the View Modal */}
                    <JobDetailModal job={app.job} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-muted-foreground">You haven't applied to any jobs yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}