import type { DirectoryPatient, DirectoryStatus, DirectoryTabKey } from './patientDirectoryData.ts'

export type DirectoryFilters = {
  readonly status: DirectoryStatus | 'All'
  readonly department: string
  readonly visitDate: string
}

export const ALL_DEPARTMENTS = 'All'
export const ALL_DATES = 'All'
export const ALL_STATUSES = 'All'

/** Reference copy renders identifiers and ages with a fixed prefix and unit. */
export function patientIdLabel(id: string): string {
  return `ID: ${id}`
}

export function patientAgeLabel(age: number): string {
  return `${age} years`
}

export const DEFAULT_DIRECTORY_FILTERS: DirectoryFilters = {
  status: ALL_STATUSES,
  department: ALL_DEPARTMENTS,
  visitDate: ALL_DATES,
}

export function tabStatus(key: DirectoryTabKey): DirectoryStatus | 'All' {
  return key === 'all' ? ALL_STATUSES : key
}

export function statusTabKey(status: DirectoryStatus | 'All'): DirectoryTabKey {
  return status === ALL_STATUSES ? 'all' : status
}

/** Intersection of the active tab, department, and visit-date filters. */
export function filterDirectoryPatients(
  patients: readonly DirectoryPatient[],
  filters: DirectoryFilters,
): readonly DirectoryPatient[] {
  return patients.filter(
    (patient) =>
      (filters.status === ALL_STATUSES || patient.status === filters.status) &&
      (filters.department === ALL_DEPARTMENTS || patient.unit === filters.department) &&
      (filters.visitDate === ALL_DATES || patient.lastVisit === filters.visitDate),
  )
}

export function isDefaultDirectoryFilters(filters: DirectoryFilters): boolean {
  return (
    filters.status === DEFAULT_DIRECTORY_FILTERS.status &&
    filters.department === DEFAULT_DIRECTORY_FILTERS.department &&
    filters.visitDate === DEFAULT_DIRECTORY_FILTERS.visitDate
  )
}

/** Case-insensitive match on the supplied name or on an exact or partial supplied ID. */
export function searchDirectoryPatients(
  patients: readonly DirectoryPatient[],
  query: string,
): readonly DirectoryPatient[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(needle) || patient.id.toLowerCase().includes(needle),
  )
}

/** Departments and visit dates come from the fixtures so no empty option is offered. */
export function directoryDepartments(patients: readonly DirectoryPatient[]): string[] {
  return [...new Set(patients.map((patient) => patient.unit))].sort((a, b) => a.localeCompare(b))
}

export function directoryVisitDates(patients: readonly DirectoryPatient[]): string[] {
  return [...new Set(patients.map((patient) => patient.lastVisit))]
}

export const DIRECTORY_PAGE_SIZE = 8

export type DirectoryPageItem = { readonly kind: 'page'; readonly page: number } | { readonly kind: 'gap' }

/**
 * Page buttons around the current page: a five-wide window, a leading first page and a trailing
 * last page when the window sits between them.
 */
export function directoryPageWindow(page: number, pageCount: number, size = 5): DirectoryPageItem[] {
  const total = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), total)
  const start = Math.max(1, Math.min(current - Math.floor(size / 2), total - size + 1))
  const end = Math.min(total, start + size - 1)
  const items: DirectoryPageItem[] = []
  if (start > 1) {
    items.push({ kind: 'page', page: 1 })
    if (start > 2) items.push({ kind: 'gap' })
  }
  for (let value = start; value <= end; value += 1) items.push({ kind: 'page', page: value })
  if (end < total) {
    if (end < total - 1) items.push({ kind: 'gap' })
    items.push({ kind: 'page', page: total })
  }
  return items
}

export function findDirectoryPatient(
  patients: readonly DirectoryPatient[],
  id: string,
): DirectoryPatient | undefined {
  return patients.find((patient) => patient.id === id)
}
