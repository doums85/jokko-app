export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-2 bg-bg-secondary rounded-2xl rounded-bl-none w-fit">
            <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
        </div>
    )
}
