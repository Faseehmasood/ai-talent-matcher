"use client"

import { MoreVertical, Ban, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { ApplicationDetailModal } from "./ApplicationDetailModal"
// 1. Asli Actions import kiye ✅
import { updateInterviewStatusAction, deleteInterviewAction } from "@/src/actions/interview.actions"

export function InterviewActionMenu({ interview }: { interview: any }) {
  
  // 🛠️ HANDLER: Status Update (Completed) ✅
  const handleStatusUpdate = async (status: string) => {
    const response = await updateInterviewStatusAction(interview._id, status);
    if (response.success) {
      alert(`Interview marked as ${status}!`);
    } else {
      alert("Failed to update status");
    }
  };

  // 🛠️ HANDLER: Cancel/Delete ✅
  const handleCancel = async () => {
    const response = await deleteInterviewAction(interview._id);
    if (response.success) {
      alert("Interview cancelled and removed.");
    } else {
      alert("Failed to cancel interview");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-border/50 bg-card">
        
        {/* View Details Modal */}
        <div className="p-0">
          <ApplicationDetailModal 
            application={{
              name: interview.candidate?.name,
              role: interview.job?.title,
              initials: interview.candidate?.name?.substring(0, 2).toUpperCase(),
              status: interview.status,
              date: new Date(interview.interviewDate).toLocaleDateString(),
              level: "Scheduled Candidate"
            }} 
          />
        </div>

        <DropdownMenuSeparator className="my-1 opacity-50" />

        {/* 🛠️ MARK AS DONE: Connect with Backend ✅ */}
        <DropdownMenuItem 
          className="rounded-xl cursor-pointer gap-3 py-2.5 focus:bg-green-50 focus:text-green-600 font-medium"
          onClick={() => handleStatusUpdate("completed")}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Mark as Done</span>
        </DropdownMenuItem>

        {/* 🛠️ CANCEL INTERVIEW: Connect with Delete Action ✅ */}
        <div className="flex items-center w-full px-1 py-0.5 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-1">
            <Ban className="w-4 h-4 mr-3 ml-2" />
            <DeleteConfirmModal 
              itemName={`Interview with ${interview.candidate?.name}`} 
              onDelete={handleCancel} 
            />
            <span className="ml-1 font-bold">Cancel Interview</span>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}