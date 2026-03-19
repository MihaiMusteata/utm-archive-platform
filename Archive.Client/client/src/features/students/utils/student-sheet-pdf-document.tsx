import type { ReactNode } from 'react'
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import arialBold from '../../../assets/fonts/Arial-Bold.ttf'
import arialRegular from '../../../assets/fonts/Arial.ttf'
import type { StudentDetail } from '../../../shared/types/models'

const fontFamily = 'ArchivePdfArial'
const dateFormatter = new Intl.DateTimeFormat('ro-MD', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ro-MD', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

Font.register({
  family: fontFamily,
  fonts: [
    { src: arialRegular, fontWeight: 400 },
    { src: arialBold, fontWeight: 700 },
  ],
})

Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 42,
    paddingHorizontal: 30,
    fontFamily,
    fontSize: 10,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#dbe2ea',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerCopy: {
    width: '62%',
    paddingRight: 16,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: 700,
    color: '#0f766e',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 1.45,
    color: '#475569',
  },
  summaryCard: {
    width: '38%',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  summaryLabel: {
    marginTop: 8,
    fontSize: 8,
    fontWeight: 700,
    color: '#475569',
  },
  summaryValue: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: 700,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: 700,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItemHalf: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  gridItemThird: {
    width: '33.333%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 11,
    minHeight: 58,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#475569',
  },
  infoValue: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 1.45,
  },
  table: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe2ea',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontWeight: 700,
    color: '#475569',
  },
  tableCellText: {
    fontSize: 9,
    lineHeight: 1.35,
  },
  emptyState: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#475569',
  },
  notesList: {
    marginTop: 2,
  },
  noteCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteHeaderCopy: {
    width: '67%',
    paddingRight: 10,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  noteMeta: {
    marginTop: 4,
    fontSize: 8.5,
    lineHeight: 1.35,
    color: '#475569',
  },
  noteMetaRight: {
    width: '33%',
    fontSize: 8.5,
    lineHeight: 1.35,
    color: '#475569',
    textAlign: 'right',
  },
  noteContent: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.45,
  },
  footer: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 16,
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
})

type StudentSheetPdfDocumentProps = {
  detail: StudentDetail
  generatedAt: Date
}

type InfoItem = {
  label: string
  value?: string | null
}

