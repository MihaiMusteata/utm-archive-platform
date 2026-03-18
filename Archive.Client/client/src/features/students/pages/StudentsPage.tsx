import { Icon } from '@iconify/react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { Table } from '../../../shared/ui/Table'
import { TableFilterInput } from '../../../shared/ui/TableFilterInput'
import { TableFilterSelect } from '../../../shared/ui/TableFilterSelect'
import { TableSearchHeader } from '../../../shared/ui/TableSearchHeader'
import type { NomenclatureBootstrap, PagedResponse, StudentForm, StudentListItem } from '../../../shared/types/models'
import { clearFieldErrors, getFieldErrors, type FieldErrors } from '../../../shared/utils/form-errors'
import { matchesFilter } from '../../../shared/utils/filtering'
import { showErrorToast, showSuccessToast } from '../../../shared/utils/toasts'
import { createEmptyStudentForm } from '../api/students'
import { StudentAcademicFields, StudentPersonalFields } from './StudentFormFields'
import { validateStudentForm } from '../utils/student-form-validation'

const defaultStudentFilters = {
  registrationNumber: '',
  student: '',
  faculty: '',
  program: '',
  group: '',
  status: '',
}

export function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [bootstrap, setBootstrap] = useState<NomenclatureBootstrap | null>(null)
  const [filters, setFilters] = useState(defaultStudentFilters)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<StudentForm>(createEmptyStudentForm(null))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = useCallback(async () => {
    try {
      const [studentsResponse, bootstrapResponse] = await Promise.all([
        apiClient.get<PagedResponse<StudentListItem>>('/students?page=1&pageSize=100'),
        apiClient.get<NomenclatureBootstrap>('/nomenclatures/bootstrap'),
      ])

      setStudents(studentsResponse.data.items)
      setBootstrap(bootstrapResponse.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (bootstrap && !form.facultyId) {
      setForm(createEmptyStudentForm(bootstrap))
    }
  }, [bootstrap, form.facultyId])

  const openCreateModal = () => {
    setForm(createEmptyStudentForm(bootstrap))
    setFieldErrors({})
    setModalError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFieldErrors({})
    setModalError('')
  }

  const clearStudentErrors = (...keys: string[]) => {
    setFieldErrors((current) => clearFieldErrors(current, ...keys))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError('')

    const nextFieldErrors = validateStudentForm(form)
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      showErrorToast('Corectează câmpurile marcate.')
      return
    }

    try {
      await apiClient.post('/students', {
        ...form,
        graduationDate: form.graduationDate || null,
      })

      closeModal()
      setForm(createEmptyStudentForm(bootstrap))
      showSuccessToast('Studentul a fost creat.')
      await loadData()
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      const nextServerErrors = getFieldErrors(requestError)
      setFieldErrors(nextServerErrors)
      setModalError(Object.keys(nextServerErrors).length > 0 ? '' : message)
      showErrorToast(message)
    }
  }

  const filteredStudents = students.filter((student) => {
    return (
      matchesFilter(student.registrationNumber, filters.registrationNumber) &&
      matchesFilter(student.fullName, filters.student) &&
      matchesFilter(student.faculty, filters.faculty) &&
      matchesFilter(student.program, filters.program) &&
      matchesFilter(student.group, filters.group) &&
      matchesFilter(student.status, filters.status)
    )
  })

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-300">
              <Icon icon="material-symbols:school-rounded" width={20} />
            </span>
            <h4 className="text-lg font-semibold">Studenți</h4>
          </div>
          <Button className="flex-1 sm:flex-none" onClick={openCreateModal} size="md">
            <Icon icon="material-symbols:add-rounded" width={18} />
            Creează
          </Button>
        </div>
        {error ? <p className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{error}</p> : null}
        <TableSearchHeader
          actions={
            <Button onClick={() => setFilters(defaultStudentFilters)} size="sm" variant="ghost">
              Resetează
            </Button>
          }
          minColumnWidth={140}
        >
          <TableFilterInput
            onChange={(event) => setFilters((current) => ({ ...current, registrationNumber: event.target.value }))}
            placeholder="Înregistrare"
            value={filters.registrationNumber}
          />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, student: event.target.value }))} placeholder="Student" value={filters.student} />
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, faculty: event.target.value }))} value={filters.faculty}>
            <option value="">Toate facultățile</option>
            {(bootstrap?.lookups.faculties ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, program: event.target.value }))} value={filters.program}>
            <option value="">Toate programele</option>
            {(bootstrap?.lookups.studyPrograms ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value }))} value={filters.group}>
            <option value="">Toate grupele</option>
            {(bootstrap?.catalogs.groups ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} value={filters.status}>
            <option value="">Toate statutele</option>
            {(bootstrap?.catalogs.studentStatuses ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </TableFilterSelect>
        </TableSearchHeader>
        <Table
          columns={[
            { header: 'Înregistrare', render: (student) => student.registrationNumber },
            { header: 'Student', render: (student) => student.fullName },
            { header: 'Facultate', render: (student) => student.faculty },
            { header: 'Program', render: (student) => student.program },
            { header: 'Grupă', render: (student) => student.group },
            { header: 'Statut', render: (student) => student.status },
          ]}
          data={filteredStudents}
          emptyMessage="Nu au fost găsiți studenți."
          onRowClick={(student) => navigate(`/students/${student.id}`)}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Creează student">
        {modalError ? <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{modalError}</p> : null}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <StudentPersonalFields bootstrap={bootstrap} errors={fieldErrors} form={form} onFieldChange={clearStudentErrors} setForm={setForm} />
          <StudentAcademicFields bootstrap={bootstrap} errors={fieldErrors} form={form} onFieldChange={clearStudentErrors} setForm={setForm} />
          <div className="flex justify-end">
            <Button className="w-full sm:w-auto" size="md" type="submit">
              Creează student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
