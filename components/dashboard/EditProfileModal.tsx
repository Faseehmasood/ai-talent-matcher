"use client"

import { useState } from "react"
import { updateProfileAction } from "@/src/actions/user.actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, User, Phone, Info, Loader2 } from "lucide-react"

interface EditProfileProps {
  user: {
    name: string;
    bio?: string;
    phone?: string;
  };
}

export function EditProfileModal({ user }: EditProfileProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. Form State: Purane data se start karo 
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    phoneNumber: user.phone || ""
  })

  // 2. Submit Logic 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const response = await updateProfileAction(formData)

    if (response.success) {
      alert("Profile updated successfully! ✨")
      setOpen(false) // Modal band kar do
    } else {
      alert(response.message || "Failed to update profile")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold px-6">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Update Profile</DialogTitle>
            <DialogDescription>
              Modify your public information and how others see you on the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input 
                required
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20" 
              />
            </div>
            
            {/* Bio / Headline */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Professional Bio
              </Label>
              <Textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="rounded-xl min-h-[100px] border-border/60 focus-visible:ring-primary/20" 
                placeholder="Briefly describe your role or expertise..." 
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </Label>
              <Input 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="rounded-xl h-11 border-border/60 focus-visible:ring-primary/20" 
                placeholder="+92 ..." 
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-6 border-border/50">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl px-10 font-bold shadow-lg shadow-primary/20">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}