import { useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Card } from '../../../shared/ui/Card'
import { Spinner } from '../../../shared/ui/Spinner'
import type { DashboardSummary } from '../../../shared/types/models'
import { localizeAuditAction, localizeAuditEntity } from '../../../shared/utils/localization'
import { formatDateTime, formatFileSize } from '../../../shared/utils/format'

const statCards = [
  { key: 'studentsCount', label: 'Studenți' },
  { key: 'activeStudentsCount', label: 'Studenți activi' },
  { key: 'documentsCount', label: 'Documente' },
  { key: 'usersCount', label: 'Utilizatori' },
] as const

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get<DashboardSummary>('/dashboard/summary')
        setSummary(response.data)
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      }
    }

    void fetchSummary()
  }, [])

  if (error) {
    return (
      <Card>
        <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
      </Card>
    )
  }

  if (!summary) {
    return <Spinner />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card className="px-4 py-3 sm:px-5 sm:py-4" key={card.key}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:text-xs">
              {card.label}
            </p>
            <p className="mt-1.5 text-[1.7rem] font-semibold leading-none tracking-tight sm:mt-2 sm:text-[2rem]">
              {summary[card.key]}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold tracking-tight">Documente recente</h3>

        <div className="mt-4 space-y-3">
          {summary.recentDocuments.length === 0 ? (
            <EmptyState message="Nu există activitate recentă pentru documente." />
          ) : (
            summary.recentDocuments.map((document) => (
              <div className="rounded-xl border border-gray-200 p-3 sm:p-4 dark:border-gray-800" key={document.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">{document.title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {document.studentName} · {document.documentType}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(document.size)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold tracking-tight">Audit</h3>

        <div className="mt-4 space-y-3">
          {summary.recentAuditLogs.length === 0 ? (
            <EmptyState message="Nu există înregistrări de audit recente." />
          ) : (
            summary.recentAuditLogs.map((log) => (
              <div className="rounded-xl border border-gray-200 p-3 sm:p-4 dark:border-gray-800" key={log.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">
                      {localizeAuditAction(log.action)} · {localizeAuditEntity(log.entityName)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {log.username ?? 'Sistem'} · {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{log.method ?? 'N/D'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      {message}
    </div>
  )
}
