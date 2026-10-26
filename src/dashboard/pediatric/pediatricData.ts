/**
 * Reference fixture for the BUNDA Pediatric Care overview.
 *
 * Every name, date, measurement, percentile, vaccine, milestone, and note below is synthetic
 * demonstration content supplied with the approved design. It is not live or clinically validated
 * data, and the growth curves are illustrative values authored to reproduce the approved chart.
 */
export type GrowthMetricId = 'height' | 'weight' | 'bmi' | 'overall'

export type GrowthMetric = {
  readonly id: GrowthMetricId
  readonly label: string
  readonly value: string
  /** Rendered smaller than the value and empty when the metric has no unit. */
  readonly unit: string
  readonly percentile?: string
  readonly caption: string
}

export type GrowthTone = 'coral' | 'amber' | 'green' | 'blue' | 'violet' | 'teal'

export type GrowthPoint = {
  readonly ageYears: number
  readonly value: number
}

export type GrowthSeries = {
  readonly key: string
  readonly label: string
  readonly tone: GrowthTone
  readonly points: readonly GrowthPoint[]
  /** True for the supplied patient line, which is the only series that draws point markers. */
  readonly patient?: boolean
}

export type VaccinationStatus = 'Completed'

export type Vaccination = {
  readonly id: string
  readonly date: string
  readonly vaccine: string
  readonly dose: string
  readonly status: VaccinationStatus
  readonly nextDue: string
}

export type Milestone = {
  readonly id: string
  readonly label: string
  readonly status: string
}

export const PEDIATRIC_BREADCRUMB = ['Pediatric Care', 'Patient Detail'] as const

export const PEDIATRIC_TABS = [
  'Overview',
  'Growth & Development',
  'Vaccinations',
  'Medical History',
  'Visits',
  'Prescriptions',
] as const

export const PEDIATRIC_PATIENT = {
  name: 'Muhammad Rizki',
  age: '5 years 2 months',
  gender: 'Male',
  id: 'P-0004587',
  statuses: [
    { id: 'active', label: 'Active Patient', tone: 'active' },
    { id: 'plan', label: 'BUNDA Kids Plan', tone: 'plan' },
    { id: 'allergies', label: 'Allergies: None', tone: 'allergy' },
  ],
} as const

export const GROWTH_SUMMARY: readonly GrowthMetric[] = [
  { id: 'height', label: 'Height', value: '110.2', unit: 'cm', percentile: '68th percentile', caption: 'Normal range for age' },
  { id: 'weight', label: 'Weight', value: '18.5', unit: 'kg', percentile: '62nd percentile', caption: 'Normal range for age' },
  { id: 'bmi', label: 'BMI', value: '15.2', unit: '', percentile: '55th percentile', caption: 'Normal range for age' },
  { id: 'overall', label: 'Overall Growth', value: 'Normal', unit: '', caption: 'Consistent growth pattern' },
] as const

export const GROWTH_SERIES_TABS = [
  { id: 'height', label: 'Height' },
  { id: 'weight', label: 'Weight' },
  { id: 'bmi', label: 'BMI' },
] as const

/** Authoring domain of the supplied height chart: ages 0 to 7, heights 40 to 140 cm. */
export const HEIGHT_DOMAIN = { xMin: 0, xMax: 7, yMin: 40, yMax: 140 } as const

export const HEIGHT_TICKS: readonly number[] = [140, 120, 100, 80, 60, 40]
export const AGE_TICKS: readonly string[] = ['0', '1', '2', '3', '4', '5', '6', '7']

