import type { ReactNode } from 'react'
import { Button } from './Button'

export function Modal({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 py-0 sm:items-center sm:px-4 sm:py-8 dark:bg-black/80">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[1.75rem] border border-gray-200 bg-white p-4 pb-6 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-5 dark:border-gray-800 dark:bg-black">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-start justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:static sm:m-0 sm:mb-5 sm:border-0 sm:bg-transparent sm:p-0 dark:border-gray-800 dark:bg-black/95 sm:dark:bg-transparent">
          <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
          <Button onClick={onClose} size="sm" variant="ghost">
            Închide
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
