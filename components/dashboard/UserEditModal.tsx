"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCog, ShieldAlert, Loader2, CheckCircle2, Ban, User, ShieldCheck } from "lucide-react"
// 🛠️ Dono Actions import kiye ✅
import { toggleUserStatusAction, adminUpdateUserAction } from "@/src/actions/user.actions"

export function UserEditModal({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)

  // 1. FORM STATE: Database se aaya hua data pehle se bhara hua ✅
  const [formData, setFormData] = useState({
    name: user.name || "",
    role: user.role || "candidate"
  })

  // 🚀 HANDLER 1: Save Profile & Role Changes ✅
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await adminUpdateUserAction(user._id, formData)
      if (response.success) {
        alert(response.message)
        setOpen(false) // Modal band kar do
      } else {
        alert("Error: " + response.message)
      }
    } catch (error) {
      alert("Something went wrong while saving")
    } finally {
      setLoading(false)
    }
  }

  // 🚀 HANDLER 2: Suspend / Activate Logic ✅
  const handleToggleStatus = async () => {
    setToggleLoading(true)
    try {
      const response = await toggleUserStatusAction(user._id)
      if (response.success) {
        alert(response.message)
      } else {
        alert("Error: " + response.message)
      }
    } catch (error) {
      alert("Something went wrong while toggling status")
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🛠️ TRIGGER: Styled as a menu item ✅ */}
      <DialogTrigger asChild>
        <button className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded-md transition-all outline-none flex items-center gap-2 font-medium">
          <UserCog className="w-4 h-4 text-muted-foreground" />
          Edit Profile / Role
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-border shadow-2xl bg-card">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 text-primary border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Manage User</DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Update details or restrict access for <span className="text-foreground font-bold">{user.email}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {/* 🛠️ NAME CHANGE FIELD ✅ */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </Label>
              <Input 
                required
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20" 
              />
            </div>
            
            {/* 🛠️ ROLE CHANGE DROPDOWN ✅ */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <UserCog className="w-3 h-3" /> System Role
              </Label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="flex h-11 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="admin">Platform Administrator</option>
                <option value="hr">HR Hiring Manager</option>
                <option value="candidate">Candidate / Applicant</option>
              </select>
            </div>

            {/* 🛠️ ACCOUNT STATUS TOGGLE ✅ */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${user.isActive ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {user.isActive ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-foreground">Status</p>
                     <p className={`text-[10px] font-bold uppercase ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Account Active' : 'Account Suspended'}
                     </p>
                  </div>
               </div>
               
               <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  disabled={toggleLoading}
                  onClick={handleToggleStatus} 
                  className={`rounded-xl px-4 font-bold border-border shadow-sm bg-background hover:bg-muted ${user.isActive ? 'text-red-600' : 'text-green-600'}`}
               >
                  {toggleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (user.isActive ? "Suspend" : "Activate")}
               </Button>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 border-border/50">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="rounded-xl px-8 font-black shadow-lg shadow-primary/20"
            >
               {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}