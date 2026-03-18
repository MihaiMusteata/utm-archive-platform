import { Icon } from '@iconify/react'
import { lazy, startTransition, Suspense, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Spinner } from '../../../shared/ui/Spinner'
import { Tabs, type TabItem } from '../../../shared/ui/Tabs'
import type { DocumentRecord, NomenclatureBootstrap, StudentDetail, StudentForm } from '../../../shared/types/models'
import { clearFieldErrors, getFieldErrors, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'
import { createEmptyStudentForm, toStudentForm } from '../api/students'
import { validateStudentForm } from '../utils/student-form-validation'
import { TabLoadingState, TabWindow } from './StudentDetailsUi'

const StudentPersonalTab = lazy(async () => {
  const module = await import('./StudentPersonalTab')
  return { default: module.StudentPersonalTab }
})

const StudentAcademicTab = lazy(async () => {
  const module = await import('./StudentAcademicTab')
  return { default: module.StudentAcademicTab }
})

const StudentDocumentsTab = lazy(async () => {
  const module = await import('./StudentDocumentsTab')
  return { default: module.StudentDocumentsTab }
})

const StudentHistoryTab = lazy(async () => {
  const module = await import('./StudentHistoryTab')
  return { default: module.StudentHistoryTab }
})

const StudentNotesTab = lazy(async () => {
  const module = await import('./StudentNotesTab')
  return { default: module.StudentNotesTab }
})

const tabs = [
  { key: 'personal', label: 'Informații personale', icon: 'material-symbols:person-rounded' },
  { key: 'academic', label: 'Informații academice', icon: 'material-symbols:school-rounded' },
  { key: 'documents', label: 'Documente', icon: 'material-symbols:folder-rounded' },
  { key: 'history', label: 'Istoric', icon: 'material-symbols:timeline-rounded' },
  { key: 'notes', label: 'Note', icon: 'material-symbols:sticky-note-2-rounded' },
] satisfies TabItem[]

type TabKey = (typeof tabs)[number]['key']

export function StudentDetailsPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [bootstrap, setBootstrap] = useState<NomenclatureBootstrap | null>(null)
  const [form, setForm] = useState<StudentForm>(createEmptyStudentForm(null))
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [error, setError] = useState('')
  const [studentFieldErrors, setStudentFieldErrors] = useState<FieldErrors>({})
  const [noteFieldErrors, setNoteFieldErrors] = useState<FieldErrors>({})
  const [statusFieldErrors, setStatusFieldErrors] = useState<FieldErrors>({})
  const [documentFieldErrors, setDocumentFieldErrors] = useState<FieldErrors>({})
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [statusId, setStatusId] = useState('')
  const [statusReason, setStatusReason] = useState('')
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    documentTypeId: '',
    documentCategoryId: '',
    archiveLocationId: '',
    file: null as File | null,
  })

  const loadData = useCallback(async () => {
    if (!studentId) {
      return
    }

    try {
      setError('')

      const [detailResponse, bootstrapResponse] = await Promise.all([
        apiClient.get<StudentDetail>(`/students/${studentId}`),
        apiClient.get<NomenclatureBootstrap>('/nomenclatures/bootstrap'),
      ])

      setDetail(detailResponse.data)
      setBootstrap(bootstrapResponse.data)
      setForm(toStudentForm(detailResponse.data))
      setStatusId(detailResponse.data.studentStatusId)

      const firstDocumentType = bootstrapResponse.data.catalogs.documentTypes?.[0]
      setUploadForm((current) => ({
        ...current,
        documentTypeId: current.documentTypeId || firstDocumentType?.id || '',
        documentCategoryId: current.documentCategoryId || firstDocumentType?.relationIds.documentCategoryId || '',
        archiveLocationId: current.archiveLocationId || bootstrapResponse.data.catalogs.archiveLocations?.[0]?.id || '',
      }))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [studentId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const clearStudentErrors = (...keys: string[]) => {
    setStudentFieldErrors((current) => clearFieldErrors(current, ...keys))
  }

  const clearNoteErrors = (...keys: string[]) => {
    setNoteFieldErrors((current) => clearFieldErrors(current, ...keys))
  }

  const clearStatusErrors = (...keys: string[]) => {
    setStatusFieldErrors((current) => clearFieldErrors(current, ...keys))
  }

  const clearDocumentErrors = (...keys: string[]) => {
    setDocumentFieldErrors((current) => clearFieldErrors(current, ...keys))
  }

  const saveStudent = async () => {
    if (!studentId) {
      return
    }

    setError('')
    const nextFieldErrors = validateStudentForm(form)
    if (Object.keys(nextFieldErrors).length > 0) {
      setStudentFieldErrors(nextFieldErrors)
      setActiveTab('personal')
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      await apiClient.put(`/students/${studentId}`, {
        ...form,
        graduationDate: form.graduationDate || null,
      })
      setStudentFieldErrors({})
      showSuccessToast('Datele studentului au fost salvate.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setStudentFieldErrors(nextServerErrors)
      setError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const addNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!studentId) {
      return
    }

    setError('')
    const nextFieldErrors: FieldErrors = {}
    if (!noteTitle.trim()) {
      nextFieldErrors.title = requiredField('Titlu')
    }
    if (!noteContent.trim()) {
      nextFieldErrors.content = requiredField('Conținut')
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setNoteFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      await apiClient.post(`/students/${studentId}/notes`, {
        title: noteTitle,
        content: noteContent,
      })
      setNoteTitle('')
      setNoteContent('')
      setNoteFieldErrors({})
      showSuccessToast('Nota a fost adăugată.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setNoteFieldErrors(nextServerErrors)
      setError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const changeStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!studentId) {
      return
    }

    setError('')
    const nextFieldErrors: FieldErrors = {}
    if (!statusId) {
      nextFieldErrors.statusId = requiredField('Statut')
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setStatusFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      await apiClient.post(`/students/${studentId}/status`, {
        studentStatusId: statusId,
        reason: statusReason,
      })
      setStatusReason('')
      setStatusFieldErrors({})
      showSuccessToast('Statutul a fost actualizat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setStatusFieldErrors(nextServerErrors)
      setError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const uploadDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!studentId) {
      return
    }

    setError('')
    const nextFieldErrors: FieldErrors = {}
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
      setDocumentFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    const selectedFile = uploadForm.file
    if (!selectedFile) {
      return
    }

    try {
      const body = new FormData()
      body.append('studentId', studentId)
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
      setDocumentFieldErrors({})
      showSuccessToast('Documentul a fost încărcat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setDocumentFieldErrors(nextServerErrors)
      setError(Object.keys(nextServerErrors).length > 0 ? '' : message)
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

  if (error && !detail) {
    return (
      <Card className="border-amber-200/80 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30">
        <p className="text-sm text-amber-950 dark:text-amber-200">{error}</p>
      </Card>
    )
  }

  if (!detail) {
    return <Spinner />
  }

  const currentTab = tabs.find((item) => item.key === activeTab) ?? tabs[0]
  const activeWindow = getActiveWindowMeta(activeTab, detail)

      const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return <StudentPersonalTab bootstrap={bootstrap} errors={studentFieldErrors} form={form} onFieldChange={clearStudentErrors} setForm={setForm} />
      case 'academic':
        return (
          <StudentAcademicTab
            bootstrap={bootstrap}
            detail={detail}
            errors={studentFieldErrors}
            form={form}
            onFieldChange={clearStudentErrors}
            setForm={setForm}
          />
        )
      case 'documents':
        return (
          <StudentDocumentsTab
            bootstrap={bootstrap}
            detail={detail}
            downloadDocument={downloadDocument}
            errors={documentFieldErrors}
            onSubmit={uploadDocument}
            onUploadFieldChange={clearDocumentErrors}
            setUploadForm={setUploadForm}
            uploadForm={uploadForm}
          />
        )
      case 'history':
        return (
          <StudentHistoryTab
            bootstrap={bootstrap}
            detail={detail}
            errors={statusFieldErrors}
            onSubmit={changeStatus}
            onStatusFieldChange={clearStatusErrors}
            setStatusId={setStatusId}
            setStatusReason={setStatusReason}
            statusId={statusId}
            statusReason={statusReason}
          />
        )
      case 'notes':
        return (
          <StudentNotesTab
            detail={detail}
            errors={noteFieldErrors}
            noteContent={noteContent}
            noteTitle={noteTitle}
            onSubmit={addNote}
            onNoteFieldChange={clearNoteErrors}
            setNoteContent={setNoteContent}
            setNoteTitle={setNoteTitle}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{detail.registrationNumber}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{detail.fullName}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {detail.status} · {detail.academicInfo.studyProgram} · {detail.academicInfo.group}
            </p>
          </div>
          <Button className="w-full md:w-auto" onClick={saveStudent} size="md">
            <Icon icon="material-symbols:save-rounded" width={18} />
            Salvează
          </Button>
        </div>
      </Card>

      {error ? (
        <Card className="border-amber-200/80 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-sm text-amber-950 dark:text-amber-200">{error}</p>
        </Card>
      ) : null}

      <Tabs
        activeKey={activeTab}
        items={tabs}
        onChange={(key) => {
          startTransition(() => {
            setActiveTab(key as TabKey)
          })
        }}
      />

      <TabWindow
        icon={activeWindow.icon}
        label={currentTab.label}
        meta={<Badge>{activeWindow.badge}</Badge>}
        title={activeWindow.title}
      >
        <Suspense fallback={<TabLoadingState message={`Se încarcă ${activeWindow.title.toLowerCase()}...`} />}>
          {renderActiveTab()}
        </Suspense>
      </TabWindow>
    </div>
  )
}

function getActiveWindowMeta(activeTab: TabKey, detail: StudentDetail) {
  switch (activeTab) {
    case 'personal':
      return {
        title: 'Profil',
        badge: detail.status,
        icon: 'material-symbols:person-rounded',
      }
    case 'academic':
      return {
        title: 'Academic',
        badge: detail.academicInfo.academicYear,
        icon: 'material-symbols:school-rounded',
      }
    case 'documents':
      return {
        title: 'Documente',
        badge: String(detail.documents.length),
        icon: 'material-symbols:folder-open-rounded',
      }
    case 'history':
      return {
        title: 'Istoric',
        badge: String(detail.history.length),
        icon: 'material-symbols:timeline-rounded',
      }
    case 'notes':
      return {
        title: 'Note',
        badge: String(detail.notes.length),
        icon: 'material-symbols:sticky-note-2-rounded',
      }
    default:
      return {
        title: 'Student',
        badge: detail.status,
        icon: 'material-symbols:contact-page-rounded',
      }
  }
}
