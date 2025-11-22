import { db } from '@/lib/server/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { ConversationWithDetails } from '@/lib/shared/types'
import ConversationsLayoutClient from './conversations-layout-client'

export default async function ConversationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    const conversations = await db.conversation.findMany({
        where: { userId: session.user.id },
        orderBy: { lastMessageAt: 'desc' },
        include: {
            contact: true,
            messages: {
                take: 1,
                orderBy: { timestamp: 'desc' }
            }
        }
    })

    // Transform to match ConversationWithDetails
    const formattedConversations: ConversationWithDetails[] = conversations.map(c => ({
        ...c,
        messages: c.messages,
        lastMessage: c.messages[0],
        unreadCount: c.unreadCount || 0,
        status: (c.status as 'active' | 'pending' | 'closed') || 'active'
    }))

    return (
        <ConversationsLayoutClient conversations={formattedConversations}>
            {children}
        </ConversationsLayoutClient>
    )
}
