export function formatDate(value?: string | null) {
  if (!value) {
    return 'N/D'
  }

  return new Date(value).toLocaleDateString()
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'N/D'
  }

  return new Date(value).toLocaleString()
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function toInputDate(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}
