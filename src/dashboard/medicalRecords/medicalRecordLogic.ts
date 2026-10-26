import {
  DEFAULT_MEDICAL_RECORD_ID,
  RECORD_CATEGORIES,
  type MedicalRecord,
  type MedicalRecordStatus,
  type MedicalRecordType,
  type RecordCategoryKey,
} from './medicalRecordData.ts'

export const ALL_TYPES = 'All'
export const ALL_MONTHS = 'All'
export const ALL_STATUSES = 'All'

export type RecordFilters = {
  readonly category: RecordCategoryKey
  readonly query: string
  readonly type: MedicalRecordType | typeof ALL_TYPES
  readonly month: string
  readonly status: MedicalRecordStatus | typeof ALL_STATUSES
}

export const DEFAULT_RECORD_FILTERS: RecordFilters = {
  category: 'all',
  query: '',
  type: ALL_TYPES,
  month: ALL_MONTHS,
  status: ALL_STATUSES,
}

export type RecordGroup = {
  readonly month: string
  readonly records: readonly MedicalRecord[]
}

export function categoryType(key: RecordCategoryKey): MedicalRecordType | null {
  return RECORD_CATEGORIES.find((category) => category.key === key)?.type ?? null
}

/** Case-insensitive match across every supplied searchable field. */
export function recordMatches(record: MedicalRecord, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    record.title.toLowerCase().includes(needle) ||
    record.type.toLowerCase().includes(needle) ||
    record.clinician.toLowerCase().includes(needle) ||
    (record.examination?.toLowerCase().includes(needle) ?? false) ||
    (record.reason?.toLowerCase().includes(needle) ?? false)
  )
}

/** Intersection of the active category, search, type, month, and status filters. */
export function filterRecords(
  records: readonly MedicalRecord[],
  filters: RecordFilters,
): MedicalRecord[] {
  const activeType = categoryType(filters.category)
  return records.filter(
    (record) =>
      (filters.type === ALL_TYPES || record.type === filters.type) &&
      (activeType === null || record.type === activeType) &&
      (filters.month === ALL_MONTHS || record.month === filters.month) &&
      (filters.status === ALL_STATUSES || record.status === filters.status) &&
      recordMatches(record, filters.query),
  )
}

export function isDefaultRecordFilters(filters: RecordFilters): boolean {
  return (
    filters.category === DEFAULT_RECORD_FILTERS.category &&
    filters.query === DEFAULT_RECORD_FILTERS.query &&
    filters.type === DEFAULT_RECORD_FILTERS.type &&
    filters.month === DEFAULT_RECORD_FILTERS.month &&
    filters.status === DEFAULT_RECORD_FILTERS.status
  )
}

/** Groups in first-seen fixture order so May precedes April without date parsing. */
export function groupRecords(records: readonly MedicalRecord[]): RecordGroup[] {
  const groups: RecordGroup[] = []
  for (const record of records) {
    const group = groups.find((entry) => entry.month === record.month)
    if (group) (group.records as MedicalRecord[]).push(record)
    else groups.push({ month: record.month, records: [record] })
  }
  return groups
}

/** Filter choices come from the fixtures so no empty option is offered. */
export function recordTypes(records: readonly MedicalRecord[]): MedicalRecordType[] {
  return [...new Set(records.map((record) => record.type))]
}

export function recordMonths(records: readonly MedicalRecord[]): string[] {
  return [...new Set(records.map((record) => record.month))]
}

export function recordStatuses(records: readonly MedicalRecord[]): MedicalRecordStatus[] {
  return [...new Set(records.map((record) => record.status))]
}

export function findRecord(records: readonly MedicalRecord[], id: string): MedicalRecord | undefined {
  return records.find((record) => record.id === id)
}

/**
 * Initial selection for a direct link. An unknown query falls back to the reference
 * selection and reports the unmatched value instead of breaking the page.
 */
export function resolveRecordSelection(
  records: readonly MedicalRecord[],
  requested: string | null,
): { selectedId: string | null; unknown: string | null } {
  if (!requested) return { selectedId: DEFAULT_MEDICAL_RECORD_ID, unknown: null }
  const found = findRecord(records, requested)
  return found ? { selectedId: found.id, unknown: null } : { selectedId: DEFAULT_MEDICAL_RECORD_ID, unknown: requested }
}
