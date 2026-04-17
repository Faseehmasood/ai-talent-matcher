"use client"

import { useState, useEffect } from "react"
import { Bell, Plus, Upload, Search, UserPlus, Settings, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { CreateJobModal } from "../dashboard/CreateJobModal"
import Link from "next/link"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [role, setRole] = useState<string>("hr")
  const [mounted, setMounted] = useState(false)

  // 🛠️ Hydration fix and Role Persistence
  useEffect(() => {
    setMounted(true)
    if (pathname.startsWith("/admin")) {
      setRole("admin")
      localStorage.setItem("userRole", "admin")
    } else if (pathname.startsWith("/candidate")) {
      setRole("candidate")
      localStorage.setItem("userRole", "candidate")
    } else if (pathname.startsWith("/hr")) {
      setRole("hr")
      localStorage.setItem("userRole", "hr")
    } else {
      const savedRole = localStorage.getItem("userRole")
      if (savedRole) setRole(savedRole)
    }
  }, [pathname])

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative w-72">
          <Input placeholder="Search..." className="pl-4 rounded-full bg-muted border-0" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {mounted ? (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
        </Button>

        {/* Role Based Actions */}
        {role === "hr" && (
          <>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl hidden md:flex">
              <Upload className="w-4 h-4" /> Import
            </Button>
            <CreateJobModal />
          </>
        )}

        {role === "admin" && (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        )}

        {role === "candidate" && (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <Search className="w-4 h-4" /> Browse Jobs
          </Button>
        )}

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer ml-2">
              <Avatar className="w-9 h-9 border border-border">
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {role === "hr" ? "HR" : role === "admin" ? "AD" : "CA"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold leading-none">
                  {role === "hr" ? "HR Manager" : role === "admin" ? "Admin" : "Candidate"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase mt-1">{role}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">My Account</p>
                <p className="text-xs text-muted-foreground">Manage profile settings</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 rounded-lg cursor-pointer font-medium">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}