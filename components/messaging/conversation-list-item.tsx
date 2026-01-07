"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Conversation } from "@/types/messaging"
import { MessageCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface ConversationListItemProps {
    conversation: Conversation
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
    const timeAgo = formatRelativeTime(conversation.lastMessageAt)

    return (
        <Link href={`/messages/${conversation.id}`} className="block">
            <Card
                className={`
                    group relative overflow-hidden transition-all duration-300 ease-out border-white/10
                    bg-card/40 backdrop-blur-md hover:bg-card/60 hover:border-white/20
                    hover:scale-[1.01] hover:shadow-xl cursor-pointer
                    ${conversation.unreadCount && conversation.unreadCount > 0 ? "ring-1 ring-primary/30 bg-primary/5" : ""}
                `}
            >
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        {/* Food Post Image */}
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
                            {conversation.foodPostImageUrl ? (
                                <Image
                                    src={conversation.foodPostImageUrl}
                                    alt={conversation.foodPostTitle || "Food"}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                    <MessageCircle className="h-6 w-6 text-zinc-600" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base text-white truncate group-hover:text-primary transition-colors">
                                        {conversation.foodPostTitle || conversation.hungerBroadcastTitle || "Food Chat"}
                                    </h3>
                                    <p className="text-xs font-medium text-primary/80">
                                        {conversation.otherParticipantName}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className="text-[10px] font-medium text-zinc-500">{timeAgo}</span>
                                    {conversation.unreadCount !== undefined && conversation.unreadCount > 0 && (
                                        <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold shadow-[0_0_10px_rgba(var(--primary),0.3)] animate-pulse">
                                            {conversation.unreadCount}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-1 italic pr-2">
                                {conversation.lastMessageContent || "No messages yet"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}


