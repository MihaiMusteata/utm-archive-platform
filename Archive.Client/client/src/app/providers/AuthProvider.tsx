import { startTransition, type ReactNode, useEffect, useState } from 'react'
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../../core/auth/storage'
import { apiClient } from '../../core/api/client'
import type { CurrentUser, LoginResponse } from '../../shared/types/models'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => getStoredAuth()?.user ?? null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const synchronize = async () => {
      const auth = getStoredAuth()
      if (!auth?.accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const response = await apiClient.get<CurrentUser>('/auth/me')
        setUser(response.data)
      } catch {
        clearStoredAuth()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void synchronize()

    const handleExternalLogout = () => {
      clearStoredAuth()
      startTransition(() => setUser(null))
    }

    window.addEventListener('utm-archive:logged-out', handleExternalLogout)
    return () => window.removeEventListener('utm-archive:logged-out', handleExternalLogout)
  }, [])

  const logout = () => {
    clearStoredAuth()
    setUser(null)
  }

  const login = async (username: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { username, password })
    setStoredAuth(response.data)
    setUser(response.data.user)
    return response.data.user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
