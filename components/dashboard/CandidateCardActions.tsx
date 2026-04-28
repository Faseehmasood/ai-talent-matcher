"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Download, UserX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

export function CandidateCardActions({ candidateId }: { candidateId: string }) {
  // 1. Mounted state check logic ✅
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. Jab tak browser ready na ho, aik "Placeholder" dikhao taake UI na toote
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
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 outline-none hover:bg-muted transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-border/50 bg-card animate-in fade-in zoom-in duration-200">
        <DropdownMenuItem className="rounded-xl cursor-pointer gap-2 font-medium">
          <Download className="w-4 h-4 text-primary" /> Download CV
        </DropdownMenuItem>
        <DropdownMenuSeparator className="opacity-50" />
        <DropdownMenuItem className="text-red-500 rounded-xl cursor-pointer font-bold gap-2 focus:bg-red-50 focus:text-red-600">
          <UserX className="w-4 h-4" /> Archive Candidate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}