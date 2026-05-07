"use client"

import { logoutAction } from "@/src/actions/user.actions"
import { Bell, Upload, Search, Settings, Sun, Moon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/src/store/useAuthStore"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { CreateJobModal } from "../dashboard/CreateJobModal"
import Link from "next/link"
import { AddUserModal } from "../dashboard/AddUserModal"
import { NotificationBell } from "@/components/layout/NotificationBell"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuthStore() // Store se user aur logout dono liye
  const router = useRouter()

  const handleLogout = async () => {
    const res = await logoutAction()
    if (res.success) {
      logout()
      window.location.href = "/login" // Hard refresh for safety 
    }
  }

  const role = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/candidate")
    ? "candidate"
    : "hr"

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {/* <div className="relative w-72 hidden md:block">
          <Input
            placeholder="Search resources..."
            className="pl-4 rounded-full bg-muted border-0 h-10 shadow-inner"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </Button>

        {/* Role Based Buttons */}
        <div className="flex items-center gap-2">
            {/* {role === "hr" && (
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl hidden lg:flex border-border shadow-sm">
                    <Upload className="w-4 h-4" /> Import
                    </Button>
                    <CreateJobModal />
                </div>
            )} */}
            {role === "admin" && <AddUserModal />}
            {role === "candidate" && (
                <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl border-border shadow-sm">
                    <Link href="/candidate/jobs"><Search className="w-4 h-4" /> Browse Jobs</Link>
                </Button>
            )}
        </div>

        <NotificationBell />

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer ml-2 hover:bg-muted/50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-border">
              <Avatar className="w-9 h-9 border border-border shadow-sm">
                {/*  ASLI IMAGE FROM ZUSTAND  */}
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() || "GU"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left mr-1">
                <p className="text-sm font-bold leading-none tracking-tight">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 font-medium tracking-widest">
                  {user?.role || role}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50 bg-card">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold">Account Access</p>
                <p className="text-xs text-muted-foreground">Manage your information</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 focus:bg-primary/5">
              <Link href={`/${role}/profile`} className="flex items-center gap-2"><User className="w-4 h-4" /> Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 focus:bg-primary/5">
              <Link href={`/${role}/settings`} className="flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 rounded-xl cursor-pointer font-bold py-2 focus:bg-red-50 focus:text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}