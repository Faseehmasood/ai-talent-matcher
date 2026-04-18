"use client"

import { Search, Filter, MoreHorizontal, User, ShieldCheck, GraduationCap, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// 1. Modals Import karo ✅
import { AddUserModal } from "@/components/dashboard/AddUserModal"
import { UserEditModal } from "@/components/dashboard/UserEditModal"
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal"

const allUsers = [
  { id: "U-001", name: "Sophia Williams", email: "sophia@admin.com", role: "admin", joinedDate: "Jan 12, 2026", status: "active", initials: "SW" },
  { id: "U-002", name: "Ali Ahmed", email: "hr.ali@company.com", role: "hr", joinedDate: "Feb 05, 2026", status: "active", initials: "AA" },
  { id: "U-003", name: "Mirha Fatima", email: "mirha@gmail.com", role: "candidate", joinedDate: "Mar 20, 2026", status: "active", initials: "MF" },
]

const roleConfig = {
  admin: { color: "text-purple-600 bg-purple-50", icon: ShieldCheck },
  hr: { color: "text-blue-600 bg-blue-50", icon: User },
  candidate: { color: "text-green-600 bg-green-50", icon: GraduationCap },
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground text-sm">Manage roles and permissions for all platform users.</p>
        </div>
      
      </div>

      {/* Users Table Card */}
      <Card className="rounded-3xl border-border overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border py-4">
          <CardTitle className="text-sm font-bold uppercase text-muted-foreground/70">Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border">
                  <TableHead className="font-bold">User Details</TableHead>
                  <TableHead className="font-bold">System Role</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right px-8 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => {
                  const config = roleConfig[user.role as keyof typeof roleConfig]
                  const RoleIcon = config.icon

                  return (
                    <TableRow key={user.id} className="border-border hover:bg-muted/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 border border-border shadow-sm">
                            <AvatarFallback className="bg-muted text-[10px] font-bold">{user.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{user.name}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase">
                              <Mail className="w-3 h-3" /> {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-lg px-2 py-0.5 border-0 gap-1.5 font-bold text-[9px] uppercase tracking-tighter ${config.color}`}>
                          <RoleIcon className="w-3 h-3" /> {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                           <span className="text-xs font-bold capitalize">{user.status}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-border/50">
                            
                            {/* 2. EDIT MODAL AS MENU ITEM ✅ */}
                            <UserEditModal user={user} />

                            <DropdownMenuSeparator className="my-1" />

                            {/* 3. DELETE MODAL ITEM ✅ */}
                            <div className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-red-50 text-red-600 transition-colors">
                               <DeleteConfirmModal 
                                  itemName={user.name} 
                                  onDelete={() => console.log("Deleted User:", user.id)} 
                               />
                               <span className="ml-2 font-medium">Delete Account</span>
                            </div>

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}