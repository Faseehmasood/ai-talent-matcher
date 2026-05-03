"use client"

import { useState } from "react"
import { updateProfileAction } from "@/src/actions/user.actions"
import { useAuthStore } from "@/src/store/useAuthStore" 
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
import { Edit3, User, Phone, Info, Loader2, Code2 } from "lucide-react"

interface EditProfileProps {
  user: {
    name: string;
    bio?: string;
    phone?: string;
    skills?: string[]; //  Backend se array aayegi

  };
  role: string;
}

export function EditProfileModal({ user,role }: EditProfileProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const setAuth = useAuthStore((state) => state.setAuth)

  // 1. Form State Initialization 
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    phoneNumber: user.phone || "",
    //  REASONING: Array ko string mein badlo taake input mein nazar aaye 
    skills: user.skills?.join(", ") || "" 
  })

  // 2. Submit Logic 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      //  DATA TRANSFORMATION 
      // String "React, Node" ko badal kar ["React", "Node"] kar do
      const finalData = {
        ...formData,
        skills: formData.skills 
          ? formData.skills.split(",").map(s => s.trim()).filter(s => s !== "") 
          : []
      }

      const response = await updateProfileAction(finalData)

      if (response.success && response.user) {
        setAuth(response.user) 
        alert("Profile updated successfully! ")
        setOpen(false) 
      } else {
        alert(response.message || "Failed to update profile")
      }
    } catch (error) {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold px-6">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border shadow-2xl bg-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Update Profile</DialogTitle>
            <DialogDescription>
              Keep your professional info up to date to attract better opportunities.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input 
                required
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-xl h-11 border-border/60" 
              />
            </div>
            
            {/* Bio */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Bio / Headline
              </Label>
              <Textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="rounded-xl min-h-[80px] border-border/60" 
                placeholder="Briefly describe your role..." 
              />
            </div>

            {/*  NEW: SKILLS INPUT  */}
            {role === "candidate" && (
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5" /> Skills (Comma separated)
              </Label>
              <Input 
                value={formData.skills} 
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="React, Node, TypeScript"
                className="rounded-xl h-11 border-border/60" 
              />
              <p className="text-[10px] text-muted-foreground px-1 italic">Separate each skill with a comma.</p>
            </div>
          )}

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </Label>
              <Input 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="rounded-xl h-11 border-border/60" 
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