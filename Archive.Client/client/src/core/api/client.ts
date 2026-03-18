import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../auth/storage'
import { appConfig } from '../config'
import type { LoginResponse } from '../../shared/types/models'
import { translateErrorMessage } from '../../shared/utils/localization'

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<LoginResponse | null> | null = null

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined
    const auth = getStoredAuth()

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      auth?.refreshToken &&
      !request.url?.includes('/auth/login') &&
      !request.url?.includes('/auth/refresh')
    ) {
      request._retry = true

      refreshPromise ??= axios
        .post<LoginResponse>(`${appConfig.apiBaseUrl}/auth/refresh`, {
          refreshToken: auth.refreshToken,
        })
        .then((response) => {
          setStoredAuth(response.data)
          return response.data
        })
        .catch(() => {
          clearStoredAuth()
          return null
        })
        .finally(() => {
          refreshPromise = null
        })

      const refreshed = await refreshPromise
      if (refreshed) {
        request.headers.Authorization = `Bearer ${refreshed.accessToken}`
        return apiClient(request)
      }

      window.dispatchEvent(new Event('utm-archive:logged-out'))
    }

    throw error
  },
)

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string; title?: string; errors?: Record<string, string[]> } | undefined
    if (responseData?.message || responseData?.title || responseData?.errors) {
      return translateErrorMessage(responseData?.message ?? responseData?.title ?? 'Validation failed.', responseData?.errors)
    }

    return (
      translateErrorMessage(error.message ?? '') ||
      'Cererea a eșuat.'
    )
  }

  if (error instanceof Error) {
    return translateErrorMessage(error.message)
  }

  return 'Cererea a eșuat.'
}
