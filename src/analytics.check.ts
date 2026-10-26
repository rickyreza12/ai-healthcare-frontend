import assert from 'node:assert/strict'
import {
  DEPARTMENTS,
  DEPARTMENT_TOTAL,
  METRICS,
  PATIENT_TYPES,
  PATIENT_TYPES_TOTAL,
  PERIOD_CHOICES,
  REPORT_SUMMARY,
  SUPPLIED_PERIOD,
  VISIT_TRENDS,
  donutSegments,
  valueToY,
} from './dashboard/analytics/analyticsData.ts'

// Metric keys are stable and unique; values and trends match the source.
assert.deepEqual(
  METRICS.map((metric) => metric.key),
  ['totalPatients', 'appointments', 'completedVisits', 'cancelledVisits'],
  'metric keys are stable',
)
assert.equal(new Set(METRICS.map((metric) => metric.key)).size, 4, 'metric keys are unique')
assert.deepEqual(
  METRICS.map((metric) => [metric.value, metric.trendDirection, metric.trendPercent]),
  [
    ['1,248', 'Up', '12.5%'],
    ['320', 'Up', '8%'],
    ['416', 'Up', '15%'],
    ['12', 'Down', '5%'],
  ],
)

// Patient-type shares sum to 100 and carry the supplied colors.
assert.equal(PATIENT_TYPES.reduce((sum, type) => sum + type.percent, 0), 100)
assert.deepEqual(PATIENT_TYPES.map((type) => [type.label, type.percent, type.color]), [
  ['Maternity', 40, '#317CF8'],
  ['Pediatric', 25, '#10BDA5'],
  ['OBGYN', 20, '#FFAC2C'],
  ['General', 15, '#987DFA'],
])
assert.equal(PATIENT_TYPES_TOTAL, '1,248')

// Department counts sum to 1,248; shares sum to 100 within decimal precision.
assert.equal(DEPARTMENTS.reduce((sum, department) => sum + department.count, 0), DEPARTMENT_TOTAL)
assert.equal(DEPARTMENT_TOTAL, 1248)
assert.equal(
  Math.round(DEPARTMENTS.reduce((sum, department) => sum + department.share, 0) * 10) / 10,
  100,
)
assert.deepEqual(DEPARTMENTS.map((department) => department.label), [
  'Maternity',
  'Pediatrics',
  'General Practice',
  'Other Services',
])

// Visit trends: six ordered months and six values per series, inside the axis domain.
assert.deepEqual(VISIT_TRENDS.months, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'])
assert.equal(VISIT_TRENDS.seriesA.length, 6)
assert.equal(VISIT_TRENDS.seriesB.length, 6)
assert.deepEqual(VISIT_TRENDS.seriesA, [65, 78, 88, 98, 117, 134])
assert.deepEqual(VISIT_TRENDS.seriesB, [60, 70, 78, 86, 100, 114])
assert.deepEqual(VISIT_TRENDS.axis, [40, 60, 80, 100, 120, 140])
assert.equal(VISIT_TRENDS.note, 'Synthetic monthly patient visits (illustrative)')
assert.equal(VISIT_TRENDS.period, 'Last 6 months')
const axisMin = VISIT_TRENDS.axis[0]
const axisMax = VISIT_TRENDS.axis[VISIT_TRENDS.axis.length - 1]
for (const value of [...VISIT_TRENDS.seriesA, ...VISIT_TRENDS.seriesB]) {
  assert.ok(value >= axisMin && value <= axisMax, `value ${value} stays inside the axis domain`)
}

// Report summary fields match the supplied strings.
assert.deepEqual(REPORT_SUMMARY, [
  { label: 'Reporting period', value: 'May 2026' },
  { label: 'Data category', value: 'Demo operational metrics' },
  { label: 'Last updated', value: '18 Oct 2026' },
  { label: 'Export eligibility', value: 'Requires confirmation' },
])

// Only the supplied period is offered as supported; others stay listed but unsupported.
assert.equal(PERIOD_CHOICES[0], SUPPLIED_PERIOD)
assert.equal(SUPPLIED_PERIOD, 'May 2026 · Monthly')
assert.ok(PERIOD_CHOICES.slice(1).every((choice) => choice !== SUPPLIED_PERIOD))

// Chart geometry helpers are pure and correct at the domain edges.
assert.equal(valueToY(140, 40, 140, 16, 236), 16, 'axis maximum maps to the plot top')
assert.equal(valueToY(40, 40, 140, 16, 236), 236, 'axis minimum maps to the plot baseline')
assert.ok(valueToY(100, 40, 140, 16, 236) > valueToY(120, 40, 140, 16, 236), 'larger values sit higher')

const segments = donutSegments(PATIENT_TYPES)
assert.deepEqual(segments.map((segment) => segment.offsetPercent), [0, 40, 65, 85], 'donut offsets accumulate')
assert.equal(segments[segments.length - 1].offsetPercent + segments[segments.length - 1].percent, 100)

// Helpers do not mutate fixtures.
const snapshot = JSON.stringify(PATIENT_TYPES)
donutSegments(PATIENT_TYPES)
valueToY(99, 40, 140, 16, 236)
assert.equal(JSON.stringify(PATIENT_TYPES), snapshot, 'fixtures are not mutated')

console.log('analytics checks passed')
