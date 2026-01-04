// Messaging type definitions

export interface Conversation {
    id: string
    foodPostId: string
    participant1Id: string
    participant2Id: string
    lastMessageAt: string
    createdAt: string
    updatedAt: string
    // Extended fields from GET /conversations
    foodPostTitle?: string
    foodPostImageUrl?: string
    otherParticipantId?: string
    otherParticipantName?: string
    lastMessageContent?: string
    unreadCount?: number
}

export interface Message {
    id: string
    conversationId: string
    senderId: string
    content: string
    isRead: boolean
    createdAt: string
    senderName?: string
}

export interface CreateConversationRequest {
    foodPostId: string
    otherParticipantId: string
}

export interface GetMessagesParams {
    limit?: number
    offset?: number
}

export interface UnreadCountResponse {
    unreadCount: number
}

// WebSocket message types
export type WSMessageType =
    | 'connected'
    | 'chat'
    | 'typing'
    | 'read'
    | 'error'

export interface WSBaseMessage {
    type: WSMessageType
    timestamp?: string
}

export interface WSConnectedMessage extends WSBaseMessage {
    type: 'connected'
}

export interface WSChatMessageSend extends WSBaseMessage {
    type: 'chat'
    conversationId: string
    content: string
}

export interface WSChatMessageReceive extends WSBaseMessage {
    type: 'chat'
    conversationId: string
    message: Message
}

export interface WSTypingMessage extends WSBaseMessage {
    type: 'typing'
    conversationId: string
}

export interface WSReadMessage extends WSBaseMessage {
    type: 'read'
    conversationId: string
}

export interface WSErrorMessage extends WSBaseMessage {
    type: 'error'
    error: string
}

export type WSMessage =
    | WSConnectedMessage
    | WSChatMessageSend
    | WSChatMessageReceive
    | WSTypingMessage
    | WSReadMessage
    | WSErrorMessage
