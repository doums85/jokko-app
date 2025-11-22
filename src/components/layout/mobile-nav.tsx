'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, MessageCircle, Users, BarChart3, Settings } from 'lucide-react'
import SidebarNav from './sidebar-nav'
import UserProfileCard from './user-profile-card'
import { useState } from 'react'

interface MobileNavProps {
    user?: {
        name: string
        email: string
        image?: string | null
    } | null
}

export default function MobileNav({ user }: MobileNavProps) {
    const [open, setOpen] = useState(false)

    const navItems = [
        { id: 'conversations', label: 'Conversations', icon: MessageCircle, href: '/dashboard/conversations' },
        { id: 'contacts', label: 'Contacts', icon: Users, href: '/dashboard/contacts' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
        { id: 'settings', label: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
    ]

    return (
        <div className="flex items-center p-4 bg-white">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[var(--spacing-sidebar-width)] p-0">
                    <div className="flex flex-col h-full">
                        <div className="p-4 flex items-center gap-2 border-b border-border-light">
                            <div className="w-8 h-8 bg-gradient-to-br from-jokko-blue to-blue-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">J</span>
                            </div>
                            <span className="font-bold text-lg text-text-primary">Jokko</span>
                        </div>

                        <nav className="flex-1 p-3 space-y-1">
                            <SidebarNav items={navItems} />
                        </nav>

                        <div className="p-3 border-t border-border-light">
                            <UserProfileCard user={user} />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            <span className="ml-2 font-bold text-lg md:hidden">Jokko</span>
        </div>
    )
}
