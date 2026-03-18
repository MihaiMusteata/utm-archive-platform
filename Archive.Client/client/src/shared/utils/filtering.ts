export function matchesFilter(value: string | number | null | undefined, query: string) {
  const normalizedQuery = normalizeFilterValue(query.trim())
  if (!normalizedQuery) {
    return true
  }

  return normalizeFilterValue(value).includes(normalizedQuery)
}

function normalizeFilterValue(value: string | number | null | undefined) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}
