import type { LoginResponse } from '../../shared/types/models'

const authStorageKey = 'utm-archive-auth'

export function getStoredAuth() {
  const value = localStorage.getItem(authStorageKey)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as LoginResponse
  } catch {
    localStorage.removeItem(authStorageKey)
    return null
  }
}

export function setStoredAuth(value: LoginResponse) {
  localStorage.setItem(authStorageKey, JSON.stringify(value))
}

export function clearStoredAuth() {
  localStorage.removeItem(authStorageKey)
}
