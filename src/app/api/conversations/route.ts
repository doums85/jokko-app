import { db } from '@/lib/server/db'
import { auth } from '@/lib/auth'
import { conversationSchema } from '@/lib/shared/validation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        })
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const conversations = await db.conversation.findMany({
            where: { userId: session.user.id },
            orderBy: { lastMessageAt: 'desc' },
            include: { contact: true, messages: { take: 1 } },
        })

        return NextResponse.json(conversations)
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        })
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const validated = conversationSchema.parse(data)

        const conversation = await db.conversation.create({
            data: {
                userId: session.user.id,
                contactId: validated.contactId,
                subject: validated.subject,
            },
        })

        return NextResponse.json(conversation, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
