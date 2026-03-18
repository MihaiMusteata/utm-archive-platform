import { createContext, useContext } from 'react'
import type { CurrentUser } from '../../shared/types/models'

export type AuthContextValue = {
  user: CurrentUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<CurrentUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
