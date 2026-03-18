import axios from 'axios'
import { translateValidationMessage } from './localization'

export type FieldErrors = Record<string, string>

type ApiErrorResponse = {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

function normalizeFieldKey(key: string) {
  return key
    .replace(/^\$\./, '')
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toLowerCase() + segment.slice(1))
    .join('.')
}

export function getErrorKey(key: string) {
  return normalizeFieldKey(key)
}

export function getFieldErrors(error: unknown): FieldErrors {
  if (!axios.isAxiosError(error)) {
    return {}
  }

  const responseData = error.response?.data as ApiErrorResponse | undefined
  if (!responseData?.errors) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(responseData.errors)
      .map(([key, messages]) => [
        normalizeFieldKey(key),
        messages.map((message) => translateValidationMessage(message)).join(' '),
      ])
      .filter(([, message]) => Boolean(message)),
  )
}

export function getFieldError(errors: FieldErrors, ...keys: string[]) {
  for (const key of keys) {
    const message = errors[normalizeFieldKey(key)]
    if (message) {
      return message
    }
  }

  return ''
}

export function clearFieldErrors(errors: FieldErrors, ...keys: string[]) {
  if (keys.length === 0 || Object.keys(errors).length === 0) {
    return errors
  }

  const nextErrors = { ...errors }
  for (const key of keys) {
    delete nextErrors[normalizeFieldKey(key)]
  }

  return nextErrors
}

export function requiredField(label: string) {
  return `Câmpul „${label}” este obligatoriu.`
}

export function invalidEmailField(label: string) {
  return `Câmpul „${label}” trebuie să conțină o adresă de email validă.`
}

export function minLengthField(label: string, length: number) {
  return `Câmpul „${label}” trebuie să conțină cel puțin ${length} caractere.`
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
