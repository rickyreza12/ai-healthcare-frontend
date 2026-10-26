import {
  MATERNITY_DOCUMENTS,
  MATERNITY_EDUCATION,
  MATERNITY_MEDICAL_RECORDS,
  MATERNITY_TAB_KEYS,
  PRENATAL_CHECKLIST,
  type MaternityDocument,
  type MaternityEducationResource,
  type MaternityMedicalRecord,
  type MaternityTabKey,
  type PrenatalChecklistItem,
  type PrenatalChecklistStatus,
} from './maternityData.ts'

export const DEFAULT_MATERNITY_TAB: MaternityTabKey = 'overview'

/** Unknown or missing tab values fall back to Overview without an error. */
export function parseMaternityTab(value: string | null | undefined): MaternityTabKey {
  const match = MATERNITY_TAB_KEYS.find((entry) => entry.key === value)
  return match ? match.key : DEFAULT_MATERNITY_TAB
}

export function maternityTabHref(key: MaternityTabKey): string {
  return key === DEFAULT_MATERNITY_TAB ? '/dashboard/maternity' : `/dashboard/maternity?tab=${key}`
}

export function filterChecklist(
  items: readonly PrenatalChecklistItem[],
  status: 'All' | PrenatalChecklistStatus,
): readonly PrenatalChecklistItem[] {
  return status === 'All' ? items : items.filter((item) => item.status === status)
}

export function findMaternityRecord(id: string | null): MaternityMedicalRecord | undefined {
  return id ? MATERNITY_MEDICAL_RECORDS.find((record) => record.id === id) : undefined
}

export function findEducationResource(id: string | null): MaternityEducationResource | undefined {
  return id ? MATERNITY_EDUCATION.find((resource) => resource.id === id) : undefined
}

export function findMaternityDocument(id: string | null): MaternityDocument | undefined {
  return id ? MATERNITY_DOCUMENTS.find((document) => document.id === id) : undefined
}

/** Plots a supplied gestational age on the supplied week scale. Never a clinical calculation. */
export function progressPercent(currentWeek: number, totalWeeks: number): number {
  if (!Number.isFinite(currentWeek) || totalWeeks <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((currentWeek / totalWeeks) * 100)))
}

export function checklistCounts(
  items: readonly PrenatalChecklistItem[],
): Record<PrenatalChecklistStatus, number> {
  const counts: Record<PrenatalChecklistStatus, number> = { Completed: 0, 'Due Soon': 0, Pending: 0 }
  for (const item of items) counts[item.status] += 1
  return counts
}

export function findChecklistItem(
  items: readonly PrenatalChecklistItem[],
  id: string | null,
): PrenatalChecklistItem | undefined {
  if (!id) return undefined
  return items.find((item) => item.id === id)
}

export function isOverviewTab(tab: string): boolean {
  return tab === 'Overview'
}

/** Unavailable tabs and actions share one honest explanation shape. */
export function unavailableNotice(title: string): { title: string; body: string } {
  return {
    title,
    body: `${title} is not part of this reference demo. ${PRENATAL_CHECKLIST.length} prenatal checklist items, one appointment, and one note are the only supplied maternity fixtures.`,
  }
}
