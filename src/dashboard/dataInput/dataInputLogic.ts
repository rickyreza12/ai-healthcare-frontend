import type { DataInputRecord, ResourceDefinition, ResourceField } from './dataInputRegistry.ts'

export const DATA_INPUT_PAGE_SIZE = 8

export type ListQuery = {
  readonly search: string
  readonly sortKey: string
  readonly page: number
}

export type ListResult = {
  readonly records: readonly DataInputRecord[]
  readonly total: number
  readonly page: number
  readonly pageCount: number
  readonly start: number
  readonly end: number
}

function fieldFor(resource: ResourceDefinition, key: string): ResourceField | undefined {
  return resource.fields.find((field) => field.key === key)
}

/** Display text for one fixture value. Missing values are stated, never rendered as blanks. */
export function fieldValue(resource: ResourceDefinition, record: DataInputRecord, key: string): string {
  const value = record[key]
  if (value === undefined || value === null || value === '') return 'Not supplied'
  const field = fieldFor(resource, key)
  if (field?.kind === 'number' && typeof value === 'number') return value.toLocaleString('en-US')
  if (field?.kind === 'boolean' && typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function recordIdentifier(resource: ResourceDefinition, record: DataInputRecord): string {
  return String(record[resource.identifierField] ?? '')
}

export function fieldLabel(resource: ResourceDefinition, key: string): string {
  return fieldFor(resource, key)?.label ?? key
}

function matchesQuery(resource: ResourceDefinition, record: DataInputRecord, needle: string): boolean {
  return resource.searchFields.some((key) =>
    fieldValue(resource, record, key).toLowerCase().includes(needle),
  )
}

function compareValues(a: DataInputRecord, b: DataInputRecord, key: string): number {
  const left = a[key]
  const right = b[key]
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left ?? '').localeCompare(String(right ?? ''), 'en')
}

/** Search, sort, and page one resource. Pure: fixtures are copied, never changed. */
export function queryRecords(
  resource: ResourceDefinition,
  query: ListQuery,
  pageSize: number = DATA_INPUT_PAGE_SIZE,
): ListResult {
  const needle = query.search.trim().toLowerCase()
  const filtered = needle
    ? resource.records.filter((record) => matchesQuery(resource, record, needle))
    : [...resource.records]
  const sorted = query.sortKey ? [...filtered].sort((a, b) => compareValues(a, b, query.sortKey)) : filtered
  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, Math.trunc(query.page) || 1), pageCount)
  const from = (page - 1) * pageSize
  const records = sorted.slice(from, from + pageSize)
  return {
    records,
    total,
    page,
    pageCount,
    start: total === 0 ? 0 : from + 1,
    end: Math.min(from + pageSize, total),
  }
}

export function operationLabel(status: 'implemented' | 'proposed' | 'blocked' | 'out-of-scope' | 'local-demo-only'): string {
  switch (status) {
    case 'implemented':
      return 'Implemented'
    case 'proposed':
      return 'Proposed only'
    case 'out-of-scope':
      return 'Out of scope'
    case 'local-demo-only':
      return 'Local fixture read'
    default:
      return 'Blocked'
  }
}
