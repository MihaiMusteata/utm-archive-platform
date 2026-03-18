import { Children, type ReactNode } from 'react'

export function TableSearchHeader({
  children,
  minColumnWidth = 160,
  actions,
}: {
  children: ReactNode
  minColumnWidth?: number
  actions?: ReactNode
}) {
  const items = Children.toArray(children)

  return (
    <div className="mb-2 border-b border-gray-200 bg-slate-50/70 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800 dark:bg-slate-950/70">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {items.map((item, index) => (
          <div className="min-w-0 grow" key={index} style={{ flexBasis: `${minColumnWidth}px` }}>
            {item}
          </div>
        ))}
        {actions ? <div className="ml-auto flex shrink-0 items-center justify-end">{actions}</div> : null}
      </div>
    </div>
  )
}
