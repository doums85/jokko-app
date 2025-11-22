import EmptyState from '@/components/common/empty-state'

export default function ConversationsPage() {
    return (
        <div className="h-full flex items-center justify-center">
            <EmptyState
                title="Sélectionnez une conversation"
                description="Choisissez une conversation dans la liste pour voir les messages."
            />
        </div>
    )
}
