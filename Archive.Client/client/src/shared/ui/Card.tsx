import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.5)] sm:p-6 dark:border-slate-800/80 dark:bg-slate-950',
        className,
      )}
    >
      {children}
    </div>
  )
}
