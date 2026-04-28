"use client" // ✅ Yeh client component hai

import { useState } from "react"
import { JobDetailModal } from "./JobDetailModal"
import { EditJobModal } from "./EditJobModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { deleteJobAction } from "@/src/actions/job.actions" // ✅ Action yahan import karo

export function JobRowActions({ job }: { job: any }) {
  
  // 🛠️ DELETE HANDLER: Ab yeh yahan asani se chalay ga ✅
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
      {/* 1. View Modal */}
      <JobDetailModal job={job} />

      {/* 2. Edit Modal */}
      <EditJobModal job={job} />

      {/* 3. Delete Modal: Ab isay function dene mein koi error nahi aayega ✅ */}
      <DeleteConfirmModal 
        itemName={job.title} 
        onDelete={handleDelete} 
      />
    </div>
  )
}