import { Icon } from '@iconify/react'
import { useTheme } from '../../app/providers/theme-context'
import { Button } from '../../shared/ui/Button'
import { cn } from '../../shared/utils/cn'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const iconName =
    theme === 'dark' ? 'material-symbols:light-mode-rounded' : 'material-symbols:dark-mode-rounded'

  return (
    <Button
      aria-label={theme === 'dark' ? 'Comută pe tema luminoasă' : 'Comută pe tema întunecată'}
      className={cn(
        'h-10 w-10 rounded-2xl px-0 shadow-sm sm:h-10 sm:w-10',
        theme === 'dark'
          ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
      )}
      onClick={toggleTheme}
      variant="secondary"
    >
      <Icon className="h-5 w-5 shrink-0 sm:h-5 sm:w-5" icon={iconName} />
    </Button>
  )
}
