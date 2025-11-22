import { cn } from '@/lib/shared/cn'

export default function DateSeparator({ date }: { date: string }) {
    return (
        <div className="flex items-center justify-center my-4">
            <span className="bg-bg-secondary text-text-secondary text-xs px-3 py-1 rounded-full">
                {date}
            </span>
        </div>
    )
}
