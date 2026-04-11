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
} from "lucide-react"

// Menu Items
const mainMenu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/hr/dashboard" },
  { title: "Open Hiring", icon: Briefcase, url: "/hr/jobs" },
  { title: "Candidates", icon: Users, url: "/hr/candidates" },
  { title: "Schedule", icon: Calendar, url: "/hr/schedule" },
  { title: "Integrations", icon: Plug, url: "/hr/integrations" },
  { title: "Documents", icon: FileText, url: "/hr/documents" },
]

const jobManager = [
  { title: "Offer Templates", icon: FileEdit, url: "/hr/offer-templates" },
  { title: "Email Templates", icon: Mail, url: "/hr/email-templates" },
]

const preferences = [
  { title: "Profile", icon: User, url: "/hr/profile" },
  { title: "Settings", icon: Settings, url: "/hr/settings" },
  { title: "Help Center", icon: HelpCircle, url: "/hr/help" },
  { title: "Billing", icon: CreditCard, url: "/hr/billing" },
]

export function AppSidebar() {
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

        {/* Job Manager */}
        <SidebarGroup>
          <SidebarGroupLabel>Job Manager</SidebarGroupLabel>
          <SidebarMenu>
            {jobManager.map((item) => (
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