export function StudentSheetPdfDocument({ detail, generatedAt }: StudentSheetPdfDocumentProps) {
  return (
    <Document
      author="Arhiva UTM"
      creationDate={generatedAt}
      creator="Platforma de gestiune a arhivei UTM"
      keywords="student, arhiva, utm, export pdf"
      language="ro-MD"
      subject={`Fișa studentului ${detail.fullName}`}
      title={`Fișa studentului ${detail.fullName}`}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>UNIVERSITATEA TEHNICĂ A MOLDOVEI</Text>
              <Text style={styles.title}>Fișa studentului</Text>
              <Text style={styles.subtitle}>
                Document intern generat din platforma arhivei. Include date personale, academice și contextul administrativ al
                studentului pentru descărcare locală în format PDF.
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Nr. înregistrare</Text>
              <Text style={styles.summaryValue}>{safeValue(detail.registrationNumber)}</Text>
              <Text style={styles.summaryLabel}>Statut</Text>
              <Text style={styles.summaryValue}>{safeValue(detail.status)}</Text>
              <Text style={styles.summaryLabel}>Generat la</Text>
              <Text style={styles.summaryValue}>{formatDateTime(generatedAt)}</Text>
            </View>
          </View>
        </View>

        <Section title="Date personale">
          <InfoGrid
            columns={3}
            items={[
              { label: 'Nume complet', value: detail.fullName },
              { label: 'IDNP', value: detail.nationalId },
              { label: 'Gen', value: detail.gender },
              { label: 'Data nașterii', value: formatDate(detail.dateOfBirth) },
              { label: 'Data înmatriculării', value: formatDate(detail.enrollmentDate) },
              { label: 'Data absolvirii', value: formatDate(detail.graduationDate) },
            ]}
          />
        </Section>

        <Section title="Contact și adresă">
          <InfoGrid
            columns={2}
            items={[
              { label: 'Email', value: detail.contact.email },
              { label: 'Telefon', value: detail.contact.phone },
              { label: 'Persoană de contact', value: detail.contact.emergencyContactName },
              { label: 'Telefon contact de urgență', value: detail.contact.emergencyContactPhone },
              { label: 'Tip adresă', value: detail.address.addressType },
              { label: 'Adresă', value: formatAddress(detail) },
            ]}
          />
        </Section>

        <Section title="Date academice">
          <InfoGrid
            columns={3}
            items={[
              { label: 'Număr student', value: detail.academicInfo.studentNumber },
              { label: 'Facultate', value: detail.academicInfo.faculty },
              { label: 'Departament', value: detail.academicInfo.department },
              { label: 'Program de studii', value: detail.academicInfo.studyProgram },
              { label: 'Ciclu de studii', value: detail.academicInfo.studyCycle },
              { label: 'Frecvență', value: detail.academicInfo.studyFrequency },
              { label: 'Tip finanțare', value: detail.academicInfo.fundingType },
              { label: 'An universitar', value: detail.academicInfo.academicYear },
              { label: 'An de studiu', value: detail.academicInfo.studyYear },
              { label: 'Grupă', value: detail.academicInfo.group },
            ]}
          />
        </Section>

        <Section title="Documente arhivate">
          <PdfTable
            columns={[
              { key: 'title', label: 'Titlu', width: '24%' },
              { key: 'type', label: 'Tip', width: '14%' },
              { key: 'category', label: 'Categorie', width: '16%' },
              { key: 'file', label: 'Fișier', width: '18%' },
              { key: 'location', label: 'Locație', width: '14%' },
              { key: 'createdAt', label: 'Înregistrat la', width: '14%' },
            ]}
            emptyMessage="Nu există documente arhivate pentru acest student."
            rows={detail.documents.map((document) => ({
              id: document.id,
              title: document.title,
              type: document.documentType,
              category: document.documentCategory,
              file: document.fileName,
              location: document.archiveLocation,
              createdAt: formatDateTime(document.createdAt),
            }))}
          />
        </Section>

        <Section title="Istoric statut">
          <PdfTable
            columns={[
              { key: 'previousStatus', label: 'Statut anterior', width: '22%' },
              { key: 'newStatus', label: 'Statut nou', width: '22%' },
              { key: 'reason', label: 'Motiv', width: '34%' },
              { key: 'changedAt', label: 'Modificat la', width: '22%' },
            ]}
            emptyMessage="Nu există înregistrări în istoricul de statut."
            rows={detail.history.map((entry) => ({
              id: entry.id,
              previousStatus: entry.previousStatus,
              newStatus: entry.newStatus,
              reason: entry.reason,
              changedAt: formatDateTime(entry.changedAt),
            }))}
          />
        </Section>

        <Section title="Note interne">
          {detail.notes.length === 0 ? (
            <EmptyState message="Nu există note interne pentru acest student." />
          ) : (
            <View style={styles.notesList}>
              {detail.notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteHeaderCopy}>
                      <Text style={styles.noteTitle}>{safeValue(note.title)}</Text>
                      <Text style={styles.noteMeta}>Creat la {formatDateTime(note.createdAt)}</Text>
                    </View>
                    <Text style={styles.noteMetaRight}>{note.createdByName ? `Autor: ${note.createdByName}` : 'Autor necunoscut'}</Text>
                  </View>
                  <Text style={styles.noteContent}>{safeValue(note.content)}</Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Text
          fixed
          render={({ pageNumber, totalPages }) =>
            `Sistem intern de administrare a arhivei UTM • Generat la ${formatDateTime(generatedAt)} • Pagina ${pageNumber}/${totalPages}`
          }
          style={styles.footer}
        />
      </Page>
    </Document>
  )
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function InfoGrid({ columns, items }: { columns: 2 | 3; items: InfoItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={`${item.label}-${item.value ?? 'empty'}`} style={columns === 2 ? styles.gridItemHalf : styles.gridItemThird}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{safeValue(item.value)}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

type PdfTableColumn = {
  key: string
  label: string
  width: string
}

type PdfTableRow = {
  id: string
  [key: string]: string | null | undefined
}

function PdfTable({
  columns,
  emptyMessage,
  rows,
}: {
  columns: PdfTableColumn[]
  emptyMessage: string
  rows: PdfTableRow[]
}) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {columns.map((column) => (
          <View key={column.key} style={[styles.tableCell, { width: column.width }]}>
            <Text style={styles.tableHeaderText}>{column.label}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, index) => (
        <View key={row.id} style={index === rows.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}>
          {columns.map((column) => (
            <View key={column.key} style={[styles.tableCell, { width: column.width }]}>
              <Text style={styles.tableCellText}>{safeValue(row[column.key])}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.table}>
      <Text style={styles.emptyState}>{message}</Text>
    </View>
  )
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateFormatter.format(date)
}

function formatDateTime(value?: Date | string | null) {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateTimeFormatter.format(date)
}

function formatAddress(detail: StudentDetail) {
  const parts = [detail.address.street, detail.address.city, detail.address.country, detail.address.postalCode].filter(
    (value): value is string => Boolean(value),
  )

  return parts.length > 0 ? parts.join(', ') : '—'
}

function safeValue(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : '—'
}
