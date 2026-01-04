import { useEffect, useState, useCallback, useRef } from "react"
import { wsManager } from "@/lib/websocket"
import { getAccessToken } from "@/lib/api"
import type { WSMessage } from "@/types/messaging"

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false)
    const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
    const messageHandlerRef = useRef<((message: any) => void) | null>(null)

    useEffect(() => {
        const token = getAccessToken()
        if (!token) {
            return
        }

        // Create message handler
        const handleMessage = (message: WSMessage) => {
            setLastMessage(message)

            // Update connection status
            if (message.type === "connected") {
                setIsConnected(true)
            }
        }

        messageHandlerRef.current = handleMessage
        wsManager.addMessageHandler(handleMessage)

        // Connect WebSocket
        wsManager.connect(token)

        // Check initial connection status
        setIsConnected(wsManager.isConnected())

        // Cleanup
        return () => {
            if (messageHandlerRef.current) {
                wsManager.removeMessageHandler(messageHandlerRef.current)
            }
        }
    }, [])

    const sendMessage = useCallback((message: Partial<WSMessage>) => {
        wsManager.send(message)
    }, [])

    const sendChatMessage = useCallback((conversationId: string, content: string) => {
        wsManager.send({
            type: "chat",
            conversationId,
            content,
        })
    }, [])

    const sendTypingIndicator = useCallback((conversationId: string) => {
        wsManager.send({
            type: "typing",
            conversationId,
        })
    }, [])

    const sendReadReceipt = useCallback((conversationId: string) => {
        wsManager.send({
            type: "read",
            conversationId,
        })
    }, [])

    return {
        isConnected,
        lastMessage,
        sendMessage,
        sendChatMessage,
        sendTypingIndicator,
        sendReadReceipt,
    }
}
