"use client"

import { Bell, Plus, Upload } from "lucide-react"
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

export function Navbar() {
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

      {/* Right — Buttons + Profile */}
      <div className="flex items-center gap-3">
        {/* Import Button */}
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Import
        </Button>

        {/* Create Job Button */}
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Job
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
                <AvatarFallback>SW</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Sophia Williams</p>
                <p className="text-xs text-muted-foreground">sophia@gmail.com</p>
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