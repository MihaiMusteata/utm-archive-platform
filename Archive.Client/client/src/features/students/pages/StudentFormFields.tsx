import type { Dispatch, SetStateAction } from 'react'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import type { NomenclatureBootstrap, StudentForm } from '../../../shared/types/models'
import { getFieldError, type FieldErrors } from '../../../shared/utils/form-errors'
import { Field, FormSection } from './StudentDetailsUi'

type Props = {
  bootstrap: NomenclatureBootstrap | null
  form: StudentForm
  setForm: Dispatch<SetStateAction<StudentForm>>
  errors?: FieldErrors
  onFieldChange?: (...keys: string[]) => void
}

const wideFieldGridClassName = 'grid gap-4 md:grid-cols-2 2xl:grid-cols-4'

export function StudentPersonalFields({ bootstrap, form, setForm, errors = {}, onFieldChange }: Props) {
  const groups = bootstrap?.catalogs.groups ?? []
  const statuses = bootstrap?.catalogs.studentStatuses ?? []

  const setTopLevelValue = <K extends keyof StudentForm>(key: K, value: StudentForm[K], ...errorKeys: string[]) => {
    onFieldChange?.(...(errorKeys.length > 0 ? errorKeys : [String(key)]))
    setForm((current) => ({ ...current, [key]: value }))
  }

  const setContactValue = <K extends keyof StudentForm['contact']>(key: K, value: StudentForm['contact'][K], ...errorKeys: string[]) => {
    onFieldChange?.(...(errorKeys.length > 0 ? errorKeys : [`contact.${String(key)}`, String(key)]))
    setForm((current) => ({ ...current, contact: { ...current.contact, [key]: value } }))
  }

  const setAddressValue = <K extends keyof StudentForm['address']>(key: K, value: StudentForm['address'][K], ...errorKeys: string[]) => {
    onFieldChange?.(...(errorKeys.length > 0 ? errorKeys : [`address.${String(key)}`, String(key)]))
    setForm((current) => ({ ...current, address: { ...current.address, [key]: value } }))
  }

  const setSyncedAcademicValue = <
    K extends 'facultyId' | 'departmentId' | 'studyProgramId' | 'groupId'
  >(
    key: K,
    value: string,
  ) => {
    onFieldChange?.(key, `academicRecord.${key}`)
    setForm((current) => ({
      ...current,
      [key]: value,
      academicRecord: { ...current.academicRecord, [key]: value },
    }))
  }

  return (
    <div className="space-y-5">
      <FormSection icon="material-symbols:badge-rounded" title="Identitate">
        <div className={wideFieldGridClassName}>
          <Field error={getFieldError(errors, 'registrationNumber')} label="Număr de înregistrare">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'registrationNumber'))}
              onChange={(event) => setTopLevelValue('registrationNumber', event.target.value)}
              value={form.registrationNumber}
            />
          </Field>
          <Field error={getFieldError(errors, 'nationalId')} label="IDNP">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'nationalId'))}
              onChange={(event) => setTopLevelValue('nationalId', event.target.value)}
              value={form.nationalId}
            />
          </Field>
          <Field error={getFieldError(errors, 'firstName')} label="Prenume">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'firstName'))}
              onChange={(event) => setTopLevelValue('firstName', event.target.value)}
              value={form.firstName}
            />
          </Field>
          <Field error={getFieldError(errors, 'lastName')} label="Nume">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'lastName'))}
              onChange={(event) => setTopLevelValue('lastName', event.target.value)}
              value={form.lastName}
            />
          </Field>
          <Field label="Nume mijlociu">
            <Input onChange={(event) => setTopLevelValue('middleName', event.target.value)} value={form.middleName} />
          </Field>
          <Field error={getFieldError(errors, 'dateOfBirth')} label="Data nașterii">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'dateOfBirth'))}
              onChange={(event) => setTopLevelValue('dateOfBirth', event.target.value)}
              type="date"
              value={form.dateOfBirth}
            />
          </Field>
          <Field label="Gen">
            <Select onChange={(event) => setTopLevelValue('gender', Number(event.target.value))} value={form.gender}>
              <option value={0}>Necunoscut</option>
              <option value={1}>Masculin</option>
              <option value={2}>Feminin</option>
              <option value={3}>Altul</option>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection icon="material-symbols:apartment-rounded" title="Administrativ">
        <div className={wideFieldGridClassName}>
          <Field error={getFieldError(errors, 'enrollmentDate')} label="Data înmatriculării">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'enrollmentDate'))}
              onChange={(event) => setTopLevelValue('enrollmentDate', event.target.value)}
              type="date"
              value={form.enrollmentDate}
            />
          </Field>
          <Field label="Data absolvirii">
            <Input onChange={(event) => setTopLevelValue('graduationDate', event.target.value)} type="date" value={form.graduationDate} />
          </Field>
          <Field error={getFieldError(errors, 'facultyId', 'academicRecord.facultyId')} label="Facultate">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'facultyId', 'academicRecord.facultyId'))}
              onChange={(event) => setSyncedAcademicValue('facultyId', event.target.value)}
              value={form.facultyId}
            >
              {(bootstrap?.lookups.faculties ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={getFieldError(errors, 'departmentId', 'academicRecord.departmentId')} label="Departament">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'departmentId', 'academicRecord.departmentId'))}
              onChange={(event) => setSyncedAcademicValue('departmentId', event.target.value)}
              value={form.departmentId}
            >
              {(bootstrap?.lookups.departments ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={getFieldError(errors, 'studyProgramId', 'academicRecord.studyProgramId')} label="Program de studii">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'studyProgramId', 'academicRecord.studyProgramId'))}
              onChange={(event) => setSyncedAcademicValue('studyProgramId', event.target.value)}
              value={form.studyProgramId}
            >
              {(bootstrap?.lookups.studyPrograms ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={getFieldError(errors, 'groupId', 'academicRecord.groupId')} label="Grupă">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'groupId', 'academicRecord.groupId'))}
              onChange={(event) => setSyncedAcademicValue('groupId', event.target.value)}
              value={form.groupId}
            >
              {groups.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={getFieldError(errors, 'studentStatusId', 'statusId')} label="Statut">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'studentStatusId', 'statusId'))}
              onChange={(event) => setTopLevelValue('studentStatusId', event.target.value, 'studentStatusId', 'statusId')}
              value={form.studentStatusId}
            >
              {statuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection icon="material-symbols:contacts-rounded" title="Contact">
        <div className={wideFieldGridClassName}>
          <Field error={getFieldError(errors, 'contact.email', 'email')} label="Email">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'contact.email', 'email'))}
              onChange={(event) => setContactValue('email', event.target.value)}
              value={form.contact.email}
            />
          </Field>
          <Field error={getFieldError(errors, 'contact.phone', 'phone')} label="Telefon">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'contact.phone', 'phone'))}
              onChange={(event) => setContactValue('phone', event.target.value)}
              value={form.contact.phone}
            />
          </Field>
          <Field label="Persoană de contact">
            <Input
              onChange={(event) => setContactValue('emergencyContactName', event.target.value)}
              value={form.contact.emergencyContactName}
            />
          </Field>
          <Field label="Telefon de urgență">
            <Input
              onChange={(event) => setContactValue('emergencyContactPhone', event.target.value)}
              value={form.contact.emergencyContactPhone}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection icon="material-symbols:location-on-rounded" title="Adresă">
        <div className={wideFieldGridClassName}>
          <Field error={getFieldError(errors, 'address.country', 'country')} label="Țară">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'address.country', 'country'))}
              onChange={(event) => setAddressValue('country', event.target.value)}
              value={form.address.country}
            />
          </Field>
          <Field error={getFieldError(errors, 'address.city', 'city')} label="Oraș">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'address.city', 'city'))}
              onChange={(event) => setAddressValue('city', event.target.value)}
              value={form.address.city}
            />
          </Field>
          <Field error={getFieldError(errors, 'address.street', 'street')} label="Stradă">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'address.street', 'street'))}
              onChange={(event) => setAddressValue('street', event.target.value)}
              value={form.address.street}
            />
          </Field>
          <Field error={getFieldError(errors, 'address.postalCode', 'postalCode')} label="Cod poștal">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'address.postalCode', 'postalCode'))}
              onChange={(event) => setAddressValue('postalCode', event.target.value)}
              value={form.address.postalCode}
            />
          </Field>
        </div>
      </FormSection>
    </div>
  )
}

