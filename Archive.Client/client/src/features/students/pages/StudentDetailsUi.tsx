import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
import { FormErrorMessage } from '../../../shared/ui/FormErrorMessage'
import { Spinner } from '../../../shared/ui/Spinner'
import { cn } from '../../../shared/utils/cn'

export function TabWindow({
  label,
  title,
  children,
  meta,
  icon,
}: {
  label: string
  title: string
  children: ReactNode
  meta?: ReactNode
  icon?: string
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] dark:border-slate-800/80 dark:bg-slate-950">
      <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5 dark:border-slate-800/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            {icon ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-200/80 bg-slate-50 text-slate-600 sm:h-10 sm:w-10 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
                <Icon icon={icon} width={20} />
              </span>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <h4 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h4>
            </div>
          </div>
          {meta ? <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">{meta}</div> : null}
        </div>
      </div>
      <div className="space-y-5 p-4 sm:p-5 lg:p-6">{children}</div>
    </section>
  )
}

export function TabLoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200/80 bg-slate-50/70 px-6 text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-400">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <Spinner />
        </div>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}

export function SectionHeading({
  kicker,
  title,
  icon,
}: {
  kicker: string
  title: string
  icon?: string
}) {
  return (
    <div className="flex items-center gap-3">
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-200/80 bg-slate-50 text-slate-600 sm:h-10 sm:w-10 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
          <Icon icon={icon} width={20} />
        </span>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{kicker}</p>
        <h4 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h4>
      </div>
    </div>
  )
}

export function FormSection({
  title,
  children,
  className,
  icon,
}: {
  title: string
  children: ReactNode
  className?: string
  icon?: string
}) {
  return (
    <section
      className={cn(
        'rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-3.5 sm:p-4 dark:border-slate-800/80 dark:bg-slate-950/70',
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] border border-slate-200/80 bg-white text-slate-600 shadow-sm sm:h-10 sm:w-10 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
            <Icon icon={icon} width={20} />
          </span>
        ) : null}
        <h5 className="text-base font-semibold tracking-tight">{title}</h5>
      </div>
      {children}
    </section>
  )
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-950/70">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="mt-2 block text-sm font-medium leading-6 text-slate-950 dark:text-slate-50">{value}</span>
    </div>
  )
}

export function Field({
  label,
  children,
  className,
  error,
}: {
  label: string
  children: ReactNode
  className?: string
  error?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
      <FormErrorMessage message={error} />
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200/80 bg-slate-50/70 px-5 py-10 text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-400">
      {message}
    </div>
  )
}
