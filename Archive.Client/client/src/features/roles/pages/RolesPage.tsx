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
import { TextArea } from '../../../shared/ui/TextArea'
import type { PagedResponse, Permission, Role } from '../../../shared/types/models'
import { getFieldErrors, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'
import { matchesFilter } from '../../../shared/utils/filtering'
import {
  localizePermission,
  localizeRoleDescription,
  localizeRoleName,
} from '../../../shared/utils/localization'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'

const defaultRoleFilters = {
  role: '',
  description: '',
  permissionCode: '',
  system: '',
}

type RoleForm = {
  name: string
  description: string
  permissionIds: string[]
}

const emptyRoleForm: RoleForm = {
  name: '',
  description: '',
  permissionIds: [],
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form, setForm] = useState<RoleForm>(emptyRoleForm)
  const [filters, setFilters] = useState(defaultRoleFilters)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        apiClient.get<PagedResponse<Role>>('/roles?page=1&pageSize=100'),
        apiClient.get<Permission[]>('/roles/permissions'),
      ])
      setRoles(rolesResponse.data.items)
      setPermissions(permissionsResponse.data.map(localizePermission))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    groups[permission.category] = [...(groups[permission.category] ?? []), permission]
    return groups
  }, {})

  const openCreate = () => {
    setEditingRole(null)
    setForm(emptyRoleForm)
    setFieldErrors({})
    setModalError('')
    setIsModalOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    setForm({
      name: localizeRoleName(role.name),
      description: localizeRoleDescription(role.name, role.description),
      permissionIds: role.permissionIds,
    })
    setFieldErrors({})
    setModalError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError('')

    const nextFieldErrors: FieldErrors = {}
    if (!editingRole && !form.name.trim()) {
      nextFieldErrors.name = requiredField('Nume rol')
    }
    if (!form.description.trim()) {
      nextFieldErrors.description = requiredField('Descriere')
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      if (editingRole) {
        await apiClient.put(`/roles/${editingRole.id}`, {
          description: form.description,
          permissionIds: form.permissionIds,
        })
      } else {
        await apiClient.post('/roles', form)
      }

      setIsModalOpen(false)
      setFieldErrors({})
      setModalError('')
      showSuccessToast(editingRole ? 'Rolul a fost actualizat.' : 'Rolul a fost creat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setFieldErrors(nextServerErrors)
      setModalError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const filteredRoles = roles.filter((role) => {
    return (
      matchesFilter(localizeRoleName(role.name), filters.role) &&
      matchesFilter(localizeRoleDescription(role.name, role.description), filters.description) &&
      matchesFilter(role.permissionCodes.join(', '), filters.permissionCode) &&
      matchesFilter(role.isSystem ? 'Da' : 'Nu', filters.system)
    )
  })

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
              <Icon icon="material-symbols:security-rounded" width={20} />
            </span>
            <h4 className="text-lg font-semibold">Roluri</h4>
          </div>
          <Button className="flex-1 sm:flex-none" onClick={openCreate} size="md">
            <Icon icon="material-symbols:add-rounded" width={18} />
            Creează
          </Button>
        </div>
        {error ? <p className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{error}</p> : null}
        <TableSearchHeader
          actions={
            <Button onClick={() => setFilters(defaultRoleFilters)} size="sm" variant="ghost">
              Resetează
            </Button>
          }
        >
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))} placeholder="Rol" value={filters.role} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, description: event.target.value }))} placeholder="Descriere" value={filters.description} />
          <TableFilterInput
            onChange={(event) => setFilters((current) => ({ ...current, permissionCode: event.target.value }))}
            placeholder="Cod permisiune"
            value={filters.permissionCode}
          />
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, system: event.target.value }))} value={filters.system}>
            <option value="">Toate rolurile</option>
            <option value="Da">Sistem</option>
            <option value="Nu">Personalizat</option>
          </TableFilterSelect>
        </TableSearchHeader>
        <Table
          columns={[
            { header: 'Rol', render: (role) => localizeRoleName(role.name) },
            { header: 'Descriere', render: (role) => localizeRoleDescription(role.name, role.description) },
            { header: 'Permisiuni', render: (role) => role.permissionCodes.length },
            { header: 'Sistem', render: (role) => (role.isSystem ? 'Da' : 'Nu') },
          ]}
          data={filteredRoles}
          emptyMessage="Nu au fost găsite roluri."
          onRowClick={openEdit}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? 'Editează rolul' : 'Creează rol'}>
        {modalError ? <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{modalError}</p> : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field error={fieldErrors.name} label="Nume rol">
            <Input
              aria-invalid={Boolean(fieldErrors.name)}
              disabled={Boolean(editingRole)}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.name
                  return nextErrors
                })
              }}
              value={form.name}
            />
          </Field>
          <Field error={fieldErrors.description} label="Descriere">
            <TextArea
              aria-invalid={Boolean(fieldErrors.description)}
              onChange={(event) => {
                setForm((current) => ({ ...current, description: event.target.value }))
                setFieldErrors((current) => {
                  const nextErrors = { ...current }
                  delete nextErrors.description
                  return nextErrors
                })
              }}
              value={form.description}
            />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(groupedPermissions).map(([category, items]) => (
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800" key={category}>
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold">{category}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{items.length}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((permission) => (
                    <label className="flex items-start gap-3 text-sm" key={permission.id}>
                      <input
                        checked={form.permissionIds.includes(permission.id)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            permissionIds: event.target.checked
                              ? [...current.permissionIds, permission.id]
                              : current.permissionIds.filter((permissionId) => permissionId !== permission.id),
                          }))
                        }
                        type="checkbox"
                      />
                      <span>
                        <span className="font-medium">{permission.name}</span>
                        <br />
                        <span className="text-gray-600 dark:text-gray-400">{permission.code}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full sm:w-auto" size="md" type="submit">
            {editingRole ? 'Salvează modificările' : 'Creează rol'}
          </Button>
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
