"use client"

import { useEffect, useState } from "react"
import { TopNav } from "@/components/layout/top-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { AuthGuard } from "@/components/layout/auth-guard"
import { ConversationListItem } from "@/components/messaging/conversation-list-item"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/hooks/use-websocket"
import { Loader2, MessageCircle, ChevronRight, Utensils, MessageSquare } from "lucide-react"
import type { Conversation } from "@/types/messaging"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { lastMessage } = useWebSocket()

    const fetchConversations = async () => {
        setIsLoading(true)
        try {
            const data = await api.getConversations()
            const conversationsArray = Array.isArray(data) ? data : []
            setConversations(conversationsArray)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to load conversations",
                description: error instanceof Error ? error.message : "Something went wrong.",
            })
            setConversations([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConversations()
    }, [])

    // Update conversation list when new messages arrive
    useEffect(() => {
        if (lastMessage?.type === "chat") {
            fetchConversations()
        }
    }, [lastMessage])

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background pb-20 md:pb-0">
                <TopNav />

                <main className="container max-w-3xl mx-auto px-4 py-8">
                    <div className="mb-8 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1 pt-1 bg-primary rounded-full" />
                            <h1 className="text-4xl font-extrabold tracking-tight text-white">Messages</h1>
                        </div>
                        <p className="text-muted-foreground text-lg ml-4">
                            Coordinate with other foodies in the community
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                <Loader2 className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-16 text-center space-y-6">
                            <div className="mx-auto w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
                                <MessageSquare className="h-10 w-10 text-zinc-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">No active chats</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto">
                                    Start a conversation by messaging someone about their food share!
                                </p>
                            </div>
                            <Button onClick={() => router.push('/feed')} className="rounded-full px-10 shadow-lg glow-primary">
                                Browse Community Feed
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {conversations.map((conversation) => (
                                <ConversationListItem
                                    key={conversation.id}
                                    conversation={conversation}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <BottomNav />
            </div>
        </AuthGuard>
    )
}
