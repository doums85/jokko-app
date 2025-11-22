'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import ConversationItem from '@/components/conversations/conversation-item'
import type { ConversationWithDetails } from '@/lib/shared/types'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/shared/cn'

interface ConversationListContainerProps {
    initialConversations: ConversationWithDetails[]
}

export default function ConversationListContainer({
    initialConversations,
}: ConversationListContainerProps) {
    const params = useParams()
    const [conversations, setConversations] = useState(initialConversations)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('all')
    const [isPending, startTransition] = useTransition()

    const filteredConversations = conversations.filter(c => {
        let match = true

        if (filter === 'unread') match = c.unreadCount > 0
        if (filter === 'pending') match = c.status === 'pending'
        if (filter === 'archived') match = c.archived

        if (searchQuery) {
            const lastMessageText = c.messages?.[0]?.text || ''
            match =
                match &&
                (c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()))
        }

        return match
    })

    return (
        <div className={cn(
            "w-full md:w-[var(--spacing-conversation-list-width)] flex flex-col h-full bg-white border-r border-border-light",
            params?.conversationId ? "hidden md:flex" : "flex"
        )}>
            {/* Search */}
            <div className="p-3 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-full border-border-light"
                    />
                </div>

                {/* Filtres */}
                <Tabs value={filter} onValueChange={setFilter}>
                    <TabsList className="grid w-full grid-cols-4 bg-bg-secondary">
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="unread">Non lus</TabsTrigger>
                        <TabsTrigger value="pending">En attente</TabsTrigger>
                        <TabsTrigger value="archived">Archivés</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                <div className="space-y-1 p-1">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary text-sm">
                            Aucune conversation
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
