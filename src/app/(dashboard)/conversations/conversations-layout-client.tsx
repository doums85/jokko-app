'use client'

import { useParams } from 'next/navigation'
import ConversationListContainer from './_components/conversation-list-container'
import { ConversationWithDetails } from '@/lib/shared/types'
import { cn } from '@/lib/shared/cn'

export default function ConversationsLayoutClient({
    conversations,
    children
}: {
    conversations: ConversationWithDetails[]
    children: React.ReactNode
}) {
    const params = useParams()
    const isConversationSelected = !!params?.conversationId

    return (
        <div className="flex h-full w-full">
            <ConversationListContainer initialConversations={conversations} />

            <div className={cn(
                "flex-1 flex-col bg-bg-secondary h-full",
                isConversationSelected ? "flex w-full" : "hidden md:flex"
            )}>
                {children}
            </div>
        </div>
    )
}
