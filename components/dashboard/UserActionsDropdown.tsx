"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { UserEditModal } from "@/components/dashboard/UserEditModal"

export function UserActionsDropdown({ user }: { user: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-border/50 bg-card">
        <UserEditModal user={user} />
        <DropdownMenuSeparator className="my-1" />
        <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
          Advanced actions coming soon...
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}