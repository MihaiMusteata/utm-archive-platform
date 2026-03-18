import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type Column<T> = {
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export function Table<T>({
  data,
  columns,
  emptyMessage = 'Nu au fost găsite înregistrări.',
  onRowClick,
}: {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  onRowClick?: (row: T) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="block min-w-full border-collapse sm:table">
          <thead className="hidden bg-gray-50 text-left text-xs font-medium uppercase tracking-[0.18em] text-gray-500 sm:table-header-group dark:bg-gray-950 dark:text-gray-400">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3" key={column.header}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="block sm:table-row-group">
            {data.length === 0 ? (
              <tr className="block sm:table-row">
                <td className="block px-4 py-10 text-center text-sm text-gray-500 sm:table-cell dark:text-gray-400" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  className={cn(
                    'block border-t border-gray-200 transition first:border-t-0 sm:table-row sm:first:border-t dark:border-gray-800',
                    onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-950',
                  )}
                  key={index}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      className={cn(
                        'flex items-start justify-between gap-4 px-4 py-3 text-left text-sm text-gray-900 before:flex-none before:pr-4 before:text-[0.68rem] before:font-semibold before:uppercase before:tracking-[0.16em] before:text-gray-500 before:content-[attr(data-label)] sm:table-cell sm:px-4 sm:py-3 sm:align-middle sm:before:hidden dark:text-gray-100 dark:before:text-gray-400',
                        column.className,
                      )}
                      data-label={column.header}
                      key={column.header}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
