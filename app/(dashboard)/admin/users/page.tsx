import { getAllUsersAction } from "@/src/actions/user.actions";
import { AddUserModal } from "@/components/dashboard/AddUserModal";
import { UserEditModal } from "@/components/dashboard/UserEditModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActionsDropdown } from "@/components/dashboard/UserActionsDropdown";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  // 1. Database se asli users mangwayein server par 
  const response = await getAllUsersAction();

  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "FORBIDDEN") redirect("/login");
    throw new Error("Failed to load users");
  }

  const users = response.users || [];

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-purple-600 bg-purple-50";
      case "hr": return "text-blue-600 bg-blue-50";
      default: return "text-green-600 bg-green-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground text-sm">Total platform accounts: {users.length}</p>
        </div>
        <AddUserModal />
      </div>

      <Card className="rounded-3xl border-border overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="font-bold px-6">User Details</TableHead>
                <TableHead className="font-bold">System Role</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user: any) => (
                  <TableRow key={user._id} className="border-border hover:bg-muted/5 transition-colors">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border">
                          <AvatarFallback className="bg-muted text-[10px] font-bold">
                             {user.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                             <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`rounded-lg px-2 py-0.5 border-0 font-bold text-[9px] uppercase ${roleColor(user.role)}`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                         <span className="text-xs font-bold capitalize">{user.isActive ? 'Active' : 'Suspended'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                        {/*  FIX: Ab yahan asli dropdown aayega  */}
                        <UserActionsDropdown user={user} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No other users found on the platform.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}