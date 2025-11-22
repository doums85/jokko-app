import { Suspense } from 'react'
import MessageListStream from '../_components/message-list-stream'
import MessageInput from '@/components/conversations/message-input'
import { ConversationInfo } from '@/components/conversations/conversation-info'
import MessageListSkeleton from '@/components/conversations/message-list-skeleton'

export default async function ConversationPage({
    params
}: {
    params: Promise<{ conversationId: string }>
}) {
    const { conversationId } = await params

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col h-full">
                {/* ... */}

                <Suspense fallback={<MessageListSkeleton />}>
                    <MessageListStream conversationId={conversationId} />
                </Suspense>
                <MessageInput conversationId={conversationId} />
            </div>

            {/* Info Panel - Hidden on mobile usually, or toggleable */}
            <div className="hidden lg:block border-l border-border-light w-[var(--spacing-info-panel-width)]">
                <ConversationInfo conversationId={conversationId} />
            </div>
        </div>
    )
}
