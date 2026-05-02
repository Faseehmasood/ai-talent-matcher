"use client"
import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Mail, Phone, Camera, Info, Edit3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditProfileModal } from "@/components/dashboard/EditProfileModal"

export default function DynamicProfilePage() {
  const params = useParams()
  const role = params.role
  const fileInputRef = useRef<HTMLInputElement>(null) // Hidden input ke liye ref

  // Mock User Data
  const [userData, setUserData] = useState({
    name: "Faseeh Ahmed",
    email: "faseeh@talentsync.com",
    bio: "Passionate professional building the future of recruitment.",
    phone: "+92 300 1234567",
    avatar: "" 
  })

  // 🛠️ Avatar click handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. HIDDEN FILE INPUT (For Avatar Update) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => console.log("File selected:", e.target.files?.[0])}
      />

      {/* Header with EXPLICIT Edit Button */}
      <div className="flex items-center justify-between bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary">
             {userData.name.substring(0,1)}
           </div>
           <div>
              <h1 className="text-2xl font-bold tracking-tight capitalize">{role} Profile</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Personal Identity</p>
           </div>
        </div>
        
        {/*  ASLI EDIT MODAL BUTTON (PROMINENT)  */}
        <EditProfileModal user={userData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: Avatar with Camera Overlay */}
        <Card className="rounded-[2.5rem] border-border bg-card shadow-sm h-fit overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center">
            <div 
              onClick={handleAvatarClick} //  CLICK HANDLER 
              className="relative group cursor-pointer"
            >
              <Avatar className="w-40 h-40 border-4 border-muted transition-all group-hover:brightness-75">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback className="text-4xl font-bold bg-primary/5 text-primary">FA</AvatarFallback>
              </Avatar>
              
              {/* Camera Icon - Hamesha ready rehne ke liye */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="bg-primary p-3 rounded-full shadow-xl">
                   <Camera className="w-6 h-6 text-white" />
                 </div>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold">{userData.name}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 bg-primary/5 px-3 py-1 rounded-full">{role}</p>
          </CardContent>
        </Card>

        {/* RIGHT: Detailed Info Section (View Mode) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> About My Role
                </h4>
                <p className="text-lg text-foreground font-medium leading-relaxed italic border-l-4 border-primary/20 pl-4">
                  "{userData.bio}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Access</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Mail className="w-4 h-4 text-primary" /> {userData.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Direct Contact</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Phone className="w-4 h-4 text-primary" /> {userData.phone || "Not linked"}
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