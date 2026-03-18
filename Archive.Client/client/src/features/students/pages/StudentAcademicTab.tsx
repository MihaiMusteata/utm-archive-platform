import type { Dispatch, SetStateAction } from 'react'
import { Card } from '../../../shared/ui/Card'
import type { NomenclatureBootstrap, StudentDetail, StudentForm } from '../../../shared/types/models'
import type { FieldErrors } from '../../../shared/utils/form-errors'
import { StudentAcademicFields } from './StudentFormFields'
import { InfoRow, SectionHeading } from './StudentDetailsUi'

type Props = {
  bootstrap: NomenclatureBootstrap | null
  detail: StudentDetail
  form: StudentForm
  setForm: Dispatch<SetStateAction<StudentForm>>
  errors?: FieldErrors
  onFieldChange?: (...keys: string[]) => void
}

export function StudentAcademicTab({ bootstrap, detail, form, setForm, errors, onFieldChange }: Props) {
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <SectionHeading icon="material-symbols:school-rounded" kicker="Studii" title="Date academice" />
        <StudentAcademicFields bootstrap={bootstrap} errors={errors} form={form} onFieldChange={onFieldChange} setForm={setForm} />
      </Card>

      <Card className="space-y-5">
        <SectionHeading icon="material-symbols:account-tree-rounded" kicker="Structură" title="Rezumat" />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <InfoRow label="Facultate" value={detail.academicInfo.faculty} />
          <InfoRow label="Departament" value={detail.academicInfo.department} />
          <InfoRow label="Program de studii" value={detail.academicInfo.studyProgram} />
          <InfoRow label="Ciclu de studii" value={detail.academicInfo.studyCycle} />
          <InfoRow label="Frecvență" value={detail.academicInfo.studyFrequency} />
          <InfoRow label="Finanțare" value={detail.academicInfo.fundingType} />
          <InfoRow label="An universitar" value={detail.academicInfo.academicYear} />
          <InfoRow label="An de studiu" value={detail.academicInfo.studyYear} />
          <InfoRow label="Grupă" value={detail.academicInfo.group} />
        </div>
      </Card>
    </div>
  )
}
