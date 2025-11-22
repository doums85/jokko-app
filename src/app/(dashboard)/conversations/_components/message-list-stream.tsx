import { db } from '@/lib/server/db'
import { auth } from '@/lib/auth'
import MessageItem from '@/components/conversations/message-item'
import DateSeparator from '@/components/common/date-separator'
import { headers } from 'next/headers'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageWithSender } from '@/lib/shared/types'

export default async function MessageListStream({ conversationId }: { conversationId: string }) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    const messages = await db.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
        include: { sender: true }
    })

    // Group messages by date
    const groupedMessages: { [key: string]: MessageWithSender[] } = {}
    messages.forEach((message: MessageWithSender) => {
        const date = format(message.timestamp, 'd MMMM yyyy', { locale: fr })
        if (!groupedMessages[date]) {
            groupedMessages[date] = []
        }
        groupedMessages[date].push(message as unknown as MessageWithSender)
    })

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                    <DateSeparator date={date} />
                    <div className="space-y-4">
                        {msgs.map((message) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                            />
                        ))}
                    </div>
                </div>
            ))}
            {messages.length === 0 && (
                <div className="text-center text-text-secondary mt-10">
                    Aucun message. Commencez la discussion !
                </div>
            )}
        </div>
    )
}
