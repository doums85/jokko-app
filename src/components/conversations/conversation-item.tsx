'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/shared/cn'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pin, Archive, Trash2 } from 'lucide-react'
import { archiveConversation } from '@/actions/conversations'
import { useTransition } from 'react'
import type { ConversationWithDetails } from '@/lib/shared/types'

interface ConversationItemProps {
    conversation: ConversationWithDetails
    isSelected?: boolean
}

export default function ConversationItem({
    conversation,
    isSelected = false,
}: ConversationItemProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSelect = () => {
        router.push(`/dashboard/conversations/${conversation.id}`)
    }

    const handleArchive = () => {
        startTransition(async () => {
            await archiveConversation(conversation.id)
        })
    }

    const timeAgo = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (hours === 0) return 'À l\'instant'
        if (hours < 24) return `Il y a ${hours}h`
        if (days === 1) return 'Hier'
        return new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }

    return (
        <div
            onClick={handleSelect}
            className={cn(
                'h-[72px] px-2 py-1 rounded-lg flex items-center gap-3 cursor-pointer transition-colors group',
                'hover:bg-bg-secondary',
                isSelected && 'conversation-item-active'
            )}
        >
            <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={conversation.contact.avatarUrl || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600">
                    {conversation.contact.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className={cn(
                        'text-sm font-semibold truncate',
                        conversation.unreadCount > 0 ? 'text-text-primary' : 'text-text-secondary'
                    )}>
                        {conversation.contact.name}
                    </h3>
                    <span className="text-xs text-text-secondary flex-shrink-0">
                        {timeAgo(conversation.lastMessageAt)}
                    </span>
                </div>
                <p className="text-sm text-text-secondary truncate">
                    {conversation.messages?.[0]?.text || 'Aucun message'}
                </p>
            </div>

            {conversation.unreadCount > 0 && (
                <Badge className="bg-jokko-blue text-white rounded-full">
                    {conversation.unreadCount}
                </Badge>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Pin className="w-4 h-4 mr-2" />
                        Épingler
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archiver
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
