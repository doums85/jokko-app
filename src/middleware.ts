import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')

    if (!session && isDashboardRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
}
