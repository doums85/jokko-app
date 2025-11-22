import { z } from 'zod'

export const messageSchema = z.object({
    text: z.string().min(1).max(4096).trim(),
    conversationId: z.string().uuid(),
    attachments: z
        .array(
            z.object({
                url: z.string().url(),
                type: z.enum(['image', 'video', 'document']),
            })
        )
        .optional(),
})

export const conversationSchema = z.object({
    contactId: z.string().uuid(),
    subject: z.string().min(1).max(255).optional(),
})

export type MessageInput = z.infer<typeof messageSchema>
export type ConversationInput = z.infer<typeof conversationSchema>
