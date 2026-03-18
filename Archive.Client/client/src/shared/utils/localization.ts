import type { Permission } from '../types/models'

const roleNames: Record<string, string> = {
  SuperAdmin: 'Super Administrator',
}

const roleDescriptions: Record<string, string> = {
  SuperAdmin: 'Administrator de sistem cu acces nerestricționat.',
}

const permissionCategories: Record<string, string> = {
  Dashboard: 'Panou',
  Students: 'Studenți',
  Documents: 'Documente',
  Nomenclatures: 'Nomenclatoare',
  Users: 'Utilizatori',
  Roles: 'Roluri',
  Audit: 'Audit',
}

const permissionNames: Record<string, string> = {
  'dashboard.view': 'Vizualizare panou',
  'students.view': 'Vizualizare studenți',
  'students.create': 'Creare studenți',
  'students.update': 'Actualizare studenți',
  'students.notes': 'Gestionare note studenți',
  'students.status': 'Gestionare statute studenți',
  'documents.view': 'Vizualizare documente',
  'documents.upload': 'Încărcare documente',
  'documents.download': 'Descărcare documente',
  'nomenclatures.view': 'Vizualizare nomenclatoare',
  'nomenclatures.manage': 'Administrare nomenclatoare',
  'users.view': 'Vizualizare utilizatori',
  'users.manage': 'Administrare utilizatori',
  'roles.view': 'Vizualizare roluri',
  'roles.manage': 'Administrare roluri',
  'audit.view': 'Vizualizare jurnal audit',
}

const permissionDescriptions: Record<string, string> = {
  'dashboard.view': 'Acces la informațiile de sinteză ale platformei.',
  'students.view': 'Consultarea și inspectarea datelor studenților.',
  'students.create': 'Crearea dosarelor de student.',
  'students.update': 'Editarea dosarelor de student.',
  'students.notes': 'Crearea și administrarea notelor pentru studenți.',
  'students.status': 'Actualizarea istoricului de statut al studenților.',
  'documents.view': 'Consultarea metadatelor documentelor.',
  'documents.upload': 'Încărcarea documentelor în arhivă.',
  'documents.download': 'Descărcarea documentelor arhivate.',
  'nomenclatures.view': 'Consultarea cataloagelor de nomenclatoare.',
  'nomenclatures.manage': 'Crearea și actualizarea nomenclatoarelor.',
  'users.view': 'Consultarea conturilor de utilizator.',
  'users.manage': 'Crearea și editarea conturilor de utilizator.',
  'roles.view': 'Consultarea rolurilor și permisiunilor.',
  'roles.manage': 'Crearea și editarea rolurilor.',
  'audit.view': 'Consultarea istoricului de audit.',
}

const auditActions: Record<string, string> = {
  LOGIN: 'Autentificare',
  DOWNLOAD: 'Descărcare',
  CREATE: 'Creare',
  UPDATE: 'Actualizare',
  DELETE: 'Ștergere',
}

const auditEntities: Record<string, string> = {
  User: 'Utilizator',
  Role: 'Rol',
  Permission: 'Permisiune',
  Student: 'Student',
  Document: 'Document',
  Faculty: 'Facultate',
  Department: 'Departament',
  StudyProgram: 'Program de studii',
  StudyCycle: 'Ciclu de studii',
  StudyFrequency: 'Frecvență studii',
  FundingType: 'Tip de finanțare',
  AcademicYear: 'An universitar',
  StudyYear: 'An de studiu',
  Group: 'Grupă',
  Subject: 'Disciplină',
  StudentStatus: 'Statut student',
  DocumentType: 'Tip document',
  DocumentCategory: 'Categorie document',
  ArchiveLocation: 'Locație arhivă',
  AuditLog: 'Jurnal audit',
}

const errorMessages: Record<string, string> = {
  'Validation failed.': 'Validarea a eșuat.',
  'One or more validation errors occurred.': 'Validarea a eșuat.',
  'A role with the same name already exists.': 'Există deja un rol cu aceeași denumire.',
  'Role not found.': 'Rolul nu a fost găsit.',
  'Student not found.': 'Studentul nu a fost găsit.',
  'Student registration number or national ID is already in use.': 'Numărul de înregistrare sau IDNP-ul studentului este deja utilizat.',
  'Username or email is already in use.': 'Numele de utilizator sau adresa de email este deja utilizată.',
  'User not found.': 'Utilizatorul nu a fost găsit.',
  'Email is already in use.': 'Adresa de email este deja utilizată.',
  'Unknown nomenclature catalog.': 'Catalogul de nomenclatoare nu este cunoscut.',
  'Nomenclature item not found.': 'Elementul din nomenclator nu a fost găsit.',
  'Invalid username or password.': 'Utilizator sau parolă invalidă.',
  'Refresh token is required.': 'Tokenul de reîmprospătare este obligatoriu.',
  'Refresh token is invalid or expired.': 'Tokenul de reîmprospătare este invalid sau expirat.',
  'Document type not found.': 'Tipul de document nu a fost găsit.',
  'Document not found.': 'Documentul nu a fost găsit.',
  'Network Error': 'Eroare de rețea.',
}

