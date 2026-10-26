import { REFERENCE_PATIENT_SCHEDULE_IDS, SCHEDULE_DAYS, SCHEDULE_APPOINTMENTS, type ScheduleAppointment } from '../appointments/appointmentScheduleData.ts'
import { MEDICAL_RECORDS, RECORD_CATEGORIES, type MedicalRecord, type RecordCategoryKey } from '../medicalRecords/medicalRecordData.ts'
import {
  DETAIL_TABS,
  REFERENCE_DETAIL_ID,
  REFERENCE_OVERVIEW,
  SUMMARY_SECTIONS,
  type Claim,
  type DataDomain,
  type DataDomainStatus,
  type DetailTabKey,
  type EvidenceRecord,
  type HistoryEntry,
  type SourceId,
  type SummarySectionKey,
} from './patientDetailData.ts'
import { PATIENT_LAB_REPORTS, type PatientLabReport } from './patientLabResultData.ts'

export const DEFAULT_DETAIL_TAB: DetailTabKey = 'overview'
export const DEFAULT_SUMMARY_SECTION: SummarySectionKey = 'summary'

/** Unknown or missing tab values fall back to Overview without an error. */
export function parseDetailTab(value: string | null | undefined): DetailTabKey {
  const match = DETAIL_TABS.find((tab) => tab.key === value)
  return match ? match.key : DEFAULT_DETAIL_TAB
}

/** Unknown or missing section values fall back to Summary without an error. */
export function parseSummarySection(value: string | null | undefined): SummarySectionKey {
  const match = SUMMARY_SECTIONS.find((section) => section.key === value)
  return match ? match.key : DEFAULT_SUMMARY_SECTION
}

export function detailHref(patientId: string, tab: DetailTabKey): string {
  const base = `/dashboard/patients/${encodeURIComponent(patientId)}`
  return tab === DEFAULT_DETAIL_TAB ? base : `${base}?tab=${tab}`
}

export function sectionHref(patientId: string, section: SummarySectionKey): string {
  const base = `/dashboard/patients/${encodeURIComponent(patientId)}?tab=ai-summary`
  return section === DEFAULT_SUMMARY_SECTION ? base : `${base}&section=${section}`
}

/** Written status text for each domain state; the legend never carries meaning alone. */
export function domainStatusLabel(status: DataDomainStatus): string {
  switch (status) {
    case 'available':
      return 'Available'
    case 'partial':
      return 'Partial'
    case 'not-integrated':
      return 'Not Yet Integrated'
    case 'not-available':
      return 'Not Available'
  }
}

export type DomainTone = 'ok' | 'warn' | 'no'

export function domainStatusTone(status: DataDomainStatus): DomainTone {
  if (status === 'available') return 'ok'
  if (status === 'partial') return 'warn'
  return 'no'
}

export function domainCounts(domains: readonly DataDomain[]): Record<DataDomainStatus, number> {
  return {
    available: domains.filter((domain) => domain.status === 'available').length,
    partial: domains.filter((domain) => domain.status === 'partial').length,
    'not-integrated': domains.filter((domain) => domain.status === 'not-integrated').length,
    'not-available': domains.filter((domain) => domain.status === 'not-available').length,
  }
}

/** Plain availability footer split, written text first so colour is never load bearing. */
export function availabilitySplit(domains: readonly { label: string; available: boolean }[]): {
  available: string[]
  unavailable: string[]
} {
  return {
    available: domains.filter((domain) => domain.available).map((domain) => domain.label),
    unavailable: domains.filter((domain) => !domain.available).map((domain) => domain.label),
  }
}

export const ALL_SOURCES = 'all'

/** A claim is kept when the selected source supports it. */
export function filterClaims(
  claims: readonly Claim[],
  source: SourceId | typeof ALL_SOURCES,
): readonly Claim[] {
  if (source === ALL_SOURCES) return claims
  return claims.filter((claim) => claim.sources.includes(source))
}

/**
 * Filtering can hide the active claim, so the caller keeps the list non-empty by falling
 * back to the first visible claim.
 */
export function resolveActiveClaim(
  claims: readonly Claim[],
  activeId: string | null | undefined,
): Claim | undefined {
  const visible = claims.find((claim) => claim.id === activeId)
  return visible ?? claims[0]
}

export function evidenceForClaim(
  claim: Claim | undefined,
  records: readonly EvidenceRecord[],
): readonly EvidenceRecord[] {
  if (!claim) return []
  return records.filter((record) => claim.sources.includes(record.source))
}

/**
 * The supplied reference cites every source on every claim, so narrowing the claim list alone
 * would never change the screen. The filter also narrows the evidence records shown.
 */
export function filterEvidenceBySource(
  records: readonly EvidenceRecord[],
  source: SourceId | typeof ALL_SOURCES,
): readonly EvidenceRecord[] {
  return source === ALL_SOURCES ? records : records.filter((record) => record.source === source)
}

/** The reviewed state is local only; the label says so instead of implying persistence. */
export function reviewedLabel(reviewed: boolean): string {
  return reviewed ? 'Reviewed in this session' : 'Mark Reviewed'
}

export type PatientRecordGroup = {
  readonly month: string
  readonly records: readonly MedicalRecord[]
}

/** The supplied extended clinical fixtures belong to the reference patient only. */
export function medicalRecordsForPatient(patientId: string): readonly MedicalRecord[] {
  return patientId === REFERENCE_DETAIL_ID ? MEDICAL_RECORDS : []
}

/** Category keys map to supplied record types; `all` keeps every record. */
export function filterPatientRecords(
  records: readonly MedicalRecord[],
  category: RecordCategoryKey,
): readonly MedicalRecord[] {
  const type = RECORD_CATEGORIES.find((entry) => entry.key === category)?.type ?? null
  return type ? records.filter((record) => record.type === type) : records
}

/** Groups consecutive records by their supplied month, keeping newest-first order. */
export function groupPatientRecords(records: readonly MedicalRecord[]): readonly PatientRecordGroup[] {
  const groups: { month: string; records: MedicalRecord[] }[] = []
  for (const record of records) {
    const last = groups[groups.length - 1]
    if (last && last.month === record.month) last.records.push(record)
    else groups.push({ month: record.month, records: [record] })
  }
  return groups
}

export function patientAppointments(patientId: string): readonly ScheduleAppointment[] {
  if (patientId !== REFERENCE_DETAIL_ID) return []
  return SCHEDULE_APPOINTMENTS.filter((appointment) => REFERENCE_PATIENT_SCHEDULE_IDS.includes(appointment.id))
}

export function patientVisitHistory(patientId: string): readonly HistoryEntry[] {
  return patientId === REFERENCE_DETAIL_ID ? REFERENCE_OVERVIEW.history : []
}

/** Supplied weekday copy, kept as-is instead of being recalculated. */
export function appointmentDayLabel(appointment: ScheduleAppointment): string {
  const day = SCHEDULE_DAYS.find((entry) => entry.key === appointment.day)
  return day ? `${day.short} ${day.date} ${day.month}` : appointment.day
}

export function patientLabReports(patientId: string): readonly PatientLabReport[] {
  return PATIENT_LAB_REPORTS.filter((report) => report.patientId === patientId)
}
