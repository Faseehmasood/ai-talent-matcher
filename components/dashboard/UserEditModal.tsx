"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCog, ShieldAlert } from "lucide-react"

export function UserEditModal({ user }: { user: any }) {
  return (
    <Dialog>
      {/* 🛠️ Trick: Yeh trigger dropdown item ki tarah dikhe ga */}
      <DialogTrigger asChild>
        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors outline-none">
          Edit Profile / Role
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-3xl border-border">
        <DialogHeader>
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-2 text-purple-600">
            <UserCog className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">Edit {user.name}</DialogTitle>
          <DialogDescription>
            Update role and account status for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue={user.name} className="rounded-xl h-11" />
          </div>
          
          <div className="space-y-2">
            <Label>User Role</Label>
            <select defaultValue={user.role} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 outline-none">
              <option value="admin">Administrator</option>
              <option value="hr">HR Manager</option>
              <option value="candidate">Candidate</option>
            </select>   
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border/50">
             <div className="flex items-center gap-3">
                <ShieldAlert className={`w-5 h-5 ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                   <p className="text-sm font-bold">Account Access</p>
                   <p className="text-[10px] text-muted-foreground uppercase">{user.status}</p>
                </div>
             </div>
             <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold bg-background">
                {user.status === 'active' ? "Suspend" : "Activate"}
             </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-xl">Cancel</Button>
          <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 px-8 font-bold text-white">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}