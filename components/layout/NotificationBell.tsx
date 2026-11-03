"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bell,
  BellRing,
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getMyNotificationsAction,
  markAsReadAction,
} from "@/src/actions/notification.actions"
import Link from "next/link"

export function NotificationBell() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getMyNotificationsAction()
      if (res.success) {
        setNotifications(res.notifications || [])
        setUnreadCount(res.unreadCount || 0)
      }
    } catch {
      // Non-fatal fallback
    }
  }, [])

  // Subscribe to `/api/sse/events` instead of 5000ms setInterval polling
  useEffect(() => {
    if (!mounted) return

    let eventSource: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let isUnmounted = false
    let retryAttempt = 0

    const connectSSE = () => {
      if (isUnmounted) return

      try {
        const es = new EventSource("/api/sse/events")
        eventSource = es

        es.onopen = () => {
          retryAttempt = 0
        }

        es.onmessage = (msg) => {
          try {
            const event = JSON.parse(msg.data)
            if (!event || !event.type) return

            if (event.type === "SNAPSHOT") {
              if (Array.isArray(event.payload?.notifications)) {
                setNotifications(event.payload.notifications)
              }
              if (typeof event.payload?.unreadCount === "number") {
                setUnreadCount(event.payload.unreadCount)
              }
            } else if (event.type === "NOTIFICATION_CREATED") {
              const incoming = event.payload?.notification
              if (incoming && incoming._id) {
                setNotifications((prev) => {
                  const deduplicated = prev.filter(
                    (n) => n._id !== incoming._id
                  )
                  return [incoming, ...deduplicated].slice(0, 10)
                })
              }
              if (typeof event.payload?.unreadCount === "number") {
                setUnreadCount(event.payload.unreadCount)
              } else {
                setUnreadCount((prev) => prev + 1)
              }
            }
          } catch {
            // Ignore malformed SSE payload
          }
        }

        es.onerror = () => {
          es.close()
          if (!isUnmounted) {
            retryAttempt += 1
            const delayMs = Math.min(30000, 1500 * Math.pow(1.6, retryAttempt))
            reconnectTimer = setTimeout(connectSSE, delayMs)
          }
        }
      } catch {
        fetchNotifications()
      }
    }

    connectSSE()

    return () => {
      isUnmounted = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [mounted, fetchNotifications])

  const handleRead = async (id: string) => {
    const res = await markAsReadAction(id)
    if (res.success) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    }
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          bg: "bg-green-100",
        }
      case "alert":
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          bg: "bg-red-100",
        }
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
          bg: "bg-yellow-100",
        }
      default:
        return {
          icon: <Info className="w-4 h-4 text-primary" />,
          bg: "bg-primary/10",
        }
    }
  }

  if (!mounted)
    return (
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="w-5 h-5 text-muted-foreground" />
      </Button>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted transition-all"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white border-2 border-background animate-in fade-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-3xl p-2 shadow-2xl border-border/50 bg-card"
      >
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
            notifications.map((notif) => {
              const { icon, bg } = getIconAndColor(notif.type)
              return (
                <DropdownMenuItem
                  key={notif._id}
                  className="flex flex-col items-start gap-1 p-3 rounded-2xl cursor-pointer hover:bg-muted focus:bg-muted mb-1 transition-colors border border-transparent hover:border-border/50"
                  asChild
                >
                  <Link
                    href={notif.link || "/hr/applications"}
                    onClick={() => handleRead(notif._id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`p-2 rounded-xl shrink-0 ${bg}`}>
                        {icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold leading-tight text-foreground">
                          {notif.message}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                          {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                          notif.type === "alert"
                            ? "bg-red-500"
                            : notif.type === "success"
                            ? "bg-green-500"
                            : notif.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                      />
                    </div>
                  </Link>
                </DropdownMenuItem>
              )
            })
          ) : (
            <div className="py-12 text-center">
              <BellRing className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium italic">
                All caught up!
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
