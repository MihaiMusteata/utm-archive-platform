import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'h-9 px-3.5',
        size === 'md' && 'h-10 px-4',
        size === 'lg' && 'h-11 px-5',
        variant === 'primary' &&
          'border-gray-900 bg-gray-900 text-white hover:opacity-90 dark:border-white dark:bg-white dark:text-black',
        variant === 'secondary' &&
          'border-gray-300 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-gray-100 dark:hover:bg-gray-900',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100',
        variant === 'danger' &&
          'border-gray-900 bg-white text-gray-900 hover:bg-gray-100 dark:border-white dark:bg-black dark:text-gray-100 dark:hover:bg-gray-900',
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
