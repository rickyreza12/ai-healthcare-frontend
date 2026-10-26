import {
  MEDICATIONS,
  type Medication,
  type MedicationStatus,
  type MedicationTabKey,
} from './pharmacyData.ts'

export const ALL_CATEGORIES = 'All Categories'
export const ALL_STATUSES = 'All Status'

export type MedicationFilters = {
  readonly tab: MedicationTabKey
  readonly query: string
  readonly category: string
  readonly status: MedicationStatus | typeof ALL_STATUSES
}

export const DEFAULT_MEDICATION_FILTERS: MedicationFilters = {
  tab: 'all',
  query: '',
  category: ALL_CATEGORIES,
  status: ALL_STATUSES,
}

/** Case-insensitive match across the supplied searchable fields. */
export function medicationMatches(medication: Medication, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    medication.name.toLowerCase().includes(needle) ||
    medication.genericName.toLowerCase().includes(needle) ||
    medication.category.toLowerCase().includes(needle)
  )
}

/** Intersection of the active tab, search, category, and status filters. */
export function filterMedications(
  filters: MedicationFilters,
  medications: readonly Medication[] = MEDICATIONS,
): Medication[] {
  return medications.filter((medication) => {
    if (filters.tab === 'prescription' && medication.prescription !== 'Required') return false
    if (filters.tab === 'otc' && medication.prescription !== 'Not required') return false
    if (filters.tab === 'supplements' || filters.tab === 'supplies') return false
    if (filters.category !== ALL_CATEGORIES && medication.category !== filters.category) return false
    if (filters.status !== ALL_STATUSES && medication.status !== filters.status) return false
    return medicationMatches(medication, filters.query)
  })
}

export function isDefaultMedicationFilters(filters: MedicationFilters): boolean {
  return (
    filters.tab === DEFAULT_MEDICATION_FILTERS.tab &&
    filters.query === DEFAULT_MEDICATION_FILTERS.query &&
    filters.category === DEFAULT_MEDICATION_FILTERS.category &&
    filters.status === DEFAULT_MEDICATION_FILTERS.status
  )
}

/** True when a category tab can never match because no rows were supplied for it. */
export function tabHasNoSuppliedRows(tab: MedicationTabKey): boolean {
  return tab === 'supplements' || tab === 'supplies'
}

export function findMedication(id: string): Medication | undefined {
  return MEDICATIONS.find((medication) => medication.id === id)
}

/** Pure pagination math; never less than one page so page buttons always exist. */
export function totalPages(rowCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(rowCount / pageSize))
}

export function clampPage(page: number, pages: number): number {
  return Math.min(Math.max(1, page), pages)
}

export function visibleRows<T>(rows: readonly T[], page: number, pageSize: number): T[] {
  return rows.slice((page - 1) * pageSize, page * pageSize)
}

export function showingRangeText(rowCount: number, page: number, pageSize: number): string {
  if (rowCount === 0) return 'Showing 0 of 0 medications'
  const start = (page - 1) * pageSize + 1
  const end = Math.min(rowCount, page * pageSize)
  return `Showing ${start}–${end} of ${rowCount} medications`
}
