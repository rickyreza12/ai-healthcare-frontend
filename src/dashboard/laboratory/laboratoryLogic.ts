import {
  LAB_ORDERS,
  LAB_RESULTS,
  LAB_TABS,
  QC_ANALYZERS,
  QC_RUNS,
  SPECIMENS,
  type LabOrder,
  type LabOrderStatus,
  type LabResult,
  type LabResultStatus,
  type LabTabKey,
  type QcRun,
  type QcRunStatus,
  type Specimen,
  type SpecimenStatus,
} from './laboratoryData.ts'

export const ALL_STATUS = 'All Status'
export const ALL_SPECIMENS = 'All Specimens'
export const ALL_ANALYZERS = 'All Analyzers'

export const DEFAULT_ORDER_FILTERS = { query: '', status: ALL_STATUS, specimen: ALL_SPECIMENS } as const
export const DEFAULT_RESULT_FILTERS = { query: '', status: ALL_STATUS } as const
export const DEFAULT_SPECIMEN_FILTERS = { query: '', status: ALL_STATUS } as const
export const DEFAULT_QC_FILTERS = { query: '', status: ALL_STATUS, analyzer: ALL_ANALYZERS } as const

export type OrderFilters = {
  readonly query: string
  readonly status: LabOrderStatus | typeof ALL_STATUS
  readonly specimen: string
}

export type ResultFilters = {
  readonly query: string
  readonly status: LabResultStatus | typeof ALL_STATUS
}

export type SpecimenFilters = {
  readonly query: string
  readonly status: SpecimenStatus | typeof ALL_STATUS
}

export type QcFilters = {
  readonly query: string
  readonly status: QcRunStatus | typeof ALL_STATUS
  readonly analyzer: string
}

export function parseLaboratoryTab(value: string | null | undefined): LabTabKey {
  return LAB_TABS.some((tab) => tab.key === value) ? (value as LabTabKey) : 'overview'
}

/** Overview uses the bare route; every other tab carries a stable query key. */
export function laboratoryTabHref(tab: LabTabKey, extra?: Record<string, string | null | undefined>): string {
  const params = new URLSearchParams()
  if (tab !== 'overview') params.set('tab', tab)
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) params.set(key, value)
  }
  const search = params.toString()
  return search ? `/dashboard/laboratory?${search}` : '/dashboard/laboratory'
}

export function laboratoryOrderHref(orderNumber: string): string {
  return laboratoryTabHref('orders', { order: orderNumber })
}

export function parseResultStatusFilter(value: string | null | undefined): ResultFilters['status'] {
  if (!value) return ALL_STATUS
  const normalised = value.toLowerCase()
  if (normalised === 'critical') return 'Critical'
  if (normalised === 'abnormal') return 'Abnormal'
  if (normalised === 'normal') return 'Normal'
  if (normalised === 'pending') return 'Pending'
  return ALL_STATUS
}

const needle = (query: string) => query.trim().toLowerCase()

export function filterOrders(filters: OrderFilters, orders: readonly LabOrder[] = LAB_ORDERS): LabOrder[] {
  const term = needle(filters.query)
  return orders.filter((order) => {
    if (filters.status !== ALL_STATUS && order.status !== filters.status) return false
    if (filters.specimen !== ALL_SPECIMENS && order.specimenType !== filters.specimen) return false
    if (!term) return true
    return (
      order.patientName.toLowerCase().includes(term) ||
      (order.patientId ?? '').toLowerCase().includes(term) ||
      order.number.toLowerCase().includes(term) ||
      order.testSummary.toLowerCase().includes(term) ||
      order.category.toLowerCase().includes(term)
    )
  })
}

export function filterResults(filters: ResultFilters, results: readonly LabResult[] = LAB_RESULTS): LabResult[] {
  const term = needle(filters.query)
  return results.filter((result) => {
    if (filters.status !== ALL_STATUS && result.status !== filters.status) return false
    if (!term) return true
    return (
      result.patientName.toLowerCase().includes(term) ||
      result.test.toLowerCase().includes(term) ||
      result.orderNumber.toLowerCase().includes(term) ||
      result.id.toLowerCase().includes(term)
    )
  })
}

