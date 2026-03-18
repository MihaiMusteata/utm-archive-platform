export function Spinner() {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
      Se încarcă
    </div>
  )
}