const fieldLabels: Record<string, string> = {
  Username: 'Utilizator',
  Password: 'Parolă',
  Email: 'Email',
  FirstName: 'Prenume',
  LastName: 'Nume',
  Name: 'Denumire',
  Description: 'Descriere',
  RegistrationNumber: 'Număr de înregistrare',
  NationalId: 'IDNP',
  FacultyId: 'Facultate',
  DepartmentId: 'Departament',
  StudyProgramId: 'Program de studii',
  GroupId: 'Grupă',
  StudentStatusId: 'Statut student',
  'Contact.Email': 'Email',
  'Contact.Phone': 'Telefon',
  StudentId: 'Student',
  DocumentTypeId: 'Tip document',
  DocumentCategoryId: 'Categorie document',
  StudyCycleId: 'Ciclu de studii',
  StudyFrequencyId: 'Frecvență studii',
  AcademicYearId: 'An universitar',
  StudyYearId: 'An de studiu',
  File: 'Fișier',
  Code: 'Cod',
  Content: 'Conținut',
  Title: 'Titlu',
  Phone: 'Telefon',
  Country: 'Țară',
  City: 'Oraș',
  Street: 'Stradă',
  PostalCode: 'Cod poștal',
  Reason: 'Motiv',
  ArchiveLocationId: 'Locație arhivă',
}

function translateRequiredMessage(message: string) {
  const match = /^(.+?) is required\.$/.exec(message)
  if (!match) {
    return null
  }

  const fieldName = match[1]
  return `Câmpul „${fieldLabels[fieldName] ?? fieldName}” este obligatoriu.`
}

function translateInvalidEmailMessage(message: string) {
  const match = /^The (.+?) field is not a valid e-mail address\.$/.exec(message)
  if (!match) {
    return null
  }

  const fieldName = match[1]
  return `Câmpul „${fieldLabels[fieldName] ?? fieldName}” trebuie să conțină o adresă de email validă.`
}

function translateMinLengthMessage(message: string) {
  const match = /^The field (.+?) must be a string or array type with a minimum length of '(\d+)'\.$/.exec(message)
  if (!match) {
    return null
  }

  const [, fieldName, length] = match
  return `Câmpul „${fieldLabels[fieldName] ?? fieldName}” trebuie să conțină cel puțin ${length} caractere.`
}

export function translateValidationMessage(message: string) {
  return errorMessages[message] ?? translateRequiredMessage(message) ?? translateInvalidEmailMessage(message) ?? translateMinLengthMessage(message) ?? message
}

export function localizeRoleName(value: string) {
  return roleNames[value] ?? value
}

export function localizeRoleDescription(roleName: string, description: string) {
  return roleDescriptions[roleName] ?? description
}

export function localizePermissionCategory(value: string) {
  return permissionCategories[value] ?? value
}

export function localizePermissionName(code: string, fallback: string) {
  return permissionNames[code] ?? fallback
}

export function localizePermissionDescription(code: string, fallback: string) {
  return permissionDescriptions[code] ?? fallback
}

export function localizePermission(permission: Permission): Permission {
  return {
    ...permission,
    category: localizePermissionCategory(permission.category),
    name: localizePermissionName(permission.code, permission.name),
    description: localizePermissionDescription(permission.code, permission.description),
  }
}

export function localizeAuditAction(value: string) {
  return auditActions[value] ?? value
}

export function localizeAuditEntity(value: string) {
  return auditEntities[value] ?? value
}

export function translateErrorMessage(message: string, errors?: Record<string, string[]>) {
  if (errors && Object.keys(errors).length > 0) {
    const translatedErrors = Object.values(errors)
      .flat()
      .map((item) => translateValidationMessage(item))

    if (translatedErrors.length > 0) {
      return translatedErrors.join(' ')
    }
  }

  return translateValidationMessage(message)
}