export function filterSpecimens(filters: SpecimenFilters, specimens: readonly Specimen[] = SPECIMENS): Specimen[] {
  const term = needle(filters.query)
  return specimens.filter((specimen) => {
    if (filters.status !== ALL_STATUS && specimen.status !== filters.status) return false
    if (!term) return true
    return (
      specimen.id.toLowerCase().includes(term) ||
      specimen.patientName.toLowerCase().includes(term) ||
      specimen.testGroup.toLowerCase().includes(term) ||
      specimen.type.toLowerCase().includes(term)
    )
  })
}

export function filterQcRuns(filters: QcFilters, runs: readonly QcRun[] = QC_RUNS): QcRun[] {
  const term = needle(filters.query)
  return runs.filter((run) => {
    if (filters.status !== ALL_STATUS && run.status !== filters.status) return false
    if (filters.analyzer !== ALL_ANALYZERS && run.analyzer !== filters.analyzer) return false
    if (!term) return true
    return (
      run.test.toLowerCase().includes(term) ||
      run.analyzer.toLowerCase().includes(term) ||
      run.rule.toLowerCase().includes(term)
    )
  })
}

export function findOrder(orderNumber: string | null | undefined): LabOrder | undefined {
  if (!orderNumber) return undefined
  return LAB_ORDERS.find((order) => order.number === orderNumber)
}

export function findResult(id: string | null | undefined): LabResult | undefined {
  if (!id) return undefined
  return LAB_RESULTS.find((result) => result.id === id)
}

export function findSpecimen(id: string | null | undefined): Specimen | undefined {
  if (!id) return undefined
  return SPECIMENS.find((specimen) => specimen.id === id)
}

export function isDefaultOrderFilters(filters: OrderFilters): boolean {
  return filters.query === '' && filters.status === ALL_STATUS && filters.specimen === ALL_SPECIMENS
}

export function isDefaultResultFilters(filters: ResultFilters): boolean {
  return filters.query === '' && filters.status === ALL_STATUS
}

export function isDefaultSpecimenFilters(filters: SpecimenFilters): boolean {
  return filters.query === '' && filters.status === ALL_STATUS
}

export function isDefaultQcFilters(filters: QcFilters): boolean {
  return filters.query === '' && filters.status === ALL_STATUS && filters.analyzer === ALL_ANALYZERS
}

export function criticalResultCount(results: readonly LabResult[] = LAB_RESULTS): number {
  return results.filter((result) => result.critical).length
}

export function resultStatusCounts(results: readonly LabResult[] = LAB_RESULTS): Record<LabResultStatus, number> {
  return {
    Critical: results.filter((result) => result.status === 'Critical').length,
    Abnormal: results.filter((result) => result.status === 'Abnormal').length,
    Normal: results.filter((result) => result.status === 'Normal').length,
    Pending: results.filter((result) => result.status === 'Pending').length,
  }
}

export function specimenStatusCounts(specimens: readonly Specimen[] = SPECIMENS): Partial<Record<SpecimenStatus, number>> {
  return specimens.reduce<Partial<Record<SpecimenStatus, number>>>((counts, specimen) => {
    counts[specimen.status] = (counts[specimen.status] ?? 0) + 1
    return counts
  }, {})
}

export function defaultAnalyzerOptions(): readonly string[] {
  return QC_ANALYZERS
}

export type OrderStage = {
  readonly key: string
  readonly label: string
  readonly state: 'done' | 'current' | 'pending'
}

const ORDER_STAGE_LABELS = [
  { key: 'ordered', label: 'Ordered' },
  { key: 'scheduled', label: 'Collection Scheduled' },
  { key: 'collected', label: 'Collected' },
  { key: 'received', label: 'Received by Lab' },
  { key: 'processing', label: 'Processing' },
  { key: 'validated', label: 'Validated' },
  { key: 'released', label: 'Released' },
] as const

/** Derived strictly from the supplied order status; no hidden workflow. */
export function orderStages(status: LabOrderStatus): OrderStage[] {
  const reached =
    status === 'Completed' ? 7 :
    status === 'Processing' ? 4 :
    status === 'Collected' ? 3 :
    status === 'Rejected' ? 2 :
    1
  return ORDER_STAGE_LABELS.map((stage, index) => ({
    ...stage,
    state: index < reached ? 'done' : index === reached ? 'current' : 'pending',
  }))
}

export function orderTimeLabel(order: LabOrder): string {
  return order.dateGroup === 'Yesterday' ? `Yesterday · ${order.time}` : order.time
}
