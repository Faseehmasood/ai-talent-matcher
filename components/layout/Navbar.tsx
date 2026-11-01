"use client"

import { useEffect } from "react"
import { logoutAction } from "@/src/actions/user.actions"
import { Search, Settings, Sun, Moon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { AddUserModal } from "../dashboard/AddUserModal"
import { NotificationBell } from "@/components/layout/NotificationBell"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, setAuth, logout } = useAuthStore()

  useEffect(() => {
    let active = true
    if (!user) {
      fetch("/api/auth/me", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.success && data.user) {
            setAuth(data.user)
          }
        })
        .catch(() => {})
    }
    return () => {
      active = false
    }
  }, [user, setAuth])

  const handleLogout = async () => {
    const res = await logoutAction()
    if (res.success) {
      logout()
      window.location.href = "/login"
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
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full transition-all duration-200"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          {role === "admin" && <AddUserModal />}
          {role === "candidate" && (
            <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl border-border shadow-sm">
              <Link href="/candidate/jobs">
                <Search className="w-4 h-4" /> Browse Jobs
              </Link>
            </Button>
          )}
        </div>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer ml-2 hover:bg-muted/50 p-1.5 rounded-2xl transition-all border border-transparent hover:border-border">
              <Avatar className="w-9 h-9 border border-border shadow-sm">
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() || "GU"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left mr-1">
                <p className="text-sm font-bold leading-none tracking-tight">
                  {user?.name || "Loading..."}
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
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 rounded-xl cursor-pointer font-bold py-2 focus:bg-red-50 focus:text-red-600"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
