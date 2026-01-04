"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface MessageInputProps {
    onSendMessage: (content: string) => void
    onTyping: () => void
    disabled?: boolean
}

export function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
    const [message, setMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    const handleSend = () => {
        if (!message.trim() || disabled) return
        onSendMessage(message.trim())
        setMessage("")

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }

        // Debounced typing indicator
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            onTyping()
        }, 500)
    }

    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current)
        }
    }, [])

    return (
        <div className="border-t border-border bg-background p-4">
            <div className="flex items-end gap-2">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    disabled={disabled}
                    className="min-h-[44px] max-h-[200px] resize-none"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="icon"
                    className="h-11 w-11 flex-shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
