import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'
import { Input } from './Input'

export function TableFilterInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      className={cn(
        'h-9 rounded-lg border-slate-200 bg-white px-3 py-2 text-xs font-medium normal-case tracking-normal shadow-none placeholder:font-normal focus:ring-2 dark:border-slate-800 dark:bg-slate-950',
        props.disabled && 'cursor-not-allowed border-dashed bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600',
        className,
      )}
      {...props}
    />
  )
}
