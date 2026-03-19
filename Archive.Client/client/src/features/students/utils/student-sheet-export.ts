import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { StudentDetail } from '../../../shared/types/models'

export async function downloadStudentSheetPdf(detail: StudentDetail) {
  const [{ pdf }, { StudentSheetPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./student-sheet-pdf-document'),
  ])

  const generatedAt = new Date()
  const fileName = `fisa-student-${slugify(detail.registrationNumber)}-${slugify(detail.fullName)}.pdf`
  const document = createElement(StudentSheetPdfDocument, { detail, generatedAt }) as ReactElement<DocumentProps>
  const blob = await pdf(document).toBlob()

  triggerFileDownload(blob, fileName)
}

function triggerFileDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'

  window.document.body.append(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
