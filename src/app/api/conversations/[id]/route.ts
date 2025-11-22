import { db } from '@/lib/server/db'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        })
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const conversation = await db.conversation.findUnique({
            where: { id },
            include: {
                contact: true,
                messages: { orderBy: { timestamp: 'asc' }, include: { sender: true } },
            },
        })

        if (!conversation || conversation.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json(conversation)
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
