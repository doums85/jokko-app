import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/shared/cn'

export function MessageStatus({ status }: { status: string }) {
    if (status === 'sending') return <Clock className="w-3 h-3 text-text-secondary" />
    if (status === 'sent') return <Check className="w-3 h-3 text-text-secondary" />
    if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-text-secondary" />
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-jokko-blue" />
    if (status === 'error') return <AlertCircle className="w-3 h-3 text-red-500" />
    return null
}
