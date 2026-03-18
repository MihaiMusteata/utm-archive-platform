import type { NomenclatureBootstrap, StudentDetail, StudentForm } from '../../../shared/types/models'

function firstLookupId(bootstrap: NomenclatureBootstrap | null, key: string) {
  return bootstrap?.lookups[key]?.[0]?.id ?? ''
}

export function createEmptyStudentForm(bootstrap: NomenclatureBootstrap | null): StudentForm {
  return {
    registrationNumber: '',
    nationalId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 0,
    enrollmentDate: '',
    graduationDate: '',
    facultyId: firstLookupId(bootstrap, 'faculties'),
    departmentId: firstLookupId(bootstrap, 'departments'),
    studyProgramId: firstLookupId(bootstrap, 'studyPrograms'),
    groupId: '',
    studentStatusId: bootstrap?.catalogs.studentStatuses?.[0]?.id ?? '',
    academicRecord: {
      facultyId: firstLookupId(bootstrap, 'faculties'),
      departmentId: firstLookupId(bootstrap, 'departments'),
      studyProgramId: firstLookupId(bootstrap, 'studyPrograms'),
      studyCycleId: firstLookupId(bootstrap, 'studyCycles'),
      studyFrequencyId: firstLookupId(bootstrap, 'studyFrequencies'),
      fundingTypeId: firstLookupId(bootstrap, 'fundingTypes'),
      academicYearId: firstLookupId(bootstrap, 'academicYears'),
      studyYearId: firstLookupId(bootstrap, 'studyYears'),
      groupId: '',
      studentNumber: '',
    },
    contact: {
      email: '',
      phone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
    address: {
      addressType: 1,
      country: '',
      city: '',
      street: '',
      postalCode: '',
    },
  }
}

export function toStudentForm(detail: StudentDetail): StudentForm {
  return {
    registrationNumber: detail.registrationNumber,
    nationalId: detail.nationalId,
    firstName: detail.firstName,
    lastName: detail.lastName,
    middleName: detail.middleName ?? '',
    dateOfBirth: detail.dateOfBirth.slice(0, 10),
    gender: mapGender(detail.gender),
    enrollmentDate: detail.enrollmentDate.slice(0, 10),
    graduationDate: detail.graduationDate?.slice(0, 10) ?? '',
    facultyId: detail.facultyId,
    departmentId: detail.departmentId,
    studyProgramId: detail.studyProgramId,
    groupId: detail.groupId,
    studentStatusId: detail.studentStatusId,
    academicRecord: {
      facultyId: detail.academicInfo.facultyId,
      departmentId: detail.academicInfo.departmentId,
      studyProgramId: detail.academicInfo.studyProgramId,
      studyCycleId: detail.academicInfo.studyCycleId,
      studyFrequencyId: detail.academicInfo.studyFrequencyId,
      fundingTypeId: detail.academicInfo.fundingTypeId,
      academicYearId: detail.academicInfo.academicYearId,
      studyYearId: detail.academicInfo.studyYearId,
      groupId: detail.academicInfo.groupId,
      studentNumber: detail.academicInfo.studentNumber,
    },
    contact: {
      email: detail.contact.email,
      phone: detail.contact.phone,
      emergencyContactName: detail.contact.emergencyContactName ?? '',
      emergencyContactPhone: detail.contact.emergencyContactPhone ?? '',
    },
    address: {
      addressType: detail.address.addressType.toLowerCase().includes('correspondence') ? 2 : 1,
      country: detail.address.country,
      city: detail.address.city,
      street: detail.address.street,
      postalCode: detail.address.postalCode,
    },
  }
}

function mapGender(gender: string) {
  switch (gender.toLowerCase()) {
    case 'male':
      return 1
    case 'female':
      return 2
    case 'other':
      return 3
    default:
      return 0
  }
}
