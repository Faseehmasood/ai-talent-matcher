"use client"

import { usePathname } from "next/navigation"
import { useAuthStore } from "@/src/store/useAuthStore"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" 
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
  const { user } = useAuthStore() //  Asli user data nikaalo store se
  
  const role = pathname.startsWith("/admin") 
  ? "admin" 
  : pathname.startsWith("/candidate") 
  ? "candidate" 
  : "hr"

  const mainMenu = role === "candidate" ? candidateMainMenu : role === "admin" ? adminMainMenu : hrMainMenu
  const showJobManager = role === "hr"

  return (
    <Sidebar>
      {/* Logo Section */}
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
                <SidebarMenuButton asChild isActive={pathname === item.url} className="rounded-xl px-4 py-6 transition-all hover:bg-muted">
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
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="rounded-xl px-4 py-6 transition-all hover:bg-muted">
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

      {/* Sidebar Footer — Asli User Profile  */}
      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-2xl">
          
          {/*  ASLI IMAGE IN SIDEBAR FOOTER */}
          <Avatar className="w-8 h-8 border border-border shadow-sm">
             <AvatarImage src={user?.avatar} className="object-cover" />
             <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || "UN"}
             </AvatarFallback>
          </Avatar>

          <div className="flex-1 overflow-hidden text-left">
            <p className="text-xs font-bold truncate text-foreground">{user?.name || "Guest User"}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">
              {user?.role || "Active Account"}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}