"use client"

import { useState, useEffect } from "react"
import { Bell, Info, BellRing, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getMyNotificationsAction, markAsReadAction } from "@/src/actions/notification.actions"
import Link from "next/link"

export function NotificationBell() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // 1. HYDRATION GUARD: Server aur Client ka conflict rokne ke liye ✅
  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. FETCH LOGIC: Database se tazza notifications laao ✅
  const fetchNotifications = async () => {
    try {
      const res = await getMyNotificationsAction()
      if (res.success) {
        setNotifications(res.notifications || [])
        setUnreadCount(res.unreadCount || 0)
      }
    } catch (error) {
      console.error("🔔 Notification Fetch Error:", error)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchNotifications()
      // 🚀 POLLING: Har 5 second baad check karo (Testing ke liye fast rakha hai)
      const interval = setInterval(fetchNotifications, 5000) 
      return () => clearInterval(interval)
    }
  }, [mounted])

  // 3. MARK AS READ: Jab user click kare ✅
  const handleRead = async (id: string) => {
    const res = await markAsReadAction(id)
    if (res.success) {
      // Ginti foran kam karo taake UI fast lagay
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setNotifications((prev) => prev.filter(n => n._id !== id))
    }
  }

  // Jab tak mounted nahi, sirf aik khali bell dikhao
  if (!mounted) return <Button variant="ghost" size="icon" className="rounded-full"><Bell className="w-5 h-5 text-muted-foreground" /></Button>

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted transition-all">
          <Bell className="w-5 h-5 text-muted-foreground" />
          
          {/* 🔴 RED NUMERIC BADGE: Sirf tab jab ginti 0 se zyada ho ✅ */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white border-2 border-background animate-in fade-in zoom-in duration-300">
               {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 rounded-3xl p-2 shadow-2xl border-border/50 bg-card">
        <DropdownMenuLabel className="flex items-center justify-between p-3">
          <span className="font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">
              {unreadCount} New
            </span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="opacity-50" />

        <div className="max-h-[350px] overflow-y-auto p-1">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif._id} 
                className="flex flex-col items-start gap-1 p-3 rounded-2xl cursor-pointer hover:bg-muted focus:bg-muted mb-1 transition-colors border border-transparent hover:border-border/50"
                asChild
              >
                <Link href={notif.link} onClick={() => handleRead(notif._id)}>
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                       <Info className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <p className="text-xs font-bold leading-tight text-foreground">{notif.message}</p>
                       <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                         {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-12 text-center">
               <BellRing className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
               <p className="text-xs text-muted-foreground font-medium italic">All caught up!</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}