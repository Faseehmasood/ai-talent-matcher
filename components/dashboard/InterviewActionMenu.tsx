"use client"
import { MoreVertical, Ban, CheckCircle, Eye, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { ApplicationDetailModal } from "./ApplicationDetailModal" // ✅ Pehle wala modal import kiya

export function InterviewActionMenu({ interview }: { interview: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-border/50 bg-card">
        
        {/* 🛠️ FIX: View Details ab asli Modal kholay ga ✅ */}
        <div className="p-0">
          <ApplicationDetailModal 
            application={{
              name: interview.candidate,
              role: interview.role,
              initials: interview.candidate.substring(0, 2).toUpperCase(),
              status: interview.status,
              date: interview.date,
              level: "Applied Candidate"
            }} 
          />
        </div>

        <DropdownMenuSeparator className="my-1 opacity-50" />

        {/* Mark as Done */}
        <DropdownMenuItem 
          className="rounded-xl cursor-pointer gap-3 py-2.5 focus:bg-green-50 focus:text-green-600"
          onClick={() => console.log("Updating to: completed")}
        >
          <CheckCircle className="w-4 h-4" />
          <span className="font-bold text-sm">Mark as Done</span>
        </DropdownMenuItem>

        {/* Cancel Interview */}
        <div className="flex items-center w-full px-1 py-0.5 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-1">
            <Ban className="w-4 h-4 mr-3 ml-2" />
            <DeleteConfirmModal 
              itemName={`Interview with ${interview.candidate}`} 
              onDelete={() => console.log("Updating to: cancelled")} 
            />
            <span className="ml-1 font-bold">Cancel Interview</span>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}