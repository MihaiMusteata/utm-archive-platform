import { Icon } from '@iconify/react'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { TextArea } from '../../../shared/ui/TextArea'
import type { StudentDetail } from '../../../shared/types/models'
import { getFieldError, type FieldErrors } from '../../../shared/utils/form-errors'
import { formatDateTime } from '../../../shared/utils/format'
import { EmptyState, Field, SectionHeading } from './StudentDetailsUi'

type Props = {
  detail: StudentDetail
  errors?: FieldErrors
  noteTitle: string
  onNoteFieldChange?: (...keys: string[]) => void
  setNoteTitle: React.Dispatch<React.SetStateAction<string>>
  noteContent: string
  setNoteContent: React.Dispatch<React.SetStateAction<string>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function StudentNotesTab({
  detail,
  errors = {},
  noteTitle,
  onNoteFieldChange,
  setNoteTitle,
  noteContent,
  setNoteContent,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading icon="material-symbols:edit-note-rounded" kicker="Note" title="Adaugă" />
        <form className="mt-6 grid gap-4 xl:grid-cols-2" onSubmit={onSubmit}>
          <Field error={getFieldError(errors, 'title')} label="Titlu">
            <Input
              aria-invalid={Boolean(getFieldError(errors, 'title'))}
              onChange={(event) => {
                onNoteFieldChange?.('title')
                setNoteTitle(event.target.value)
              }}
              value={noteTitle}
            />
          </Field>
          <Field className="xl:col-span-2" error={getFieldError(errors, 'content')} label="Conținut">
            <TextArea
              aria-invalid={Boolean(getFieldError(errors, 'content'))}
              onChange={(event) => {
                onNoteFieldChange?.('content')
                setNoteContent(event.target.value)
              }}
              value={noteContent}
            />
          </Field>
          <div className="flex items-end justify-end xl:col-span-2">
            <Button className="w-full sm:w-auto" size="lg" type="submit">
              <Icon icon="material-symbols:note-add-rounded" width={18} />
              Adaugă notă
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionHeading icon="material-symbols:sticky-note-2-rounded" kicker="Note" title="Lista" />
          <Badge>{detail.notes.length}</Badge>
        </div>

        {detail.notes.length === 0 ? (
          <EmptyState message="Nu au fost adăugate note pentru acest student." />
        ) : (
          <div className="space-y-4">
            {detail.notes.map((note) => (
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-950/70" key={note.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{note.title}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{note.content}</p>
                  </div>
                  <Badge>{formatDateTime(note.createdAt)}</Badge>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {note.createdByName ?? 'Sistem'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
