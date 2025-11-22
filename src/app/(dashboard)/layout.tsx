import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/layout/sidebar'
import MobileNav from '@/components/layout/mobile-nav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return (
        <div className="flex h-screen bg-white">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Nav */}
                <div className="md:hidden border-b border-border-light">
                    <MobileNav user={session?.user} />
                </div>

                {/* Content */}
                <main className="flex-1 overflow-hidden">{children}</main>
            </div>
        </div>
    )
}
