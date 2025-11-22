import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, Users, BarChart3, Settings, Plus } from 'lucide-react'
import SidebarNav from './sidebar-nav'
import UserProfileCard from './user-profile-card'

export default async function Sidebar() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const navItems = [
        { id: 'conversations', label: 'Conversations', icon: MessageCircle, href: '/dashboard/conversations' },
        { id: 'contacts', label: 'Contacts', icon: Users, href: '/dashboard/contacts' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
        { id: 'settings', label: 'Paramètres', icon: Settings, href: '/dashboard/settings' },
    ]

    return (
        <aside className="hidden md:flex w-[var(--spacing-sidebar-width)] flex-col bg-white border-r border-border-light">
            {/* Logo */}
            <div className="p-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-jokko-blue to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="font-bold text-lg text-text-primary">Jokko</span>
            </div>

            <Separator />

            {/* Actions */}
            <div className="p-3">
                <Button className="w-full bg-jokko-blue hover:bg-blue-600 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau message
                </Button>
            </div>

            <Separator />

            {/* Navigation */}
            <ScrollArea className="flex-1">
                <nav className="p-3 space-y-1">
                    <SidebarNav items={navItems} />
                </nav>
            </ScrollArea>

            <Separator />

            {/* User Profile */}
            <div className="p-3">
                <UserProfileCard user={session?.user} />
            </div>
        </aside>
    )
}


