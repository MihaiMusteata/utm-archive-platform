import type { SelectHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const isInvalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  return (
    <div className="relative w-full">
      <select
        className={cn(
          'w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-10 py-3 text-center text-sm text-slate-950 outline-none transition [text-align-last:center] focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200/60 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-50 dark:focus:border-slate-100 dark:focus:bg-slate-950 dark:focus:ring-slate-800/60',
          isInvalid &&
            'border-rose-300 bg-rose-50/80 text-rose-950 focus:border-rose-500 focus:ring-rose-200/70 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-100 dark:focus:border-rose-500 dark:focus:ring-rose-900/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </span>
    </div>
  )
}
