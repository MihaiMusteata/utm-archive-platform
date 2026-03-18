import { startTransition, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/auth-context'
import { getErrorMessage } from '../../../core/api/client'
import { canAccessPath, getFirstAccessiblePath } from '../../../core/router/route-config'
import { FormErrorMessage } from '../../../shared/ui/FormErrorMessage'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { getFieldErrors, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'
import { ThemeToggle } from '../../layout/ThemeToggle'

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(getFirstAccessiblePath(user), { replace: true })
    }
  }, [navigate, user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    const nextFieldErrors: FieldErrors = {}
    if (!username.trim()) {
      nextFieldErrors.username = requiredField('Utilizator')
    }
    if (!password.trim()) {
      nextFieldErrors.password = requiredField('Parolă')
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    setIsSubmitting(true)

    try {
      const authenticatedUser = await login(username, password)
      showSuccessToast('Autentificare reușită.')
      const requestedPath = (location.state as { from?: string } | undefined)?.from
      const destination =
        requestedPath && canAccessPath(authenticatedUser, requestedPath)
          ? requestedPath
          : getFirstAccessiblePath(authenticatedUser)
      startTransition(() => navigate(destination, { replace: true }))
    } catch (submissionError) {
      const message = getErrorMessage(submissionError)
      setFieldErrors(getFieldErrors(submissionError))
      setError(message)
      showErrorToast(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-black dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="text-lg font-semibold tracking-tight">Arhiva UTM</div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Card className="w-full max-w-md p-5 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Autentificare</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Field error={fieldErrors.username} label="Utilizator">
              <Input
                aria-invalid={Boolean(fieldErrors.username)}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.username
                    return nextErrors
                  })
                }}
                value={username}
              />
            </Field>
            <Field error={fieldErrors.password} label="Parolă">
              <Input
                aria-invalid={Boolean(fieldErrors.password)}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.password
                    return nextErrors
                  })
                }}
                type="password"
                value={password}
              />
            </Field>
            {error ? <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p> : null}
            <Button className="w-full" disabled={isSubmitting} size="md" type="submit">
              {isSubmitting ? 'Se autentifică...' : 'Intră'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      <FormErrorMessage message={error} />
    </div>
  )
}
