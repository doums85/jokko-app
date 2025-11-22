'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreVertical, LogOut } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface UserProfileCardProps {
    user?: {
        name: string
        email: string
        image?: string | null
    } | null
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
    const router = useRouter()

    if (!user) return null

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push('/login')
    }

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-secondary transition-colors">
            <Avatar className="w-9 h-9">
                <AvatarImage src={user.image || ''} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-text-secondary truncate">{user.email}</p>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4 text-text-secondary" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
