import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/auth-context'
import { getFirstAccessiblePath } from '../../core/router/route-config'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'

export function AccessDeniedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fallbackPath = getFirstAccessiblePath(user)
  const canGoBack = fallbackPath !== '/forbidden'

  return (
    <Card className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Acces restricționat
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Nu ai permisiunea necesară pentru această pagină.</h1>
      {canGoBack ? (
        <Button className="mt-6" onClick={() => navigate(fallbackPath, { replace: true })}>
          Mergi la o secțiune permisă
        </Button>
      ) : null}
    </Card>
  )
}
