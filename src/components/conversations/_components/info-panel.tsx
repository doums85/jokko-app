'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bell, Phone, Video, Search, MoreVertical } from 'lucide-react'

export default function InfoPanel({ conversationId }: { conversationId: string }) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-border-light flex items-center justify-between">
                <h3 className="font-semibold">Infos du contact</h3>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">Contact Name</h2>
                <p className="text-text-secondary">+33 6 12 34 56 78</p>
            </div>

            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between p-3 hover:bg-bg-secondary rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-text-secondary" />
                        <span>Notifications</span>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-bg-secondary rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-text-secondary" />
                        <span>Rechercher</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
