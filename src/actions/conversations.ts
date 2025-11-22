'use server'

import { db } from '@/lib/server/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function archiveConversation(conversationId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error('Unauthorized')

    await db.conversation.update({
        where: {
            id: conversationId,
            userId: session.user.id, // Security check
        },
        data: { archived: true },
    })

    revalidatePath('/dashboard/conversations')
}
