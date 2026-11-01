"use client"

 
import { JobDetailModal } from "./JobDetailModal"
import { EditJobModal } from "./EditJobModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { deleteJobAction } from "@/src/actions/job.actions" 

export function JobRowActions({ job }: { job: any }) {
  

  const handleDelete = async () => {
    const response = await deleteJobAction(job._id);
    if (response.success) {
       alert("Job deleted successfully!");
    } else {
       alert("Failed to delete job.");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
       
      <JobDetailModal job={job} />
      
      <EditJobModal job={job} />

      <DeleteConfirmModal 
        itemName={job.title} 
        onDelete={handleDelete} 
      />
    </div>
  )
}