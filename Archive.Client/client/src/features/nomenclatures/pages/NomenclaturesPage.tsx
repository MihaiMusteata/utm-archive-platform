import { Icon } from '@iconify/react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { FormErrorMessage } from '../../../shared/ui/FormErrorMessage'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { Select } from '../../../shared/ui/Select'
import { Table } from '../../../shared/ui/Table'
import { TableFilterInput } from '../../../shared/ui/TableFilterInput'
import { TableSearchHeader } from '../../../shared/ui/TableSearchHeader'
import { TextArea } from '../../../shared/ui/TextArea'
import type { NomenclatureBootstrap, NomenclatureItem } from '../../../shared/types/models'
import { getFieldErrors, getFieldError, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'
import { matchesFilter } from '../../../shared/utils/filtering'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'
import { catalogEntries, catalogConfig, defaultCatalogKey, isCatalogKey, type CatalogField, type CatalogKey } from '../catalogConfig'

type FormState = Record<string, string | boolean>

const baseForm: FormState = {
  code: '',
  name: '',
  description: '',
  isActive: true,
}

const defaultNomenclatureFilters = {
  code: '',
  name: '',
  description: '',
  details: '',
}

const compactControlClassName = 'py-2.5 text-[0.95rem]'
const compactTextAreaClassName = 'min-h-24 py-2.5 text-[0.95rem]'

export function NomenclaturesPage() {
  const navigate = useNavigate()
  const { catalogKey } = useParams<{ catalogKey: string }>()
  const [bootstrap, setBootstrap] = useState<NomenclatureBootstrap | null>(null)
  const [editingItem, setEditingItem] = useState<NomenclatureItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(baseForm)
  const [filters, setFilters] = useState(defaultNomenclatureFilters)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const selectedCatalog: CatalogKey = isCatalogKey(catalogKey) ? catalogKey : defaultCatalogKey
  const selectedCatalogConfig = catalogConfig[selectedCatalog]

  const loadData = useCallback(async () => {
    try {
      setError('')
      const response = await apiClient.get<NomenclatureBootstrap>('/nomenclatures/bootstrap')
      setBootstrap(response.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (catalogKey && !isCatalogKey(catalogKey)) {
      navigate(`/nomenclatures/${defaultCatalogKey}`, { replace: true })
    }
  }, [catalogKey, navigate])

  useEffect(() => {
    setEditingItem(null)
    setIsModalOpen(false)
    setForm(baseForm)
    setFilters(defaultNomenclatureFilters)
    setModalError('')
    setFieldErrors({})
  }, [selectedCatalog])

  const closeModal = () => {
    setEditingItem(null)
    setIsModalOpen(false)
    setForm(baseForm)
    setModalError('')
    setFieldErrors({})
  }

  const openCreateModal = () => {
    setError('')
    setEditingItem(null)
    setForm(baseForm)
    setModalError('')
    setFieldErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (item: NomenclatureItem) => {
    setError('')
    setEditingItem(item)
    setForm({
      code: item.code,
      name: item.name,
      description: item.description ?? '',
      isActive: item.isActive,
      ...Object.fromEntries(Object.entries(item.relationIds).map(([key, value]) => [key, value ?? ''])),
      ...Object.fromEntries(Object.entries(item.metadata).map(([key, value]) => [key, value ?? ''])),
    })
    setModalError('')
    setFieldErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError('')

    const nextFieldErrors: FieldErrors = {}
    if (!String(form.code ?? '').trim()) {
      nextFieldErrors.code = requiredField('Cod')
    }
    if (!String(form.name ?? '').trim()) {
      nextFieldErrors.name = requiredField('Denumire')
    }
    for (const field of selectedCatalogConfig.fields) {
      if (field.type === 'select' && !String(form[field.key] ?? '').trim()) {
        nextFieldErrors[field.key] = requiredField(field.label)
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      const payload = {
        ...form,
        isActive: Boolean(form.isActive),
        startYear: form.startYear ? Number(form.startYear) : undefined,
        endYear: form.endYear ? Number(form.endYear) : undefined,
        yearNumber: form.yearNumber ? Number(form.yearNumber) : undefined,
        credits: form.credits ? Number(form.credits) : undefined,
      }

      if (editingItem) {
        await apiClient.put(`/nomenclatures/${selectedCatalog}/${editingItem.id}`, payload)
      } else {
        await apiClient.post(`/nomenclatures/${selectedCatalog}`, payload)
      }

      closeModal()
      showSuccessToast(editingItem ? 'Elementul a fost actualizat.' : 'Elementul a fost creat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setFieldErrors(nextServerErrors)
      setModalError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const items = bootstrap?.catalogs[selectedCatalog] ?? []
  const filteredItems = items.filter((item) => {
    return (
      matchesFilter(item.code, filters.code) &&
      matchesFilter(item.name, filters.name) &&
      matchesFilter(item.description ?? 'N/D', filters.description) &&
      matchesFilter(item.secondaryLabel ?? 'N/D', filters.details)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:hidden">
        <Field label="Catalog">
          <Select className={compactControlClassName} onChange={(event) => navigate(`/nomenclatures/${event.target.value}`)} value={selectedCatalog}>
            {catalogEntries.map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Card className="p-0">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
              <Icon icon={selectedCatalogConfig.icon} width={20} />
            </span>
            <h4 className="text-lg font-semibold">{selectedCatalogConfig.label}</h4>
          </div>
          <Button className="flex-1 sm:flex-none" onClick={openCreateModal} size="md">
            <Icon icon="material-symbols:add-rounded" width={18} />
            Creează
          </Button>
        </div>
        {error ? <p className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{error}</p> : null}
        <TableSearchHeader
          actions={
            <Button onClick={() => setFilters(defaultNomenclatureFilters)} size="sm" variant="ghost">
              Resetează
            </Button>
          }
        >
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, code: event.target.value }))} placeholder="Cod" value={filters.code} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, name: event.target.value }))} placeholder="Denumire" value={filters.name} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, description: event.target.value }))} placeholder="Descriere" value={filters.description} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, details: event.target.value }))} placeholder="Detalii" value={filters.details} />
        </TableSearchHeader>
        <Table
          columns={[
            { header: 'Cod', render: (item) => item.code },
            { header: 'Denumire', render: (item) => item.name },
            { header: 'Descriere', render: (item) => item.description ?? 'N/D' },
            { header: 'Detalii', render: (item) => item.secondaryLabel ?? 'N/D' },
          ]}
          data={filteredItems}
          emptyMessage="Nu au fost găsite elemente în nomenclator."
          onRowClick={(item) => openEditModal(item)}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${editingItem ? 'Editare element' : 'Creează element'} · ${selectedCatalogConfig.label}`}
      >
        <div className="space-y-4">
          {modalError ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {modalError}
            </div>
          ) : null}

          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field error={getFieldError(fieldErrors, 'code')} label="Cod">
              <Input
                aria-invalid={Boolean(getFieldError(fieldErrors, 'code'))}
                className={compactControlClassName}
                onChange={(event) => {
                  setForm((current) => ({ ...current, code: event.target.value }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.code
                    return nextErrors
                  })
                }}
                value={String(form.code ?? '')}
              />
            </Field>
            <Field error={getFieldError(fieldErrors, 'name')} label="Denumire">
              <Input
                aria-invalid={Boolean(getFieldError(fieldErrors, 'name'))}
                className={compactControlClassName}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.name
                    return nextErrors
                  })
                }}
                value={String(form.name ?? '')}
              />
            </Field>
            <Field className="md:col-span-2" label="Descriere">
              <TextArea
                className={compactTextAreaClassName}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                value={String(form.description ?? '')}
              />
            </Field>

            {(selectedCatalogConfig.fields as CatalogField[]).map((field) => (
              <Field
                className={field.type === 'textarea' ? 'md:col-span-2' : undefined}
                error={getFieldError(fieldErrors, field.key)}
                key={field.key}
                label={field.label}
              >
                {field.type === 'select' ? (
                  <Select
                    aria-invalid={Boolean(getFieldError(fieldErrors, field.key))}
                    className={compactControlClassName}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      setFieldErrors((current) => {
                        const nextErrors = { ...current }
                        delete nextErrors[field.key]
                        return nextErrors
                      })
                    }}
                    value={String(form[field.key] ?? '')}
                  >
                    {(bootstrap?.lookups[field.source ?? ''] ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                ) : field.type === 'textarea' ? (
                  <TextArea
                    aria-invalid={Boolean(getFieldError(fieldErrors, field.key))}
                    className={compactTextAreaClassName}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      setFieldErrors((current) => {
                        const nextErrors = { ...current }
                        delete nextErrors[field.key]
                        return nextErrors
                      })
                    }}
                    value={String(form[field.key] ?? '')}
                  />
                ) : (
                  <Input
                    aria-invalid={Boolean(getFieldError(fieldErrors, field.key))}
                    className={compactControlClassName}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      setFieldErrors((current) => {
                        const nextErrors = { ...current }
                        delete nextErrors[field.key]
                        return nextErrors
                      })
                    }}
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(form[field.key] ?? '')}
                  />
                )}
              </Field>
            ))}

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-800 md:col-span-2">
              <input
                checked={Boolean(form.isActive)}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                type="checkbox"
              />
              Element activ
            </label>

            <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row">
              <Button className="w-full sm:w-auto" size="md" type="submit">
                <Icon icon={editingItem ? 'material-symbols:save-rounded' : 'material-symbols:add-circle-rounded'} width={18} />
                {editingItem ? 'Salvează' : 'Creează'}
              </Button>
              <Button className="w-full sm:w-auto" onClick={closeModal} size="md" variant="ghost">
                Anulează
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

function Field({
  label,
  children,
  className,
  error,
}: {
  label: string
  children: React.ReactNode
  className?: string
  error?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
      <FormErrorMessage className="mt-2" message={error} />
    </div>
  )
}
