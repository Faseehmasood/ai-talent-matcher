"use client"

import { useState, useEffect } from "react"
import { MoreVertical, UserX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toggleUserStatusAction } from "@/src/actions/user.actions" //  Status update action

export function CandidateCardActions({ candidateId }: { candidateId: string }) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  //  ARCHIVE HANDLER 
  const handleArchive = async () => {
    setLoading(true)
    const res = await toggleUserStatusAction(candidateId);
    if (res.success) {
      alert(res.message);
      window.location.reload(); // UI update karne ke liye
    } else {
      alert("Failed to archive candidate.");
    }
    setLoading(false)
  }

  if (!mounted) return <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-20"><MoreVertical className="w-4 h-4" /></Button>

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 outline-none hover:bg-muted">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-border/50 bg-card">
        {/* 🛠️ DOWNLOAD CV HATA DIYA (Kyunki candidate page par iski zarorat ni) 🧼 ✅ */}
        
        <DropdownMenuItem 
          onClick={handleArchive}
          className="text-red-500 rounded-xl cursor-pointer font-bold gap-3 py-2.5 focus:bg-red-50 focus:text-red-600"
        >
          <UserX className="w-4 h-4" />
          <span>Archive Candidate</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}