export function StudentAcademicFields({ bootstrap, form, setForm, errors = {}, onFieldChange }: Props) {
  const groups = bootstrap?.catalogs.groups ?? []

  const setAcademicValue = <K extends keyof StudentForm['academicRecord']>(
    key: K,
    value: StudentForm['academicRecord'][K],
    ...errorKeys: string[]
  ) => {
    onFieldChange?.(...(errorKeys.length > 0 ? errorKeys : [`academicRecord.${String(key)}`]))
    setForm((current) => ({ ...current, academicRecord: { ...current.academicRecord, [key]: value } }))
  }

  const setGroupValue = (value: string) => {
    onFieldChange?.('groupId', 'academicRecord.groupId')
    setForm((current) => ({
      ...current,
      groupId: value,
      academicRecord: { ...current.academicRecord, groupId: value },
    }))
  }

  return (
    <div className="space-y-5">
      <FormSection icon="material-symbols:school-rounded" title="Catalog">
        <div className={wideFieldGridClassName}>
          <Field label="Număr matricol">
            <Input
              onChange={(event) => setAcademicValue('studentNumber', event.target.value)}
              value={form.academicRecord.studentNumber}
            />
          </Field>
          <Field label="Ciclu de studii">
            <Select
              onChange={(event) => setAcademicValue('studyCycleId', event.target.value)}
              value={form.academicRecord.studyCycleId}
            >
              {(bootstrap?.lookups.studyCycles ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Frecvență studii">
            <Select
              onChange={(event) => setAcademicValue('studyFrequencyId', event.target.value)}
              value={form.academicRecord.studyFrequencyId}
            >
              {(bootstrap?.lookups.studyFrequencies ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tip de finanțare">
            <Select
              onChange={(event) => setAcademicValue('fundingTypeId', event.target.value)}
              value={form.academicRecord.fundingTypeId}
            >
              {(bootstrap?.lookups.fundingTypes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection icon="material-symbols:groups-rounded" title="An și grupă">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <Field label="An universitar">
            <Select
              onChange={(event) => setAcademicValue('academicYearId', event.target.value)}
              value={form.academicRecord.academicYearId}
            >
              {(bootstrap?.lookups.academicYears ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="An de studiu">
            <Select
              onChange={(event) => setAcademicValue('studyYearId', event.target.value)}
              value={form.academicRecord.studyYearId}
            >
              {(bootstrap?.lookups.studyYears ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={getFieldError(errors, 'groupId', 'academicRecord.groupId')} label="Grupă">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'groupId', 'academicRecord.groupId'))}
              onChange={(event) => setGroupValue(event.target.value)}
              value={form.academicRecord.groupId}
            >
              {groups.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>
    </div>
  )
}
