import { useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from '../../../core/api/client'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Table } from '../../../shared/ui/Table'
import { TableFilterInput } from '../../../shared/ui/TableFilterInput'
import { TableFilterSelect } from '../../../shared/ui/TableFilterSelect'
import { TableSearchHeader } from '../../../shared/ui/TableSearchHeader'
import type { AuditLog, PagedResponse } from '../../../shared/types/models'
import { matchesFilter } from '../../../shared/utils/filtering'
import { localizeAuditAction, localizeAuditEntity } from '../../../shared/utils/localization'
import { formatDateTime } from '../../../shared/utils/format'

const defaultAuditFilters = {
  action: '',
  entity: '',
  actor: '',
  route: '',
  createdAt: '',
}

export function AuditPage() {
  const [filters, setFilters] = useState(defaultAuditFilters)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get<PagedResponse<AuditLog>>('/audit?page=1&pageSize=100')
        setLogs(response.data.items)
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      }
    }

    void fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const entityValue = `${localizeAuditEntity(log.entityName)}${log.entityId ? ` · ${log.entityId}` : ''}`

    return (
      matchesFilter(localizeAuditAction(log.action), filters.action) &&
      matchesFilter(entityValue, filters.entity) &&
      matchesFilter(log.username ?? 'Sistem', filters.actor) &&
      matchesFilter(log.route ?? 'N/D', filters.route) &&
      matchesFilter(formatDateTime(log.createdAt), filters.createdAt)
    )
  })

  const actionOptions = Array.from(new Set(logs.map((log) => localizeAuditAction(log.action)))).sort((left, right) => left.localeCompare(right))
  const entityOptions = Array.from(new Set(logs.map((log) => localizeAuditEntity(log.entityName)))).sort((left, right) => left.localeCompare(right))

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold tracking-tight">Audit</h3>

      {error ? (
        <Card>
          <p className="text-sm text-gray-700 dark:text-gray-300">{error}</p>
        </Card>
      ) : null}

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-800">
          <h4 className="text-lg font-semibold">Listă</h4>
          <Badge>{filteredLogs.length}</Badge>
        </div>
        <TableSearchHeader
          actions={
            <Button onClick={() => setFilters(defaultAuditFilters)} size="sm" variant="ghost">
              Resetează
            </Button>
          }
          minColumnWidth={140}
        >
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))} value={filters.action}>
            <option value="">Toate acțiunile</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterSelect onChange={(event) => setFilters((current) => ({ ...current, entity: event.target.value }))} value={filters.entity}>
            <option value="">Toate entitățile</option>
            {entityOptions.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </TableFilterSelect>
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, actor: event.target.value }))} placeholder="Actor" value={filters.actor} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, route: event.target.value }))} placeholder="Rută" value={filters.route} />
          <TableFilterInput onChange={(event) => setFilters((current) => ({ ...current, createdAt: event.target.value }))} placeholder="Dată" value={filters.createdAt} />
        </TableSearchHeader>
        <Table
          columns={[
            { header: 'Acțiune', render: (log) => localizeAuditAction(log.action) },
            { header: 'Entitate', render: (log) => `${localizeAuditEntity(log.entityName)}${log.entityId ? ` · ${log.entityId}` : ''}` },
            { header: 'Actor', render: (log) => log.username ?? 'Sistem' },
            { header: 'Rută', render: (log) => log.route ?? 'N/D' },
            { header: 'La', render: (log) => formatDateTime(log.createdAt) },
          ]}
          data={filteredLogs}
          emptyMessage="Nu au fost găsite înregistrări de audit."
        />
      </Card>
    </div>
  )
}
