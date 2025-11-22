import { Skeleton } from "@/components/ui/skeleton"

export default function MessageListSkeleton() {
    return (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-end gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-[200px] rounded-2xl rounded-bl-none" />
            </div>
            <div className="flex items-end gap-2 flex-row-reverse">
                <Skeleton className="h-10 w-[150px] rounded-2xl rounded-br-none" />
            </div>
            <div className="flex items-end gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-[250px] rounded-2xl rounded-bl-none" />
            </div>
            <div className="flex items-end gap-2 flex-row-reverse">
                <Skeleton className="h-8 w-[100px] rounded-2xl rounded-br-none" />
            </div>
        </div>
    )
}
