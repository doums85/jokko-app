'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/shared/cn'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface SidebarNavProps {
    items: {
        id: string
        label: string
        icon: LucideIcon
        href: string
    }[]
}

export default function SidebarNav({ items }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col gap-1">
            {items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                    <Button
                        key={item.id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                            'w-full justify-start gap-2',
                            isActive && 'bg-bg-secondary text-jokko-blue font-medium'
                        )}
                        asChild
                    >
                        <Link href={item.href}>
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    </Button>
                )
            })}
        </div>
    )
}
