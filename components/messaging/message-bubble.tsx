"use client"

import { cn } from "@/lib/utils"
import type { Message } from "@/types/messaging"

interface MessageBubbleProps {
    message: Message
    isOwnMessage: boolean
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
    const formattedTime = new Date(message.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    })

    return (
        <div
            className={cn(
                "flex flex-col gap-1 max-w-[80%] mb-4",
                isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
            )}
        >
            {!isOwnMessage && message.senderName && (
                <span className="text-xs text-muted-foreground px-3">{message.senderName}</span>
            )}
            <div
                className={cn(
                    "rounded-2xl px-4 py-2 break-words overflow-hidden",
                    isOwnMessage
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                )}
            >
                {(message.type === 'image' || message.metadata?.imageUrl) ? (
                    <div className="relative aspect-video w-full min-w-[200px] mb-2 rounded-lg overflow-hidden">
                        <img
                            src={message.metadata.imageUrl}
                            alt="Shared image"
                            className="object-cover w-full h-full"
                        />
                    </div>
                ) : message.type === 'price_offer' && message.metadata?.amount !== undefined ? (
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <span className="text-xs opacity-70 uppercase tracking-wider font-bold">Offer</span>
                        <div className="text-2xl font-bold">€{message.metadata.amount.toFixed(2)}</div>
                        <p className="text-sm opacity-90">{message.content}</p>
                    </div>
                ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
            </div>
            <div className="flex items-center gap-2 px-3">
                <span className="text-xs text-muted-foreground">{formattedTime}</span>
                {isOwnMessage && message.isRead && (
                    <span className="text-xs text-primary">Read ✓</span>
                )}
            </div>
        </div>
    )
}
