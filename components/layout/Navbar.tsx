"use client"

import { Bell, Plus, Upload, Search, UserPlus, Settings } from "lucide-react"
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
import { Sun, Moon } from "lucide-react"

function useRole() {
  const pathname = usePathname()
  if (pathname.startsWith("/candidate")) return "candidate"
  if (pathname.startsWith("/admin")) return "admin"
  return "hr"
}

export function Navbar() {
  const role = useRole()
  const {theme,setTheme} = useTheme()

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

        {/* HR Buttons */}
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

        {/* Candidate Buttons */}
        {role === "candidate" && (
          <Button size="sm" className="gap-2">
            <Search className="w-4 h-4" />
            Browse Jobs
          </Button>
        )}

        {/* Admin Buttons */}
        {role === "admin" && (
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
            <Button size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {role === "hr" ? "HR" : role === "admin" ? "AD" : "CA"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">
                  {role === "hr"
                    ? "HR Manager"
                    : role === "admin"
                    ? "Admin"
                    : "Candidate"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {role === "hr"
                    ? "hr@gmail.com"
                    : role === "admin"
                    ? "admin@gmail.com"
                    : "candidate@gmail.com"}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
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