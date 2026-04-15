"use client"

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
import { useState, useEffect } from "react" // 1. Ye do cheezein import karo

function useRole() {
  const pathname = usePathname()
  if (pathname.startsWith("/candidate")) return "candidate"
  if (pathname.startsWith("/admin")) return "admin"
  return "hr"
}

export function Navbar() {
  const role = useRole()
  const { theme, setTheme } = useTheme()
  
  // 2. Mounted state banao
  const [mounted, setMounted] = useState(false)

  // 3. useEffect se mounted ko true karo jab component load ho jaye
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background">

      {/* Left — Sidebar Trigger + Search */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative w-72">
          <Input
            placeholder="Search..."
            className="pl-4 rounded-full bg-muted border-0"
          />
        </div>
      </div>

      {/* Right — Role Based Buttons + Profile */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle — Condition lagao */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {/* 4. Sirf tab icon dikhao jab 'mounted' true ho */}
          {mounted ? (
            theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5" /> // Khali space jab tak load ho raha ho
          )}
        </Button>

        {/* ... baaki sara code wahi purana ... */}
        {role === "hr" && (
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Job
            </Button>
          </>
        )}
        
        {/* ... baki purana code ... */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <DropdownMenu>
          {/* Profile wala part ... */}
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {role === "hr" ? "HR" : role === "admin" ? "AD" : "CA"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">
                   {role === "hr" ? "HR Manager" : role === "admin" ? "Admin" : "Candidate"}
                </p>
                <p className="text-xs text-muted-foreground uppercase">{role}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          {/* Dropdown content ... */}
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}