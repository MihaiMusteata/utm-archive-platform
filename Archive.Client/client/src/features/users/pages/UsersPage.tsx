import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { FormErrorMessage } from '../../../shared/ui/FormErrorMessage'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { Table } from '../../../shared/ui/Table'
import { TableFilterInput } from '../../../shared/ui/TableFilterInput'
import { TableFilterSelect } from '../../../shared/ui/TableFilterSelect'
import { TableSearchHeader } from '../../../shared/ui/TableSearchHeader'
import type { PagedResponse, Role, User } from '../../../shared/types/models'
import { getFieldErrors, invalidEmailField, isValidEmail, minLengthField, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'
import { matchesFilter } from '../../../shared/utils/filtering'
import { localizeRoleName } from '../../../shared/utils/localization'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'

const defaultUserFilters = {
  username: '',
  name: '',
  email: '',
  role: '',
  status: '',
}

type UserForm = {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  isActive: boolean
  roleIds: string[]
}

const emptyUserForm: UserForm = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  isActive: true,
  roleIds: [],
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyUserForm)
  const [filters, setFilters] = useState(defaultUserFilters)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = async () => {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiClient.get<PagedResponse<User>>('/users?page=1&pageSize=100'),
        apiClient.get<PagedResponse<Role>>('/roles?page=1&pageSize=100'),
      ])

      setUsers(usersResponse.data.items)
      setRoles(rolesResponse.data.items)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyUserForm)
    setFieldErrors({})
    setModalError('')
    setIsModalOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: '',
      isActive: user.isActive,
      roleIds: user.roleIds,
    })
    setFieldErrors({})
    setModalError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError('')

    const nextFieldErrors: FieldErrors = {}
    if (!editingUser && !form.username.trim()) {
      nextFieldErrors.username = requiredField('Utilizator')
    }
    if (!form.email.trim()) {
      nextFieldErrors.email = requiredField('Email')
    } else if (!isValidEmail(form.email.trim())) {
      nextFieldErrors.email = invalidEmailField('Email')
    }
    if (!form.firstName.trim()) {
      nextFieldErrors.firstName = requiredField('Prenume')
    }
    if (!form.lastName.trim()) {
      nextFieldErrors.lastName = requiredField('Nume')
    }
    if (!editingUser && !form.password.trim()) {
      nextFieldErrors.password = requiredField('Parolă')
    } else if (form.password.trim() && form.password.trim().length < 8) {
      nextFieldErrors.password = minLengthField('Parolă', 8)
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, form)
      } else {
        await apiClient.post('/users', form)
      }

      setIsModalOpen(false)
      setFieldErrors({})
      setModalError('')
      showSuccessToast(editingUser ? 'Utilizatorul a fost actualizat.' : 'Utilizatorul a fost creat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setFieldErrors(nextServerErrors)
      setModalError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const filteredUsers = users.filter((user) => {
    return (
      matchesFilter(user.username, filters.username) &&
      matchesFilter(`${user.firstName} ${user.lastName}`, filters.name) &&
      matchesFilter(user.email, filters.email) &&
      matchesFilter(user.roles.map(localizeRoleName).join(', '), filters.role) &&
      matchesFilter(user.isActive ? 'Activ' : 'Inactiv', filters.status)
    )
  })

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
              <Icon icon="material-symbols:manage-accounts-rounded" width={20} />
            </span>
            <h4 className="text-lg font-semibold">Utilizatori</h4>
          </div>
          <Button className="flex-1 sm:flex-none" onClick={openCreate} size="md">
            <Icon icon="material-symbols:add-rounded" width={18} />
            Creează
          </Button>
        </div>
        {error ? <p className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{error}</p> : null}
        <TableSearchHeader
          actions={
            <Button onClick={() => setFilters(defaultUserFilters)} size="sm" variant="ghost">
              Resetează
            </Button>
          }
          minColumnWidth={150}
        >
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, username: event.target.value }))} placeholder="Utilizator" value={filters.username} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, name: event.target.value }))} placeholder="Nume" value={filters.name} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, email: event.target.value }))} placeholder="Email" value={filters.email} />
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))} value={filters.role}>
            <option value="">Toate rolurile</option>
            {roles.map((role) => (
              <option key={role.id} value={localizeRoleName(role.name)}>
                {localizeRoleName(role.name)}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} value={filters.status}>
            <option value="">Toate statutele</option>
            <option value="Activ">Activ</option>
            <option value="Inactiv">Inactiv</option>
          </TableFilterSelect>
        </TableSearchHeader>
        <Table
          columns={[
            { header: 'Utilizator', render: (user) => user.username },
            { header: 'Nume', render: (user) => `${user.firstName} ${user.lastName}` },
            { header: 'Email', render: (user) => user.email },
            { header: 'Roluri', render: (user) => user.roles.map(localizeRoleName).join(', ') },
            { header: 'Statut', render: (user) => (user.isActive ? 'Activ' : 'Inactiv') },
          ]}
          data={filteredUsers}
          emptyMessage="Nu au fost găsiți utilizatori."
          onRowClick={openEdit}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Editează utilizatorul' : 'Creează utilizator'}>
        {modalError ? <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{modalError}</p> : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field error={fieldErrors.username} label="Utilizator">
            <Input
              aria-invalid={Boolean(fieldErrors.username)}
              disabled={Boolean(editingUser)}
              onChange={(event) => {
                setForm((current) => ({ ...current, username: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.username
                  return nextErrors
                })
              }}
              value={form.username}
            />
          </Field>
          <Field error={fieldErrors.email} label="Email">
            <Input
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.email
                  return nextErrors
                })
              }}
              value={form.email}
            />
          </Field>
          <Field error={fieldErrors.firstName} label="Prenume">
            <Input
              aria-invalid={Boolean(fieldErrors.firstName)}
              onChange={(event) => {
                setForm((current) => ({ ...current, firstName: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.firstName
                  return nextErrors
                })
              }}
              value={form.firstName}
            />
          </Field>
          <Field error={fieldErrors.lastName} label="Nume">
            <Input
              aria-invalid={Boolean(fieldErrors.lastName)}
              onChange={(event) => {
                setForm((current) => ({ ...current, lastName: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.lastName
                  return nextErrors
                })
              }}
              value={form.lastName}
            />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{editingUser ? 'Parolă nouă (opțional)' : 'Parolă'}</label>
            <Input
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={(event) => {
                setForm((current) => ({ ...current, password: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.password
                  return nextErrors
                })
              }}
              type="password"
              value={form.password}
            />
            <FormErrorMessage message={fieldErrors.password} />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-medium">Roluri</label>
            <div className="grid gap-3 lg:grid-cols-2">
              {roles.map((role) => (
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800" key={role.id}>
                  <input
                    checked={form.roleIds.includes(role.id)}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        roleIds: event.target.checked
                          ? [...current.roleIds, role.id]
                          : current.roleIds.filter((roleId) => roleId !== role.id),
                      }))
                    }
                    type="checkbox"
                  />
                  <span>{localizeRoleName(role.name)}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm md:col-span-2 dark:border-gray-800">
            <input checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} type="checkbox" />
            Utilizator activ
          </label>

          <div className="md:col-span-2">
            <Button className="w-full sm:w-auto" size="md" type="submit">
              {editingUser ? 'Salvează modificările' : 'Creează utilizator'}
            </Button>
          </div>
        </form>
      </Modal>
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
