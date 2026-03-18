import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-400',
        className,
      )}
    >
      {children}
    </span>
  )
}
