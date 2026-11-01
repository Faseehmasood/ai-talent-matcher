"use client"

import { useState, useEffect } from "react"
import { MoreVertical, UserX, UserCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleUserStatusAction } from "@/src/actions/user.actions"

export function CandidateCardActions({
  candidateId,
  isArchived = false,
}: {
  candidateId: string
  isArchived?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggleStatus = async () => {
    setLoading(true)
    const res = await toggleUserStatusAction(candidateId)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.message || "Failed to update candidate status.")
    }
    setLoading(false)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-20">
        <MoreVertical className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 outline-none hover:bg-muted">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border-border/50 bg-card">
        <DropdownMenuItem
          onClick={handleToggleStatus}
          className={
            isArchived
              ? "text-green-600 rounded-xl cursor-pointer font-bold gap-3 py-2.5 focus:bg-green-50 focus:text-green-700"
              : "text-red-500 rounded-xl cursor-pointer font-bold gap-3 py-2.5 focus:bg-red-50 focus:text-red-600"
          }
        >
          {isArchived ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          <span>{isArchived ? "Restore Candidate" : "Archive Candidate"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
