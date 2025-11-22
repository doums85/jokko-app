import type { Conversation, Message, Contact, User } from '@prisma/client'

export type ConversationWithDetails = Conversation & {
    contact: Contact
    messages: Message[]
    unreadCount: number
    status: 'active' | 'pending' | 'closed'
    lastMessage?: Message
}

export type MessageWithSender = Message & {
    sender: Pick<User, 'id' | 'name' | 'image'>
}

export interface Session {
    user: {
        id: string
        name: string
        email: string
        image: string
    }
    expires: Date
}
