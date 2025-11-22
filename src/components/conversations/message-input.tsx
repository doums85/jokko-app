'use client'

import { useState, useRef, useTransition } from 'react'
import { cn } from '@/lib/shared/cn'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Plus, Send, Paperclip, Image } from 'lucide-react'
import { sendMessage } from '@/actions/messages'

interface MessageInputProps {
    conversationId: string
}

export default function MessageInput({ conversationId }: MessageInputProps) {
    const [message, setMessage] = useState('')
    const [isPending, startTransition] = useTransition()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || isPending) return

        startTransition(async () => {
            try {
                await sendMessage({
                    text: message,
                    conversationId,
                })
                setMessage('')
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto'
                }
            } catch (error) {
                console.error('Failed to send message:', error)
            }
        })
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 p-4 bg-white border-t border-border-light"
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0"
                    >
                        <Plus className="w-5 h-5 text-text-secondary" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-40 p-2">
                    <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <Paperclip className="w-4 h-4" />
                            Fichier
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <Image className="w-4 h-4" />
                            Image
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="flex-1 bg-bg-secondary rounded-2xl px-4 py-2 border border-border-light">
                <Textarea
                    ref={textareaRef}
                    placeholder="Message..."
                    value={message}
                    onChange={handleTextChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(e as any)
                        }
                    }}
                    className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none min-h-[24px]"
                    rows={1}
                    disabled={isPending}
                />
            </div>

            <Button
                type="submit"
                disabled={!message.trim() || isPending}
                className="h-10 w-10 p-0 bg-jokko-blue hover:bg-blue-600 rounded-full"
            >
                <Send className="w-5 h-5" />
            </Button>
        </form>
    )
}
