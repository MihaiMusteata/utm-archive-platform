import type { StudentForm } from '../../../shared/types/models'
import { invalidEmailField, isValidEmail, requiredField, type FieldErrors } from '../../../shared/utils/form-errors'

export function validateStudentForm(form: StudentForm) {
  const errors: FieldErrors = {}

  if (!form.registrationNumber.trim()) {
    errors.registrationNumber = requiredField('Număr de înregistrare')
  }

  if (!form.nationalId.trim()) {
    errors.nationalId = requiredField('IDNP')
  }

  if (!form.firstName.trim()) {
    errors.firstName = requiredField('Prenume')
  }

  if (!form.lastName.trim()) {
    errors.lastName = requiredField('Nume')
  }

  if (!form.dateOfBirth) {
    errors.dateOfBirth = requiredField('Data nașterii')
  }

  if (!form.enrollmentDate) {
    errors.enrollmentDate = requiredField('Data înmatriculării')
  }

  if (!form.facultyId) {
    errors.facultyId = requiredField('Facultate')
  }

  if (!form.departmentId) {
    errors.departmentId = requiredField('Departament')
  }

  if (!form.studyProgramId) {
    errors.studyProgramId = requiredField('Program de studii')
  }

  if (!form.groupId) {
    errors.groupId = requiredField('Grupă')
  }

  if (!form.studentStatusId) {
    errors.studentStatusId = requiredField('Statut')
  }

  if (!form.contact.email.trim()) {
    errors['contact.email'] = requiredField('Email')
  } else if (!isValidEmail(form.contact.email.trim())) {
    errors['contact.email'] = invalidEmailField('Email')
  }

  if (!form.contact.phone.trim()) {
    errors['contact.phone'] = requiredField('Telefon')
  }

  if (!form.address.country.trim()) {
    errors['address.country'] = requiredField('Țară')
  }

  if (!form.address.city.trim()) {
    errors['address.city'] = requiredField('Oraș')
  }

  if (!form.address.street.trim()) {
    errors['address.street'] = requiredField('Stradă')
  }

  if (!form.address.postalCode.trim()) {
    errors['address.postalCode'] = requiredField('Cod poștal')
  }

  return errors
}
