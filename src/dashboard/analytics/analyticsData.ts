export type MetricKey = 'totalPatients' | 'appointments' | 'completedVisits' | 'cancelledVisits'

export type Metric = {
  readonly key: MetricKey
  readonly value: string
  readonly label: string
  readonly trendDirection: 'Up' | 'Down'
  readonly trendPercent: string
  /** Pale swatch tone from the approved reference card. */
  readonly tone: 'patients' | 'appointments' | 'completed' | 'cancelled'
}

/** Synthetic display fixtures; direction carries no comparison period. */
export const METRICS: readonly Metric[] = [
  { key: 'totalPatients', value: '1,248', label: 'Total Patients', trendDirection: 'Up', trendPercent: '12.5%', tone: 'patients' },
  { key: 'appointments', value: '320', label: 'Appointments', trendDirection: 'Up', trendPercent: '8%', tone: 'appointments' },
  { key: 'completedVisits', value: '416', label: 'Completed Visits', trendDirection: 'Up', trendPercent: '15%', tone: 'completed' },
  { key: 'cancelledVisits', value: '12', label: 'Cancelled Visits', trendDirection: 'Down', trendPercent: '5%', tone: 'cancelled' },
]

export type PatientType = {
  readonly key: string
  readonly label: string
  readonly percent: number
  readonly color: string
}

export const PATIENT_TYPES: readonly PatientType[] = [
  { key: 'maternity', label: 'Maternity', percent: 40, color: '#317CF8' },
  { key: 'pediatric', label: 'Pediatric', percent: 25, color: '#10BDA5' },
  { key: 'obgyn', label: 'OBGYN', percent: 20, color: '#FFAC2C' },
  { key: 'general', label: 'General', percent: 15, color: '#987DFA' },
]

export const PATIENT_TYPES_TOTAL = '1,248'

export type Department = {
  readonly label: string
  readonly count: number
  readonly share: number
  readonly color: string
}

export const DEPARTMENTS: readonly Department[] = [
  { label: 'Maternity', count: 495, share: 39.7, color: '#317CF8' },
  { label: 'Pediatrics', count: 314, share: 25.2, color: '#10BDA5' },
  { label: 'General Practice', count: 266, share: 21.3, color: '#FFAC2C' },
  { label: 'Other Services', count: 173, share: 13.8, color: '#987DFA' },
]

export const DEPARTMENT_TOTAL = 1248

export const REPORT_SUMMARY: readonly { readonly label: string; readonly value: string }[] = [
  { label: 'Reporting period', value: 'May 2026' },
  { label: 'Data category', value: 'Demo operational metrics' },
  { label: 'Last updated', value: '18 Oct 2026' },
  { label: 'Export eligibility', value: 'Requires confirmation' },
]

export const SUPPLIED_PERIOD = 'May 2026 · Monthly'

export const PERIOD_CHOICES: readonly string[] = [
  SUPPLIED_PERIOD,
  'April 2026 · Monthly',
  'May 2026 · Weekly',
]

export type VisitTrends = {
  readonly period: string
  readonly months: readonly string[]
  readonly axis: readonly number[]
  readonly seriesA: readonly number[]
  readonly seriesB: readonly number[]
  readonly seriesAColor: string
  readonly seriesBColor: string
  readonly note: string
}

/**
 * Patient Visit Trends. Values measured from the reference SVG bar geometry
 * (gridline 40 = baseline y652, 140 = y426). The reference names no series,
 * so the accessible labels stay "Reference series A/B".
 */
export const VISIT_TRENDS: VisitTrends = {
  period: 'Last 6 months',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  axis: [40, 60, 80, 100, 120, 140],
  seriesA: [65, 78, 88, 98, 117, 134],
  seriesB: [60, 70, 78, 86, 100, 114],
  seriesAColor: '#A5E6EB',
  seriesBColor: '#04A5B2',
  note: 'Synthetic monthly patient visits (illustrative)',
}

export const ANALYTICS_PAGE = {
  heading: 'Analytics & Reports',
  supporting: 'Track operational metrics from a synthetic demonstration dataset.',
} as const

/** Maps a value inside [min, max] to a y coordinate inside [top, bottom]. */
export function valueToY(value: number, min: number, max: number, top: number, bottom: number): number {
  return top + ((max - value) / (max - min)) * (bottom - top)
}

export type DonutSegment = {
  readonly label: string
  readonly percent: number
  readonly color: string
  readonly offsetPercent: number
}

/** Cumulative stroke offsets for an SVG donut built from stroke-dasharray arcs. */
export function donutSegments(types: readonly PatientType[]): DonutSegment[] {
  let offset = 0
  return types.map((type) => {
    const segment = { label: type.label, percent: type.percent, color: type.color, offsetPercent: offset }
    offset += type.percent
    return segment
  })
}
