'use client'

import { useState } from 'react'
import { cn } from '@/lib/shared/cn'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, Share2, MoreVertical } from 'lucide-react'
import { MessageStatus } from './message-status'
import { deleteMessage } from '@/actions/messages'
import { useTransition } from 'react'
import type { Message } from '@prisma/client'
import { useUser } from '@/hooks/use-user' // Need to create this or use session

interface MessageItemProps {
    message: Message & { sender: any }
}

export default function MessageItem({ message }: MessageItemProps) {
    const [isPending, startTransition] = useTransition()
    // We need to know if it's own message. 
    // Ideally passed from parent or fetched from context.
    // For now I'll assume senderId comparison with a hook or prop.
    // The user code had: const isOwn = message.senderId === 'current-user-id'

    // I'll use a hook to get current user.
    const { user } = useUser()
    const isOwn = user?.id === message.senderId

    const handleDelete = () => {
        startTransition(async () => {
            await deleteMessage(message.id)
        })
    }

    return (
        <div className={cn('flex gap-2 group', isOwn && 'flex-row-reverse')}>
            {!isOwn && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.sender?.image || ''} />
                    <AvatarFallback>{message.sender?.name?.[0]}</AvatarFallback>
                </Avatar>
            )}

            <div className={cn('flex flex-col gap-1 max-w-xs', isOwn && 'items-end')}>
                <div className="flex items-end gap-1 group">
                    <div
                        className={cn(
                            'px-3 py-2 rounded-2xl text-sm break-words',
                            isOwn ? 'message-bubble-sent' : 'message-bubble-received'
                        )}
                    >
                        {message.text}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(message.text)}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Transférer
                            </DropdownMenuItem>
                            {isOwn && (
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className={cn(
                    'flex items-center gap-2 text-xs text-text-secondary',
                    isOwn && 'flex-row-reverse'
                )}>
                    <span>
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    {isOwn && <MessageStatus status={message.status} />}
                </div>
            </div>
        </div>
    )
}
