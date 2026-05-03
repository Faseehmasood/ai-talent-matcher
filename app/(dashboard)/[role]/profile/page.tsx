"use client"

import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Mail, Phone, Camera, Info, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditProfileModal } from "@/components/dashboard/EditProfileModal"
import { updateUserAvatarAction } from "@/src/actions/user.actions"
import { useAuthStore } from "@/src/store/useAuthStore" //  Memory Store import kiya

export default function DynamicProfilePage() {
  const params = useParams()
  const role = params.role as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  //  ASLI DATA: Zustand se user aur setAuth nikalo 
  const { user, setAuth } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  //  ASLI HANDLER: Photo save karne wali logic 
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      // 1. Backend API call (Cloudinary + MongoDB) 
      const response = await updateUserAvatarAction(formData)

      if (response.success && response.avatar) {
        // 2. Zustand Store update karo taake Navbar mein bhi photo badal jaye! 🎊
        setAuth({ ...user, avatar: response.avatar } as any)
        alert("Profile picture updated")
      } else {
        alert(response.message || "Failed to update avatar")
      }
    } catch (error) {
      alert("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange} 
      />

      {/* Header with Edit Button */}
      <div className="flex items-center justify-between bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary">
             {user?.name?.substring(0,1) || "U"}
           </div>
           <div>
              <h1 className="text-2xl font-bold tracking-tight capitalize">{role} Profile</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Personal Identity</p>
           </div>
        </div>
        
        {/*  WIRING: Pass real user to Modal */}
        {user && <EditProfileModal user={{
          name: user.name,
          bio: (user as any).bio,
          phone: (user as any).phoneNumber,
          skills: (user as any).skills,
        }}
        role={role} 
         />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: Avatar Display */}
        <Card className="rounded-[2.5rem] border-border bg-card shadow-sm h-fit overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center">
            <div 
              onClick={handleAvatarClick} 
              className="relative group cursor-pointer"
            >
              <Avatar className={`w-40 h-40 border-4 border-muted transition-all ${isUploading ? 'opacity-50' : 'group-hover:brightness-75'}`}>
                {/*  ASLI AVATAR FROM STORE  */}
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold bg-primary/5 text-primary">
                   {user?.name?.substring(0, 2).toUpperCase() || "FA"}
                </AvatarFallback>
              </Avatar>
              
              {/* Camera Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="bg-primary p-3 rounded-full shadow-xl">
                   {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                 </div>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold">{user?.name || "Username"}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 bg-primary/5 px-3 py-1 rounded-full">{user?.role || role}</p>
          </CardContent>
        </Card>

        {/* RIGHT: Detailed Info Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> Professional Bio
                </h4>
                <p className="text-lg text-foreground font-medium leading-relaxed italic border-l-4 border-primary/20 pl-4">
                  "{ (user as any)?.bio || "No bio added yet."}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Access</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Mail className="w-4 h-4 text-primary" /> {user?.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Direct Contact</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Phone className="w-4 h-4 text-primary" /> { (user as any)?.phoneNumber || "Not linked"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}