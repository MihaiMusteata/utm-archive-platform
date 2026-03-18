import type { Dispatch, SetStateAction } from 'react'
import { Card } from '../../../shared/ui/Card'
import type { NomenclatureBootstrap, StudentForm } from '../../../shared/types/models'
import type { FieldErrors } from '../../../shared/utils/form-errors'
import { StudentPersonalFields } from './StudentFormFields'
import { SectionHeading } from './StudentDetailsUi'

type Props = {
  bootstrap: NomenclatureBootstrap | null
  form: StudentForm
  setForm: Dispatch<SetStateAction<StudentForm>>
  errors?: FieldErrors
  onFieldChange?: (...keys: string[]) => void
}

export function StudentPersonalTab({ bootstrap, form, setForm, errors, onFieldChange }: Props) {
  return (
    <Card className="space-y-6">
      <SectionHeading icon="material-symbols:person-rounded" kicker="Profil" title="Date personale" />
      <StudentPersonalFields bootstrap={bootstrap} errors={errors} form={form} onFieldChange={onFieldChange} setForm={setForm} />
    </Card>
  )
}
