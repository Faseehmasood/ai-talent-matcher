"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, User, Phone, Info } from "lucide-react"

export function EditProfileModal({ user }: { user: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Update Profile</DialogTitle>
          <DialogDescription>Modify your public information and contact details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2"><User className="w-4 h-4" /> Full Name</Label>
            <Input defaultValue={user.name} className="rounded-xl h-11" />
          </div>
          
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2"><Info className="w-4 h-4" /> Headline / Bio</Label>
            <Textarea defaultValue={user.bio} className="rounded-xl min-h-[100px]" placeholder="Briefly describe your professional background..." />
          </div>

          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</Label>
            <Input defaultValue={user.phone} className="rounded-xl h-11" placeholder="+92 ..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-xl">Cancel</Button>
          <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}