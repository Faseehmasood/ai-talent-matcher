"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  ClipboardList,
  Search,
  BarChart,
  FileEdit,
  Mail,
  Plug,
  FileText
} from "lucide-react"

// Menu Configs
const hrMainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/hr/dashboard" },
  { title: "Jobs", icon: Briefcase, url: "/hr/jobs" },
  { title: "Applications", icon: ClipboardList, url: "/hr/applications" }, 
  { title: "Candidates", icon: Users, url: "/hr/candidates" },
  { title: "Schedule", icon: Calendar, url: "/hr/schedule" },
  { title: "Integrations", icon: Plug, url: "/hr/integrations" },
  { title: "Documents", icon: FileText, url: "/hr/documents" },
]

const hrJobManager = [
  { title: "Offer Templates", icon: FileEdit, url: "/hr/offer-templates" },
  { title: "Email Templates", icon: Mail, url: "/hr/email-templates" },
]

const candidateMainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/candidate/dashboard" },
  { title: "Browse Jobs", icon: Search, url: "/candidate/jobs" },
  { title: "My Applications", icon: ClipboardList, url: "/candidate/applications" },
  { title: "Schedule", icon: Calendar, url: "/candidate/schedule" },
  { title: "Documents", icon: FileText, url: "/candidate/documents" },
]

const adminMainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
  { title: "Users", icon: Users, url: "/admin/users" },
  { title: "Jobs", icon: Briefcase, url: "/admin/jobs" },
  { title: "Analytics", icon: BarChart, url: "/admin/analytics" },
]

export function AppSidebar() {
  const pathname = usePathname()
  
  // Asli Role Detection Logic
  const role = pathname.startsWith("/admin") 
  ? "admin" 
  : pathname.startsWith("/candidate") 
  ? "candidate" 
  : "hr"

  const mainMenu = role === "candidate" ? candidateMainMenu : role === "admin" ? adminMainMenu : hrMainMenu
  const showJobManager = role === "hr"

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">TalentaSync</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Recruitment Pro</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase text-muted-foreground/70 tracking-widest">Main Menu</SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {mainMenu.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url} className="rounded-xl px-4 py-6 transition-all">
                  <a href={item.url} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {showJobManager && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase text-muted-foreground/70 tracking-widest">Job Manager</SidebarGroupLabel>
            <SidebarMenu className="px-2">
              {hrJobManager.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="rounded-xl px-4 py-6 transition-all">
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-2xl">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">ST</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">Spare Team</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">Agency Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}