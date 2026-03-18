import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const isInvalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'

  return (
    <textarea
      className={cn(
        'min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200/60 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:bg-slate-950 dark:focus:ring-slate-800/60',
        isInvalid &&
          'border-rose-300 bg-rose-50/80 text-rose-950 focus:border-rose-500 focus:ring-rose-200/70 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-100 dark:focus:border-rose-500 dark:focus:ring-rose-900/50',
        className,
      )}
      {...props}
    />
  )
}
