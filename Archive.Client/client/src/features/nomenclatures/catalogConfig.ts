export type CatalogField = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  source?: string
}

type CatalogDefinition = {
  label: string
  icon: string
  fields: CatalogField[]
}

export const catalogConfig = {
  faculties: { label: 'Facultăți', icon: 'material-symbols:domain-rounded', fields: [] },
  departments: {
    label: 'Departamente',
    icon: 'material-symbols:corporate-fare-rounded',
    fields: [{ key: 'facultyId', label: 'Facultate', type: 'select', source: 'faculties' }],
  },
  studyCycles: { label: 'Cicluri de studii', icon: 'material-symbols:cycle-rounded', fields: [] },
  studyFrequencies: { label: 'Frecvențe de studii', icon: 'material-symbols:event-repeat-rounded', fields: [] },
  fundingTypes: { label: 'Tipuri de finanțare', icon: 'material-symbols:payments-rounded', fields: [] },
  academicYears: {
    label: 'Ani academici',
    icon: 'material-symbols:calendar-month-rounded',
    fields: [
      { key: 'startYear', label: 'An început', type: 'number' },
      { key: 'endYear', label: 'An sfârșit', type: 'number' },
    ],
  },
  studyYears: {
    label: 'Ani de studiu',
    icon: 'material-symbols:format-list-numbered-rounded',
    fields: [{ key: 'yearNumber', label: 'Număr an', type: 'number' }],
  },
  studyPrograms: {
    label: 'Programe de studii',
    icon: 'material-symbols:menu-book-rounded',
    fields: [
      { key: 'facultyId', label: 'Facultate', type: 'select', source: 'faculties' },
      { key: 'departmentId', label: 'Departament', type: 'select', source: 'departments' },
      { key: 'studyCycleId', label: 'Ciclu de studii', type: 'select', source: 'studyCycles' },
      { key: 'studyFrequencyId', label: 'Frecvență studii', type: 'select', source: 'studyFrequencies' },
    ],
  },
  groups: {
    label: 'Grupe',
    icon: 'material-symbols:groups-rounded',
    fields: [
      { key: 'studyProgramId', label: 'Program de studii', type: 'select', source: 'studyPrograms' },
      { key: 'academicYearId', label: 'An universitar', type: 'select', source: 'academicYears' },
      { key: 'studyYearId', label: 'An de studiu', type: 'select', source: 'studyYears' },
    ],
  },
  subjects: {
    label: 'Discipline',
    icon: 'material-symbols:bookmark-manager-rounded',
    fields: [
      { key: 'departmentId', label: 'Departament', type: 'select', source: 'departments' },
      { key: 'credits', label: 'Credite', type: 'number' },
    ],
  },
  studentStatuses: { label: 'Statute studenți', icon: 'material-symbols:flag-rounded', fields: [] },
  documentCategories: { label: 'Categorii documente', icon: 'material-symbols:category-rounded', fields: [] },
  documentTypes: {
    label: 'Tipuri de documente',
    icon: 'material-symbols:description-rounded',
    fields: [{ key: 'documentCategoryId', label: 'Categorie', type: 'select', source: 'documentCategories' }],
  },
  archiveLocations: {
    label: 'Locații arhivă',
    icon: 'material-symbols:archive-rounded',
    fields: [
      { key: 'room', label: 'Cameră', type: 'text' },
      { key: 'shelf', label: 'Raft', type: 'text' },
    ],
  },
} satisfies Record<string, CatalogDefinition>

export type CatalogKey = keyof typeof catalogConfig

export const defaultCatalogKey: CatalogKey = 'faculties'

export const catalogEntries = Object.entries(catalogConfig) as [CatalogKey, (typeof catalogConfig)[CatalogKey]][]

export function isCatalogKey(value: string | undefined): value is CatalogKey {
  return value !== undefined && value in catalogConfig
}