export const HEIGHT_SERIES: readonly GrowthSeries[] = [
  { key: 'p97', label: '97th percentile', tone: 'coral', points: [
    { ageYears: 0, value: 62 }, { ageYears: 1, value: 79 }, { ageYears: 2, value: 91 }, { ageYears: 3, value: 100 },
    { ageYears: 4, value: 108 }, { ageYears: 5, value: 115 }, { ageYears: 6, value: 121 }, { ageYears: 7, value: 127 },
  ] },
  { key: 'p85', label: '85th percentile', tone: 'amber', points: [
    { ageYears: 0, value: 58 }, { ageYears: 1, value: 76 }, { ageYears: 2, value: 88 }, { ageYears: 3, value: 97 },
    { ageYears: 4, value: 105 }, { ageYears: 5, value: 112 }, { ageYears: 6, value: 118 }, { ageYears: 7, value: 124 },
  ] },
  { key: 'p50', label: '50th percentile', tone: 'green', points: [
    { ageYears: 0, value: 54 }, { ageYears: 1, value: 74 }, { ageYears: 2, value: 86 }, { ageYears: 3, value: 95 },
    { ageYears: 4, value: 103 }, { ageYears: 5, value: 110 }, { ageYears: 6, value: 116 }, { ageYears: 7, value: 121 },
  ] },
  { key: 'p15', label: '15th percentile', tone: 'blue', points: [
    { ageYears: 0, value: 50 }, { ageYears: 1, value: 71 }, { ageYears: 2, value: 83 }, { ageYears: 3, value: 92 },
    { ageYears: 4, value: 100 }, { ageYears: 5, value: 107 }, { ageYears: 6, value: 113 }, { ageYears: 7, value: 118 },
  ] },
  { key: 'p3', label: '3rd percentile', tone: 'violet', points: [
    { ageYears: 0, value: 46 }, { ageYears: 1, value: 68 }, { ageYears: 2, value: 80 }, { ageYears: 3, value: 89 },
    { ageYears: 4, value: 96 }, { ageYears: 5, value: 103 }, { ageYears: 6, value: 109 }, { ageYears: 7, value: 114 },
  ] },
  { key: 'rizki', label: "Rizki's growth", tone: 'teal', patient: true, points: [
    { ageYears: 0, value: 56 }, { ageYears: 1, value: 78 }, { ageYears: 2, value: 90 }, { ageYears: 3, value: 99 },
    { ageYears: 4, value: 106 }, { ageYears: 5, value: 109 }, { ageYears: 5.17, value: 110.2 },
  ] },
] as const

export const HEIGHT_HIGHLIGHT = {
  seriesKey: 'rizki',
  ageYears: 5.17,
  value: 110.2,
  ageLabel: '5y 2m',
  valueLabel: '110.2 cm',
  percentileLabel: '(68th percentile)',
} as const

export const NEXT_VISIT = {
  vaccine: 'DTaP Booster (5th dose)',
  recommendedAge: '5 - 6 years',
  dueDate: '12 Nov 2026',
  relativeLabel: 'In 3 months',
} as const

export const MILESTONES: readonly Milestone[] = [
  { id: 'sentences', label: 'Speaks in full sentences', status: 'On track' },
  { id: 'tricycle', label: 'Can ride a tricycle or bicycle', status: 'On track' },
  { id: 'plays-well', label: 'Plays well with other children', status: 'On track' },
  { id: 'curious', label: 'Shows curiosity and asks questions', status: 'On track' },
  { id: 'dresses', label: 'Can dress independently', status: 'On track' },
] as const

/** Kept in the supplied visual order, which is not chronological. */
export const VACCINATIONS: readonly Vaccination[] = [
  { id: 'bcg', date: '12 Jan 2023', vaccine: 'BCG', dose: '1/1', status: 'Completed', nextDue: '-' },
  { id: 'dpt-hb-hib', date: '15 Feb 2023', vaccine: 'DPT-HB-Hib', dose: '3/3', status: 'Completed', nextDue: '-' },
  { id: 'polio-ipv', date: '10 Mar 2023', vaccine: 'Polio (IPV)', dose: '3/3', status: 'Completed', nextDue: '-' },
  { id: 'mmr', date: '05 Jun 2024', vaccine: 'MMR', dose: '2/2', status: 'Completed', nextDue: '-' },
  { id: 'hepatitis-b', date: '12 Nov 2021', vaccine: 'Hepatitis B', dose: '3/3', status: 'Completed', nextDue: '-' },
] as const

export const RECENT_NOTE = {
  date: '12 Aug 2026',
  clinician: 'Dr. Siti Aisyah',
  visit: 'Routine Check-up',
  body: 'Growth and development are on track. Child is active, cheerful, and has good appetite.',
} as const
