import { Icon } from '@iconify/react'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Select } from '../../../shared/ui/Select'
import { TextArea } from '../../../shared/ui/TextArea'
import type { NomenclatureBootstrap, StudentDetail } from '../../../shared/types/models'
import { getFieldError, type FieldErrors } from '../../../shared/utils/form-errors'
import { formatDateTime } from '../../../shared/utils/format'
import { EmptyState, Field, SectionHeading } from './StudentDetailsUi'

type Props = {
  bootstrap: NomenclatureBootstrap | null
  detail: StudentDetail
  errors?: FieldErrors
  statusId: string
  onStatusFieldChange?: (...keys: string[]) => void
  setStatusId: React.Dispatch<React.SetStateAction<string>>
  statusReason: string
  setStatusReason: React.Dispatch<React.SetStateAction<string>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function StudentHistoryTab({
  bootstrap,
  detail,
  errors = {},
  statusId,
  onStatusFieldChange,
  setStatusId,
  statusReason,
  setStatusReason,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading icon="material-symbols:sync-alt-rounded" kicker="Statut" title="Actualizare" />
        <form className="mt-6 grid gap-4 xl:grid-cols-2" onSubmit={onSubmit}>
          <Field error={getFieldError(errors, 'statusId', 'studentStatusId')} label="Statut nou">
            <Select
              aria-invalid={Boolean(getFieldError(errors, 'statusId', 'studentStatusId'))}
              onChange={(event) => {
                onStatusFieldChange?.('statusId', 'studentStatusId')
                setStatusId(event.target.value)
              }}
              value={statusId}
            >
              {(bootstrap?.catalogs.studentStatuses ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="xl:col-span-2" error={getFieldError(errors, 'reason')} label="Motiv">
            <TextArea
              aria-invalid={Boolean(getFieldError(errors, 'reason'))}
              onChange={(event) => {
                onStatusFieldChange?.('reason')
                setStatusReason(event.target.value)
              }}
              value={statusReason}
            />
          </Field>
          <div className="flex items-end justify-end xl:col-span-2">
            <Button className="w-full sm:w-auto" size="lg" type="submit">
              <Icon icon="material-symbols:sync-rounded" width={18} />
              Actualizează statutul
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionHeading icon="material-symbols:timeline-rounded" kicker="Cronologie" title="Istoric" />
          <Badge>{detail.history.length}</Badge>
        </div>

        {detail.history.length === 0 ? (
          <EmptyState message="Nu a fost găsit istoric de statut." />
        ) : (
          <div className="space-y-4">
            {detail.history.map((history) => (
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-950/70" key={history.id}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{history.previousStatus ?? 'N/D'}</Badge>
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">-&gt;</span>
                    <Badge className="border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950">
                      {history.newStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(history.changedAt)}</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {history.reason || 'Nu a fost adăugat un motiv pentru această schimbare.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
