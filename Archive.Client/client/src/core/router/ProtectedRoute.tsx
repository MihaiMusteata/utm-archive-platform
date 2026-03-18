import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/providers/auth-context'
import { Spinner } from '../../shared/ui/Spinner'
import { hasRequiredPermissions } from './route-config'

export function ProtectedRoute({
  children,
  fallbackPath = '/forbidden',
  requiredPermissions,
}: {
  children: ReactNode
  fallbackPath?: string
  requiredPermissions?: string[]
}) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const requestedPath = `${location.pathname}${location.search}${location.hash}`

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate replace state={{ from: requestedPath }} to="/login" />
  }

  if (!hasRequiredPermissions(user, requiredPermissions)) {
    return <Navigate replace state={{ from: requestedPath }} to={fallbackPath} />
  }

  return <>{children}</>
}
