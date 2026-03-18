import { Icon } from '@iconify/react'
import { useCallback, useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { FormErrorMessage } from '../../../shared/ui/FormErrorMessage'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { Select } from '../../../shared/ui/Select'
import { Table } from '../../../shared/ui/Table'
import { TableFilterInput } from '../../../shared/ui/TableFilterInput'
import { TableFilterSelect } from '../../../shared/ui/TableFilterSelect'
import { TableSearchHeader } from '../../../shared/ui/TableSearchHeader'
import { TextArea } from '../../../shared/ui/TextArea'
import type { DocumentRecord, NomenclatureBootstrap, PagedResponse, StudentListItem } from '../../../shared/types/models'
import { getFieldErrors, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'
import { matchesFilter } from '../../../shared/utils/filtering'
import { formatDateTime } from '../../../shared/utils/format'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'

const defaultDocumentFilters = {
  title: '',
  student: '',
  type: '',
  category: '',
  location: '',
  createdAt: '',
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [bootstrap, setBootstrap] = useState<NomenclatureBootstrap | null>(null)
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [filters, setFilters] = useState(defaultDocumentFilters)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [uploadForm, setUploadForm] = useState({
    studentId: '',
    title: '',
    description: '',
    documentTypeId: '',
    documentCategoryId: '',
    archiveLocationId: '',
    file: null as File | null,
  })

  const loadData = useCallback(async () => {
    try {
      const [documentsResponse, bootstrapResponse, studentsResponse] = await Promise.all([
        apiClient.get<PagedResponse<DocumentRecord>>('/documents?page=1&pageSize=100'),
        apiClient.get<NomenclatureBootstrap>('/nomenclatures/bootstrap'),
        apiClient.get<PagedResponse<StudentListItem>>('/students?page=1&pageSize=100'),
      ])

      setDocuments(documentsResponse.data.items)
      setBootstrap(bootstrapResponse.data)
      setStudents(studentsResponse.data.items)

      const firstDocumentType = bootstrapResponse.data.catalogs.documentTypes?.[0]
      setUploadForm((current) => ({
        ...current,
        studentId: current.studentId || studentsResponse.data.items[0]?.id || '',
        documentTypeId: current.documentTypeId || firstDocumentType?.id || '',
        documentCategoryId: current.documentCategoryId || firstDocumentType?.relationIds.documentCategoryId || '',
        archiveLocationId: current.archiveLocationId || bootstrapResponse.data.catalogs.archiveLocations?.[0]?.id || '',
      }))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [])

  const closeModal = () => {
    setIsModalOpen(false)
    setModalError('')
    setFieldErrors({})
  }

  const openCreateModal = () => {
    setModalError('')
    setFieldErrors({})
    setIsModalOpen(true)
  }

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError('')

    const nextFieldErrors: FieldErrors = {}
    if (!uploadForm.studentId) {
      nextFieldErrors.studentId = requiredField('Student')
    }
    if (!uploadForm.title.trim()) {
      nextFieldErrors.title = requiredField('Titlu')
    }
    if (!uploadForm.documentTypeId) {
      nextFieldErrors.documentTypeId = requiredField('Tip document')
    }
    if (!uploadForm.documentCategoryId) {
      nextFieldErrors.documentCategoryId = requiredField('Categorie')
    }
    if (!uploadForm.file) {
      nextFieldErrors.file = requiredField('Fișier')
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    const selectedFile = uploadForm.file
    if (!selectedFile) {
      return
    }

    try {
      const body = new FormData()
      body.append('studentId', uploadForm.studentId)
      body.append('documentTypeId', uploadForm.documentTypeId)
      body.append('documentCategoryId', uploadForm.documentCategoryId)
      body.append('archiveLocationId', uploadForm.archiveLocationId)
      body.append('title', uploadForm.title)
      body.append('description', uploadForm.description)
      body.append('file', selectedFile)

      await apiClient.post('/documents/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setUploadForm((current) => ({ ...current, title: '', description: '', file: null }))
      closeModal()
      showSuccessToast('Documentul a fost încărcat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setFieldErrors(nextServerErrors)
      setModalError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const downloadDocument = async (document: DocumentRecord) => {
    try {
      const response = await apiClient.get(`/documents/${document.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(response.data)
      const link = window.document.createElement('a')
      link.href = url
      link.download = document.fileName
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      setError(message)
      showErrorToast(message)
    }
  }

  const filteredDocuments = documents.filter((document) => {
    return (
      matchesFilter(document.title, filters.title) &&
      matchesFilter(document.studentName, filters.student) &&
      matchesFilter(document.documentType, filters.type) &&
      matchesFilter(document.documentCategory, filters.category) &&
      matchesFilter(document.archiveLocation || 'N/D', filters.location) &&
      matchesFilter(formatDateTime(document.createdAt), filters.createdAt)
    )
  })

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
              <Icon icon="material-symbols:description-rounded" width={20} />
            </span>
            <h4 className="text-lg font-semibold">Documente</h4>
          </div>
          <Button className="flex-1 sm:flex-none" onClick={openCreateModal} size="md">
            <Icon icon="material-symbols:upload-rounded" width={18} />
            Încarcă
          </Button>
        </div>
        {error ? <p className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{error}</p> : null}
        <TableSearchHeader
          actions={
            <Button onClick={() => setFilters(defaultDocumentFilters)} size="sm" variant="ghost">
              Resetează
            </Button>
          }
          minColumnWidth={140}
        >
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, title: event.target.value }))} placeholder="Titlu" value={filters.title} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, student: event.target.value }))} placeholder="Student" value={filters.student} />
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))} value={filters.type}>
            <option value="">Toate tipurile</option>
            {(bootstrap?.catalogs.documentTypes ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} value={filters.category}>
            <option value="">Toate categoriile</option>
            {(bootstrap?.catalogs.documentCategories ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} value={filters.location}>
            <option value="">Toate locațiile</option>
            {(bootstrap?.catalogs.archiveLocations ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, createdAt: event.target.value }))} placeholder="Dată" value={filters.createdAt} />
        </TableSearchHeader>
        <Table
          columns={[
            { header: 'Titlu', render: (document) => document.title },
            { header: 'Student', render: (document) => document.studentName },
            { header: 'Tip', render: (document) => document.documentType },
            { header: 'Categorie', render: (document) => document.documentCategory },
            { header: 'Locație', render: (document) => document.archiveLocation || 'N/D' },
            { header: 'Creat la', render: (document) => formatDateTime(document.createdAt) },
            {
              header: 'Acțiune',
              render: (document) => (
                <Button onClick={() => downloadDocument(document)} variant="secondary">
                  Descarcă
                </Button>
              ),
            },
          ]}
          data={filteredDocuments}
          emptyMessage="Nu au fost găsite documente."
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Încarcă document">
        <div className="space-y-4">
          {modalError ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {modalError}
            </div>
          ) : null}

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUpload}>
            <Field className="md:col-span-2" error={fieldErrors.studentId} label="Student">
              <Select
                aria-invalid={Boolean(fieldErrors.studentId)}
                onChange={(event) => {
                  setUploadForm((current) => ({ ...current, studentId: event.target.value }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.studentId
                    return nextErrors
                  })
                }}
                value={uploadForm.studentId}
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field error={fieldErrors.title} label="Titlu">
              <Input
                aria-invalid={Boolean(fieldErrors.title)}
                onChange={(event) => {
                  setUploadForm((current) => ({ ...current, title: event.target.value }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.title
                    return nextErrors
                  })
                }}
                value={uploadForm.title}
              />
            </Field>
            <Field error={fieldErrors.documentTypeId} label="Tip document">
              <Select
                aria-invalid={Boolean(fieldErrors.documentTypeId)}
                onChange={(event) => {
                  const selectedType = bootstrap?.catalogs.documentTypes.find((item) => item.id === event.target.value)
                  setUploadForm((current) => ({
                    ...current,
                    documentTypeId: event.target.value,
                    documentCategoryId: selectedType?.relationIds.documentCategoryId ?? current.documentCategoryId,
                  }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.documentTypeId
                    delete nextErrors.documentCategoryId
                    return nextErrors
                  })
                }}
                value={uploadForm.documentTypeId}
              >
                {(bootstrap?.catalogs.documentTypes ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field error={fieldErrors.documentCategoryId} label="Categorie">
              <Select
                aria-invalid={Boolean(fieldErrors.documentCategoryId)}
                onChange={(event) => {
                  setUploadForm((current) => ({ ...current, documentCategoryId: event.target.value }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.documentCategoryId
                    return nextErrors
                  })
                }}
                value={uploadForm.documentCategoryId}
              >
                {(bootstrap?.catalogs.documentCategories ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Locație arhivă">
              <Select onChange={(event) => setUploadForm((current) => ({ ...current, archiveLocationId: event.target.value }))} value={uploadForm.archiveLocationId}>
                {(bootstrap?.catalogs.archiveLocations ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field className="md:col-span-2" label="Descriere">
              <TextArea onChange={(event) => setUploadForm((current) => ({ ...current, description: event.target.value }))} value={uploadForm.description} />
            </Field>
            <Field className="md:col-span-2" error={fieldErrors.file} label="Fișier">
              <Input
                aria-invalid={Boolean(fieldErrors.file)}
                onChange={(event) => {
                  setUploadForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
                  setFieldErrors((current) => {
                    const nextErrors = { ...current }
                    delete nextErrors.file
                    return nextErrors
                  })
                }}
                type="file"
              />
            </Field>
            <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row">
              <Button className="w-full sm:w-auto" size="md" type="submit">
                Încarcă
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
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2">{children}</div>
      <FormErrorMessage className="mt-2" message={error} />
    </div>
  )
}
