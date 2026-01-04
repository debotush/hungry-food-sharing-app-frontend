"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Conversation } from "@/types/messaging"
import { MessageCircle } from "lucide-react"

interface ConversationListItemProps {
    conversation: Conversation
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
    const timeAgo = getTimeAgo(conversation.lastMessageAt)

    return (
        <Link href={`/messages/${conversation.id}`}>
            <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        {/* Food Post Image */}
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            {conversation.foodPostImageUrl ? (
                                <Image
                                    src={conversation.foodPostImageUrl}
                                    alt={conversation.foodPostTitle || "Food"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">
                                        {conversation.foodPostTitle || "Food Post"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {conversation.otherParticipantName}
                                    </p>
                                </div>
                                {conversation.unreadCount && conversation.unreadCount > 0 && (
                                    <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                                        {conversation.unreadCount}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {conversation.lastMessageContent || "No messages yet"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
}
