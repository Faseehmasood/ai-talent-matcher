"use client"

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
  Plug,
  FileText,
  FileEdit,
  Mail,
  User,
  Settings,
  HelpCircle,
  CreditCard,
  ClipboardList,
  Search,
  Shield,
  BarChart,
} from "lucide-react"

// HR Menu
const hrMainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/hr/dashboard" },
  { title: "Open Hiring", icon: Briefcase, url: "/hr/jobs" },
  { title: "Candidates", icon: Users, url: "/hr/candidates" },
  { title: "Schedule", icon: Calendar, url: "/hr/schedule" },
  { title: "Integrations", icon: Plug, url: "/hr/integrations" },
  { title: "Documents", icon: FileText, url: "/hr/documents" },
]

const hrJobManager = [
  { title: "Offer Templates", icon: FileEdit, url: "/hr/offer-templates" },
  { title: "Email Templates", icon: Mail, url: "/hr/email-templates" },
]

// Candidate Menu
const candidateMainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/candidate/dashboard" },
  { title: "Browse Jobs", icon: Search, url: "/candidate/jobs" },
  { title: "My Applications", icon: ClipboardList, url: "/candidate/applications" },
  { title: "Schedule", icon: Calendar, url: "/candidate/schedule" },
  { title: "Documents", icon: FileText, url: "/candidate/documents" },
]

// Admin Menu
const adminMainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
  { title: "Users", icon: Users, url: "/admin/users" },
  { title: "Jobs", icon: Briefcase, url: "/admin/jobs" },
  { title: "Analytics", icon: BarChart, url: "/admin/analytics" },
  { title: "Settings", icon: Shield, url: "/admin/settings" },
]

// Common Preferences
const preferences = [
  { title: "Profile", icon: User, url: "/profile" },
  { title: "Settings", icon: Settings, url: "/settings" },
  { title: "Help Center", icon: HelpCircle, url: "/help" },
  { title: "Billing", icon: CreditCard, url: "/billing" },
]

// Role detect karo URL se
import { usePathname } from "next/navigation"

function useRole() {
  const pathname = usePathname()
  if (pathname.startsWith("/candidate")) return "candidate"
  if (pathname.startsWith("/admin")) return "admin"
  return "hr"
}

export function AppSidebar() {
  const role = useRole()

  const mainMenu =
    role === "candidate"
      ? candidateMainMenu
      : role === "admin"
      ? adminMainMenu
      : hrMainMenu

  const showJobManager = role === "hr"

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <p className="font-bold text-sm">TalentaSync</p>
            <p className="text-xs text-muted-foreground">Your Recruitment Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarMenu>
            {mainMenu.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Job Manager — Sirf HR */}
        {showJobManager && (
          <SidebarGroup>
            <SidebarGroupLabel>Job Manager</SidebarGroupLabel>
            <SidebarMenu>
              {hrJobManager.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Preferences */}
        <SidebarGroup>
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarMenu>
            {preferences.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-full" />
          <div>
            <p className="text-sm font-medium">Spare Team</p>
            <p className="text-xs text-muted-foreground">Marketing Agency</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}