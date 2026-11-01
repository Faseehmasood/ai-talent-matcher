import { AppSidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        
        
        <AppSidebar />

        
        <div className="flex flex-col flex-1 overflow-hidden">
          
          
          <Navbar />

          
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  )
}