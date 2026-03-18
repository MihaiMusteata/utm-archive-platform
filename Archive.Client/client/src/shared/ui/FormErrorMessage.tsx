import { cn } from '../utils/cn'

export function FormErrorMessage({ className, message }: { className?: string; message?: string }) {
  if (!message) {
    return null
  }

  return <p className={cn('text-sm text-rose-600 dark:text-rose-400', className)}>{message}</p>
}
