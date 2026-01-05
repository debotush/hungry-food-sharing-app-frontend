"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { TopNav } from "@/components/layout/top-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { AuthGuard } from "@/components/layout/auth-guard"
import { MessageBubble } from "@/components/messaging/message-bubble"
import { TypingIndicator } from "@/components/messaging/typing-indicator"
import { MessageInput } from "@/components/messaging/message-input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/hooks/use-websocket"
import { Loader2, ArrowLeft } from "lucide-react"
import type { Message, Conversation } from "@/types/messaging"
import Link from "next/link"

export default function ConversationPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const conversationId = params.id as string

    const [messages, setMessages] = useState<Message[]>([])
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>("")

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const { lastMessage, sendChatMessage, sendTypingIndicator, sendReadReceipt } = useWebSocket()

    // Get current user ID
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await api.getMe()
                setCurrentUserId((user as any).id)
            } catch (error) {
                console.error("Failed to get user:", error)
            }
        }
        fetchUser()
    }, [])

    // Fetch conversation and messages
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [conversationData, messagesData] = await Promise.all([
                    api.getConversations(),
                    api.getConversationMessages(conversationId, { limit: 50 }),
                ])

                // Find the specific conversation
                const conversationsArray = Array.isArray(conversationData) ? conversationData : []
                const conv = conversationsArray.find((c: Conversation) => c.id === conversationId)
                setConversation(conv || null)

                // Set messages (reverse to show oldest first)
                const messagesArray = Array.isArray(messagesData) ? messagesData : []
                setMessages(messagesArray.reverse())

                // Mark messages as read
                await api.markMessagesAsRead(conversationId)
                sendReadReceipt(conversationId)

                scrollToBottom()
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Failed to load conversation",
                    description: error instanceof Error ? error.message : "Something went wrong.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (conversationId) {
            fetchData()
        }
    }, [conversationId, sendReadReceipt, toast])

    // Handle incoming WebSocket messages
    useEffect(() => {
        if (!lastMessage) return

        if (lastMessage.type === "chat" && lastMessage.conversationId === conversationId) {
            const chatMessage = lastMessage as any
            if (chatMessage.message) {
                setMessages((prev) => [...prev, chatMessage.message])
                scrollToBottom()

                // Mark as read if not own message
                if (chatMessage.message.senderId !== currentUserId) {
                    api.markMessagesAsRead(conversationId)
                    sendReadReceipt(conversationId)
                }
            }
        } else if (lastMessage.type === "typing" && lastMessage.conversationId === conversationId) {
            setIsTyping(true)
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false)
            }, 3000)
        } else if (lastMessage.type === "read" && lastMessage.conversationId === conversationId) {
            // Update read status for own messages
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.senderId === currentUserId ? { ...msg, isRead: true } : msg
                )
            )
        }
    }, [lastMessage, conversationId, currentUserId])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }

    const handleSendMessage = (content: string, type?: 'text' | 'image' | 'price_offer', metadata?: any) => {
        sendChatMessage(conversationId, content, type, metadata)
    }

    const handleTyping = () => {
        sendTypingIndicator(conversationId)
    }

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
                <TopNav />

                {/* Header */}
                <div className="border-b border-border bg-card/95 backdrop-blur sticky top-16 z-40">
                    <div className="container max-w-3xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Link href="/messages">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-sm truncate">
                                    {conversation?.foodPostTitle || "Conversation"}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {conversation?.otherParticipantName}
                                </p>
                            </div>
                            {conversation?.foodPostId && (
                                <Link href={`/food/${conversation.foodPostId}`}>
                                    <Button variant="outline" size="sm">
                                        View Post
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    <div className="container max-w-3xl mx-auto px-4 py-6">
                        {messages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        isOwnMessage={message.senderId === currentUserId}
                                    />
                                ))}
                                {isTyping && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                </div>

                {/* Message Input */}
                <div className="sticky bottom-0 md:bottom-0">
                    <div className="container max-w-3xl mx-auto">
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                        />
                    </div>
                </div>

                <BottomNav />
            </div>
        </AuthGuard>
    )
}
