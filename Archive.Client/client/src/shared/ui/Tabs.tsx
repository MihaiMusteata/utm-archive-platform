import { Icon } from '@iconify/react'
import { cn } from '../utils/cn'

export type TabItem = {
  key: string
  label: string
  icon?: string
}

export function Tabs({
  items,
  activeKey,
  onChange,
}: {
  items: TabItem[]
  activeKey: string
  onChange: (key: string) => void
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-1.5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] sm:p-2 dark:border-slate-800/80 dark:bg-slate-950">
      <div aria-label="Secțiuni student" className="grid gap-2 sm:flex sm:flex-wrap" role="tablist">
        {items.map((item) => (
          <button
            aria-selected={activeKey === item.key}
            className={cn(
              'w-full min-w-0 rounded-[1.1rem] border px-3 py-2.5 text-left text-sm font-medium transition sm:min-w-[11rem] sm:flex-1 xl:flex-none',
              activeKey === item.key
                ? 'border-slate-900 bg-white text-slate-950 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.65)] dark:border-slate-100 dark:bg-slate-900 dark:text-slate-50'
                : 'border-transparent bg-slate-100/80 text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-50',
            )}
            key={item.key}
            onClick={() => onChange(item.key)}
            role="tab"
            type="button"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg border transition',
                  activeKey === item.key
                    ? 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950'
                    : 'border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-950/70',
                )}
              >
                {item.icon ? <Icon icon={item.icon} width={20} /> : null}
              </span>
              <span className="block font-semibold">{item.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
