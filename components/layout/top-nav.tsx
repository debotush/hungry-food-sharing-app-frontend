"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, MessageCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useWebSocket } from "@/hooks/use-websocket"

export function TopNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const { lastMessage } = useWebSocket()

  const handleLogout = async () => {
    await api.logout()
  }

  // Fetch unread count on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await api.getUnreadCount()
        setUnreadCount((data as any).unreadCount || 0)
      } catch (error) {
        // Silently fail if backend messaging endpoints are not implemented yet
        // This prevents console errors during development
        setUnreadCount(0)
      }
    }
    fetchUnreadCount()
  }, [])

  // Update unread count when new messages arrive
  useEffect(() => {
    if (lastMessage?.type === "chat") {
      const fetchUnreadCount = async () => {
        try {
          const data = await api.getUnreadCount()
          setUnreadCount((data as any).unreadCount || 0)
        } catch (error) {
          // Silently fail - backend not ready
          setUnreadCount(0)
        }
      }
      fetchUnreadCount()
    }
  }, [lastMessage])

  const navLinks = [
    { href: "/feed", label: "Home" },
    { href: "/create-food", label: "Share Food" },
    { href: "/create-hunger", label: "Broadcast Hunger" },
    { href: "/my-requests", label: "My Requests" },
    { href: "/my-posts", label: "My Posts" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/feed" className="flex items-center space-x-2">
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-foreground">hungry</span>
            <div className="h-0.5 w-full bg-primary rounded-full" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "default" : "ghost"}
                className={
                  pathname === link.href
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-hover"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {link.label}
              </Button>
            </Link>
          ))}

          {/* Messages Link with Badge */}
          <Link href="/messages">
            <Button
              variant={pathname?.startsWith("/messages") ? "default" : "ghost"}
              className={
                pathname?.startsWith("/messages")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-hover relative"
                  : "text-muted-foreground hover:text-foreground relative"
              }
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground px-1.5 py-0 text-xs min-w-[20px] h-5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full bg-transparent">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
