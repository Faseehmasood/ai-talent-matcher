"use client"

import { useState, useEffect } from "react"
import { Bell, Plus, Upload, Search, UserPlus, Settings, Sun, Moon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/src/store/useAuthStore"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { CreateJobModal } from "../dashboard/CreateJobModal"
import Link from "next/link"
import { AddUserModal } from "../dashboard/AddUserModal"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useAuthStore()


  //  FIX: Stricter Role Detection
const role = pathname.startsWith("/admin") 
  ? "admin" 
  : pathname.startsWith("/candidate") 
  ? "candidate" 
  : "hr"

  useEffect(() => setMounted(true), [])

 return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative w-72">
          <Input placeholder="Search..." className="pl-4 rounded-full bg-muted border-0 h-10 shadow-inner" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full transition-all duration-200">
          {mounted ? (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
        </Button>

        {/* HR Buttons */}
        {role === "hr" && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl hidden md:flex border-border shadow-sm">
              <Upload className="w-4 h-4" /> Import
            </Button>
            <CreateJobModal />
          </div>
        )}

        {/* Admin Buttons */}
        {role === "admin" && (
          <div className="flex items-center gap-3">
            <AddUserModal /> 
          </div>
        )}

        {/* Candidate Buttons */}
        {role === "candidate" && (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border shadow-sm">
            <Link href="/candidate/jobs" className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
          </Button>
        )}

        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </Button>

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer ml-2 hover:bg-muted/50 p-1 rounded-xl transition-colors">
              <Avatar className="w-9 h-9 border border-border shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {/* 🛠️ ASLI INITIALS (First 2 letters of name) ✅ */}
                  {user?.name?.substring(0, 2).toUpperCase() || (role === "hr" ? "HR" : role === "admin" ? "AD" : "CA")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left mr-1">
                <p className="text-sm font-bold leading-none tracking-tight">
                  {/* 🛠️ ASLI NAAM FROM ZUSTAND  */}
                  {user?.name || (role === "hr" ? "HR Manager" : role === "admin" ? "Admin" : "Candidate")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 font-medium tracking-widest">
                  {/*  ASLI ROLE FROM ZUSTAND  */}
                  {user?.role || role}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account Access</p>
                <p className="text-xs text-muted-foreground">Modify your information</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 focus:bg-primary/5">
              <Link href={`/${role}/profile`} className="flex items-center gap-2">
                 <User className="w-4 h-4" /> Profile
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 focus:bg-primary/5">
              <Link href={`/${role}/settings`} className="flex items-center gap-2">
                 <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 rounded-xl cursor-pointer font-bold py-2 focus:bg-red-50 focus:text-red-600 transition-colors">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}