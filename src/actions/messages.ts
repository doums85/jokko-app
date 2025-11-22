'use server'

import { db } from '@/lib/server/db'
import { auth } from '@/lib/auth'
import { messageSchema } from '@/lib/shared/validation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function sendWhatsAppMessage(to: string, templateName: string, variables: Record<string, string>) {
    // Placeholder implementation
    console.log('Sending WhatsApp message', { to, templateName, variables })

    // In a real implementation, this would call the WhatsApp Business API
    // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: to,
    //     type: 'template',
    //     template: {
    //       name: templateName,
    //       language: {
    //         code: 'fr',
    //       },
    //       components: [
    //         {
    //           type: 'body',
    //           parameters: Object.entries(variables).map(([key, value]) => ({
    //             type: 'text',
    //             text: value,
    //           })),
    //         },
    //       ],
    //     },
    //   }),
    // })

    return { success: true }
}

export async function sendMessage(data: unknown) {
    const parsed = messageSchema.parse(data)

    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) throw new Error('Unauthorized')

    const message = await db.message.create({
        data: {
            text: parsed.text,
            conversationId: parsed.conversationId,
            senderId: session.user.id,
            status: 'sending',
        },
    })

    // Simulate WhatsApp API call
    try {
        // const whatsappMessage = await sendWhatsAppMessage(message)

        await db.message.update({
            where: { id: message.id },
            data: {
                status: 'sent',
                // externalId: whatsappMessage.id,
            },
        })
    } catch (error) {
        await db.message.update({
            where: { id: message.id },
            data: { status: 'error' },
        })
        throw error
    }

    revalidatePath(`/dashboard/conversations/${parsed.conversationId}`)
    revalidatePath('/dashboard/conversations')

    return message
}

export async function deleteMessage(messageId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) throw new Error('Unauthorized')

    const message = await db.message.findUnique({ where: { id: messageId } })

    if (!message) return

    if (message.senderId !== session.user.id) throw new Error('Unauthorized')

    await db.message.delete({ where: { id: messageId } })
    revalidatePath(`/dashboard/conversations/${message.conversationId}`)
}
