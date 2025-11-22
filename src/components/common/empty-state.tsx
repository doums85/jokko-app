import { MessageCircle } from 'lucide-react'

interface EmptyStateProps {
    title?: string;
    description?: string;
}

export default function EmptyState({
    title = "Sélectionnez une conversation",
    description = "Choisissez une conversation dans la liste pour commencer à discuter ou démarrez une nouvelle discussion."
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-bg-secondary/30">
            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
                {title}
            </h3>
            <p className="text-text-secondary max-w-sm">
                {description}
            </p>
        </div>
    )
}
