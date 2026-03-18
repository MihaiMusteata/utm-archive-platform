import { Icon } from '@iconify/react'
import type { Dispatch, SetStateAction } from 'react'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { TextArea } from '../../../shared/ui/TextArea'
import type { DocumentRecord, NomenclatureBootstrap, StudentDetail } from '../../../shared/types/models'
import { getFieldError, type FieldErrors } from '../../../shared/utils/form-errors'
import { formatDateTime, formatFileSize } from '../../../shared/utils/format'
import { EmptyState, Field, SectionHeading } from './StudentDetailsUi'

type Props = {
  bootstrap: NomenclatureBootstrap | null
  detail: StudentDetail
  errors?: FieldErrors
  uploadForm: {
    title: string
    description: string
    documentTypeId: string
    documentCategoryId: string
    archiveLocationId: string
    file: File | null
  }
  setUploadForm: Dispatch<
    SetStateAction<{
      title: string
      description: string
      documentTypeId: string
      documentCategoryId: string
      archiveLocationId: string
      file: File | null
    }>
  >
  downloadDocument: (document: DocumentRecord) => void | Promise<void>
  onUploadFieldChange?: (...keys: string[]) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function StudentDocumentsTab({
  bootstrap,
  detail,
  errors = {},
  uploadForm,
  setUploadForm,
  downloadDocument,
  onUploadFieldChange,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading icon="material-symbols:upload-file-rounded" kicker="Arhivă" title="Încarcă" />
        <form className="mt-6 grid gap-4 2xl:grid-cols-3" onSubmit={onSubmit}>
          <Field error={getFieldError(errors, 'title')} label="Titlu">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'title'))}
              onChange={(event) => {
                onUploadFieldChange?.('title')
                setUploadForm((current) => ({ ...current, title: event.target.value }))
              }}
              value={uploadForm.title}
            />
          </Field>
          <Field className="2xl:col-span-2" label="Descriere">
            <TextArea onChange={(event) => setUploadForm((current) => ({ ...current, description: event.target.value }))} value={uploadForm.description} />
          </Field>
          <Field error={getFieldError(errors, 'documentTypeId')} label="Tip document">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'documentTypeId'))}
              onChange={(event) => {
                onUploadFieldChange?.('documentTypeId', 'documentCategoryId')
                const selectedType = bootstrap?.catalogs.documentTypes.find((item) => item.id === event.target.value)
                setUploadForm((current) => ({
                  ...current,
                  documentTypeId: event.target.value,
                  documentCategoryId: selectedType?.relationIds.documentCategoryId ?? current.documentCategoryId,
                }))
              }}
              value={uploadForm.documentTypeId}
            >
              {(bootstrap?.catalogs.documentTypes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={getFieldError(errors, 'documentCategoryId')} label="Categorie">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'documentCategoryId'))}
              onChange={(event) => {
                onUploadFieldChange?.('documentCategoryId')
                setUploadForm((current) => ({ ...current, documentCategoryId: event.target.value }))
              }}
              value={uploadForm.documentCategoryId}
            >
              {(bootstrap?.catalogs.documentCategories ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Locație arhivă">
            <Select onChange={(event) => setUploadForm((current) => ({ ...current, archiveLocationId: event.target.value }))} value={uploadForm.archiveLocationId}>
              {(bootstrap?.catalogs.archiveLocations ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="2xl:col-span-2" error={getFieldError(errors, 'file')} label="Fișier">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'file'))}
              onChange={(event) => {
                onUploadFieldChange?.('file')
                setUploadForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
              }}
              type="file"
            />
          </Field>
          <div className="flex items-end justify-end 2xl:col-span-3">
            <Button className="w-full sm:w-auto" size="lg" type="submit">
              <Icon icon="material-symbols:upload-rounded" width={18} />
              Încarcă document
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionHeading icon="material-symbols:folder-open-rounded" kicker="Arhivă" title="Documente" />
          <Badge>{detail.documents.length}</Badge>
        </div>

        {detail.documents.length === 0 ? (
          <EmptyState message="Nu au fost încărcate documente pentru acest student." />
        ) : (
          <div className="grid gap-4 2xl:grid-cols-2">
            {detail.documents.map((document) => (
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-950/70" key={document.id}>
                <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{document.title}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {document.documentType} · {formatFileSize(document.size)} · {document.fileName}
                      </p>
                    </div>
                    {document.description ? <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{document.description}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      <Badge>{document.documentCategory}</Badge>
                      <Badge>{document.archiveLocation || 'Locație nedefinită'}</Badge>
                      <Badge>{formatDateTime(document.createdAt)}</Badge>
                    </div>
                  </div>

                  <Button className="w-full sm:w-auto" onClick={() => downloadDocument(document)} variant="secondary">
                    <Icon icon="material-symbols:download-rounded" width={18} />
                    Descarcă
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
