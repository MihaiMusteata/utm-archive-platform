export type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export type CurrentUser = {
  id: string
  username: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: CurrentUser
}

export type Permission = {
  id: string
  code: string
  name: string
  category: string
  description: string
}

export type Role = {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissionIds: string[]
  permissionCodes: string[]
}

export type User = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  roleIds: string[]
  roles: string[]
}

export type LookupItem = {
  id: string
  code: string
  name: string
}

export type NomenclatureItem = {
  id: string
  catalog: string
  code: string
  name: string
  description?: string | null
  isActive: boolean
  secondaryLabel?: string | null
  relationIds: Record<string, string | null>
  metadata: Record<string, string | null>
}

export type NomenclatureBootstrap = {
  catalogs: Record<string, NomenclatureItem[]>
  lookups: Record<string, LookupItem[]>
}

export type DocumentRecord = {
  id: string
  studentId: string
  studentName: string
  title: string
  description?: string | null
  fileName: string
  mimeType: string
  size: number
  documentType: string
  documentCategory: string
  archiveLocation?: string | null
  hash: string
  createdAt: string
}

export type StudentListItem = {
  id: string
  registrationNumber: string
  fullName: string
  nationalId: string
  faculty: string
  program: string
  group: string
  status: string
  documentsCount: number
}

export type StudentDetail = {
  id: string
  registrationNumber: string
  nationalId: string
  firstName: string
  lastName: string
  middleName?: string | null
  fullName: string
  dateOfBirth: string
  gender: string
  enrollmentDate: string
  graduationDate?: string | null
  facultyId: string
  departmentId: string
  studyProgramId: string
  groupId: string
  studentStatusId: string
  status: string
  contact: {
    email: string
    phone: string
    emergencyContactName?: string | null
    emergencyContactPhone?: string | null
  }
  address: {
    addressType: string
    country: string
    city: string
    street: string
    postalCode: string
  }
  academicInfo: {
    facultyId: string
    departmentId: string
    studyProgramId: string
    studyCycleId: string
    studyFrequencyId: string
    fundingTypeId: string
    academicYearId: string
    studyYearId: string
    groupId: string
    studentNumber: string
    faculty: string
    department: string
    studyProgram: string
    studyCycle: string
    studyFrequency: string
    fundingType: string
    academicYear: string
    studyYear: string
    group: string
  }
  documents: DocumentRecord[]
  history: {
    id: string
    previousStatus?: string | null
    newStatus: string
    reason?: string | null
    changedAt: string
  }[]
  notes: {
    id: string
    title: string
    content: string
    createdAt: string
    createdByName?: string | null
  }[]
}

export type AuditLog = {
  id: string
  action: string
  entityName: string
  entityId?: string | null
  username?: string | null
  route?: string | null
  method?: string | null
  ipAddress?: string | null
  detailsJson?: string | null
  createdAt: string
}

export type DashboardSummary = {
  studentsCount: number
  activeStudentsCount: number
  documentsCount: number
  usersCount: number
  recentDocuments: DocumentRecord[]
  recentAuditLogs: AuditLog[]
}

export type StudentForm = {
  registrationNumber: string
  nationalId: string
  firstName: string
  lastName: string
  middleName: string
  dateOfBirth: string
  gender: number
  enrollmentDate: string
  graduationDate: string
  facultyId: string
  departmentId: string
  studyProgramId: string
  groupId: string
  studentStatusId: string
  academicRecord: {
    facultyId: string
    departmentId: string
    studyProgramId: string
    studyCycleId: string
    studyFrequencyId: string
    fundingTypeId: string
    academicYearId: string
    studyYearId: string
    groupId: string
    studentNumber: string
  }
  contact: {
    email: string
    phone: string
    emergencyContactName: string
    emergencyContactPhone: string
  }
  address: {
    addressType: number
    country: string
    city: string
    street: string
    postalCode: string
  }
}
