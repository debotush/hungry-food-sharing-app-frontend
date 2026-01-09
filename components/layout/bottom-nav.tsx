"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusCircle, Clock, FileText, User, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, getAuthToken } from "@/lib/api"
import { useWebSocket } from "@/hooks/use-websocket"
import { Badge } from "@/components/ui/badge"

export function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const [myRequestsUnviewedCount, setMyRequestsUnviewedCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const { lastMessage } = useWebSocket()

  // Check auth status
  useEffect(() => {
    setIsLoggedIn(!!getAuthToken())
  }, [])

  // Fetch counts
  useEffect(() => {
    if (!isLoggedIn) return

    const fetchCounts = async () => {
      try {
        const [pending, unviewed, unread] = await Promise.all([
          api.getPendingRequestsCount(),
          api.getMyRequestsUnviewedCount(),
          api.getUnreadCount()
        ])
        setPendingRequestCount((pending as any).count || (pending as any).unreadCount || 0)
        setMyRequestsUnviewedCount((unviewed as any).count || (unviewed as any).unreadCount || 0)
        setUnreadCount((unread as any).unreadCount || (unread as any).count || 0)
      } catch (error) {
        console.error("Failed to fetch counts:", error)
      }
    }

    fetchCounts()
  }, [isLoggedIn])

  // WebSocket Listener
  useEffect(() => {
    if (!lastMessage || !isLoggedIn) return

    switch (lastMessage.type) {
      case 'chat':
        setUnreadCount(prev => prev + 1)
        break
      case 'request_created':
        setPendingRequestCount(prev => prev + 1)
        break
      case 'request_updated':
        setMyRequestsUnviewedCount(prev => prev + 1)
        break
    }
  }, [lastMessage, isLoggedIn])

  const navItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/my-requests", icon: Clock, label: "Requests", badge: myRequestsUnviewedCount },
    { href: "/create", icon: PlusCircle, label: "Create" },
    { href: "/my-posts", icon: FileText, label: "Posts", badge: pendingRequestCount },
    { href: "/profile", icon: User, label: "Profile", badge: unreadCount }, // Show message unread count on profile for now as there's no dedicated messages tab
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === "/create" && (pathname === "/create-food" || pathname === "/create-hunger"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(255,159,28,0.6)]")} />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center rounded-full animate-in zoom-in duration-300"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
