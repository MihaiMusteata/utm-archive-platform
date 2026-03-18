import type { SelectHTMLAttributes } from 'react'
import { cn } from '../utils/cn'
import { Select } from './Select'

export function TableFilterSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select
      className={cn(
        'h-9 rounded-lg border-slate-200 bg-white px-3 py-2 text-xs font-medium normal-case tracking-normal shadow-none focus:ring-2 dark:border-slate-800 dark:bg-slate-950',
        props.disabled && 'cursor-not-allowed border-dashed bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600',
        className,
      )}
      {...props}
    />
  )
}
