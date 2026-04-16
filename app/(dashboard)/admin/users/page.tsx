"use client"

import { Search, Filter, UserPlus, MoreHorizontal, ShieldCheck, User, GraduationCap, Mail } from "lucide-react"
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const allUsers = [
  {
    id: "U-001",
    name: "Sophia Williams",
    email: "sophia@admin.com",
    role: "admin",
    joinedDate: "Jan 12, 2026",
    status: "active",
    initials: "SW",
  },
  {
    id: "U-002",
    name: "Ali Ahmed",
    email: "hr.ali@company.com",
    role: "hr",
    joinedDate: "Feb 05, 2026",
    status: "active",
    initials: "AA",
  },
  {
    id: "U-003",
    name: "Mirha Fatima",
    email: "mirha@gmail.com",
    role: "candidate",
    joinedDate: "Mar 20, 2026",
    status: "active",
    initials: "MF",
  },
  {
    id: "U-004",
    name: "John Doe",
    email: "john@hr.com",
    role: "hr",
    joinedDate: "Apr 01, 2026",
    status: "inactive",
    initials: "JD",
  },
]

// Role styling and icon logic
const roleConfig = {
  admin: { color: "text-purple-600 bg-purple-50", icon: ShieldCheck },
  hr: { color: "text-blue-600 bg-blue-50", icon: User },
  candidate: { color: "text-green-600 bg-green-50", icon: GraduationCap },
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Manage and monitor all platform accounts.</p>
        </div>
        <Button className="rounded-xl gap-2 h-11">
          <UserPlus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: 1250, icon: User, color: "text-primary" },
          { label: "Active HRs", value: 48, icon: ShieldCheck, color: "text-blue-500" },
          { label: "Candidates", value: 1102, icon: GraduationCap, color: "text-green-500" },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or ID..."
            className="pl-9 h-11 rounded-xl bg-background border-border"
          />
        </div>
        <Button variant="outline" className="h-11 rounded-xl border-border gap-2">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* Users Table */}
      <Card className="rounded-2xl border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border py-4">
          <CardTitle className="text-sm font-semibold">User Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => {
                  const config = roleConfig[user.role as keyof typeof roleConfig]
                  const RoleIcon = config.icon

                  return (
                    <TableRow key={user.id} className="border-border hover:bg-muted/5">
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {user.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-lg">
                            <AvatarFallback className="bg-muted text-[10px] font-bold">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{user.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-lg px-2 py-0.5 border-0 gap-1.5 font-medium text-[10px] uppercase tracking-tighter ${config.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.joinedDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-xs font-medium capitalize">{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem className={user.status === 'active' ? 'text-orange-500' : 'text-green-500'}>
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Delete User</DropdownMenuItem>
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