"use client"

import { useEffect, useState } from "react"
import { TopNav } from "@/components/layout/top-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { AuthGuard } from "@/components/layout/auth-guard"
import { ConversationListItem } from "@/components/messaging/conversation-list-item"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/hooks/use-websocket"
import { Loader2, MessageCircle } from "lucide-react"
import type { Conversation } from "@/types/messaging"

export default function MessagesPage() {
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

                <main className="container max-w-3xl mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                        <p className="text-muted-foreground mt-1">
                            Chat with others about food posts
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <p className="text-lg text-muted-foreground">No conversations yet</p>
                            <p className="text-sm text-muted-foreground">
                                Start a conversation by messaging someone about their food post
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
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
