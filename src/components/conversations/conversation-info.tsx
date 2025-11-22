'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const ConversationInfoPanel = dynamic<{ conversationId: string }>(
    () => import('@/components/conversations/_components/info-panel'),
    { loading: () => <div>Chargement...</div> }
)

export function ConversationInfo({ conversationId }: { conversationId: string }) {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <ConversationInfoPanel conversationId={conversationId} />
        </Suspense>
    )
}
