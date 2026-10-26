import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ACTIVITY_TREND,
  CATEGORY_DISTRIBUTION,
  CATEGORY_TOTAL,
  CBC_ANALYTES,
  COLLECTION_SCHEDULE,
  CRITICAL_ALERTS,
  HEMOGLOBIN_TREND,
  LAB_ARTWORK_COPY,
  LAB_ORDERS,
  LAB_RESULTS,
  LAB_TABS,
  OVERVIEW_METRICS,
  ORDER_DETAIL_REFERENCE,
  QC_ALERTS,
  QC_ANALYZERS,
  QC_CHART,
  QC_EQUIPMENT,
  QC_METRICS,
  QC_RUNS,
  RESULT_PATIENT,
  RESULTS_METRICS,
  SPECIMENS,
  SPECIMEN_METRICS,
} from './dashboard/laboratory/laboratoryData.ts'
import {
  ALL_ANALYZERS,
  ALL_STATUS,
  DEFAULT_ORDER_FILTERS,
  DEFAULT_QC_FILTERS,
  DEFAULT_RESULT_FILTERS,
  DEFAULT_SPECIMEN_FILTERS,
  criticalResultCount,
  filterOrders,
  filterQcRuns,
  filterResults,
  filterSpecimens,
  findOrder,
  findResult,
  findSpecimen,
  isDefaultOrderFilters,
  isDefaultQcFilters,
  isDefaultResultFilters,
  isDefaultSpecimenFilters,
  laboratoryOrderHref,
  laboratoryTabHref,
  orderStages,
  parseLaboratoryTab,
  parseResultStatusFilter,
  resultStatusCounts,
  specimenStatusCounts,
} from './dashboard/laboratory/laboratoryLogic.ts'

// Stable navigation: Overview is first and the only bare route.
assert.deepEqual(LAB_TABS.map((tab) => tab.key), ['overview', 'orders', 'results', 'specimen-tracking', 'quality-control'])
assert.deepEqual(LAB_TABS.map((tab) => tab.label), ['Overview', 'Orders', 'Results', 'Specimen Tracking', 'Quality Control'])
assert.equal(parseLaboratoryTab(null), 'overview')
assert.equal(parseLaboratoryTab(''), 'overview')
assert.equal(parseLaboratoryTab('not-a-tab'), 'overview')
assert.equal(parseLaboratoryTab('orders'), 'orders')
assert.equal(parseLaboratoryTab('specimen-tracking'), 'specimen-tracking')
assert.equal(laboratoryTabHref('overview'), '/dashboard/laboratory')
assert.equal(laboratoryTabHref('orders'), '/dashboard/laboratory?tab=orders')
assert.equal(laboratoryTabHref('results'), '/dashboard/laboratory?tab=results')
assert.equal(laboratoryTabHref('specimen-tracking'), '/dashboard/laboratory?tab=specimen-tracking')
assert.equal(laboratoryTabHref('quality-control'), '/dashboard/laboratory?tab=quality-control')
assert.equal(laboratoryOrderHref('LB250513002'), '/dashboard/laboratory?tab=orders&order=LB250513002')
assert.equal(parseResultStatusFilter('critical'), 'Critical')
assert.equal(parseResultStatusFilter('unknown'), ALL_STATUS)
assert.equal(LAB_ARTWORK_COPY.lineOne, 'Accurate Results')

// Overview metrics are display fixtures, not recomputed totals.
assert.deepEqual(
  OVERVIEW_METRICS.map((metric) => [metric.value, metric.label, metric.comparison, metric.direction]),
  [
    ['186', 'Total Tests Today', '12% vs yesterday', 'up'],
    ['24', 'Pending Collection', '33% vs yesterday', 'up'],
    ['38', 'In Processing', '8% vs yesterday', 'down'],
    ['6', 'Critical Results', '50% vs yesterday', 'up'],
    ['118', 'Completed Reports', '18% vs yesterday', 'up'],
  ],
)

// Category shares are exact and total 100 percent.
assert.equal(CATEGORY_TOTAL, 486)
assert.deepEqual(CATEGORY_DISTRIBUTION.map((item) => [item.label, item.percent]), [
  ['Hematology', 32],
  ['Clinical Chemistry', 28],
  ['Microbiology', 15],
  ['Immunology', 12],
  ['Urinalysis', 8],
  ['Others', 5],
])
assert.equal(CATEGORY_DISTRIBUTION.reduce((sum, item) => sum + item.percent, 0), 100)
assert.deepEqual(ACTIVITY_TREND.labels, ['7 May', '8 May', '9 May', '10 May', '11 May', '12 May', '13 May'])
assert.equal(ACTIVITY_TREND.series.length, 3)
assert.ok(ACTIVITY_TREND.series.every((series) => series.values.length === ACTIVITY_TREND.labels.length))

// Critical alerts keep exact patient, test, result, time, and written status.
assert.deepEqual(
  CRITICAL_ALERTS.map((alert) => [alert.patientName, alert.test, alert.result, alert.status]),
  [
    ['Siti Aisyah', 'Hemoglobin', '6.8 g/dL', 'Critical'],
    ['Muhammad Rizki', 'WBC Count', '22.4 x10³/µL', 'Critical'],
    ['Anita Dewi', 'Potassium (K⁺)', '6.1 mmol/L', 'Critical'],
    ['Budi Santoso', 'Blood Glucose', '420 mg/dL', 'Critical'],
  ],
)

// Recent orders use the five supplied reviewed rows in source order.
const recentOrders = LAB_ORDERS.filter((order) => order.dateGroup === 'Today').slice(0, 5)
assert.deepEqual(
  recentOrders.map((order) => [order.patientName, order.patientId, order.number, order.testSummary, order.specimenType, order.status, order.time]),
  [
    ['Siti Aisyah', 'P-00012345', 'LB250513001', 'CBC, ESR', 'Blood', 'Completed', '10:24 AM'],
    ['Muhammad Rizki', 'P-00067890', 'LB250513002', 'Dengue IgG/IgM', 'Blood', 'Processing', '09:15 AM'],
    ['Anita Dewi', 'P-00054321', 'LB250513003', 'Urinalysis', 'Urine', 'Collected', '08:30 AM'],
    ['Budi Santoso', 'P-00011223', 'LB250513004', 'Lipid Profile', 'Blood', 'Pending', '08:10 AM'],
    ['Rina Melati', 'P-00099887', 'LB250513005', 'Thyroid Panel', 'Blood', 'Processing', '07:45 AM'],
  ],
)
assert.deepEqual(
  COLLECTION_SCHEDULE.map((entry) => [entry.time, entry.patientName, entry.work, entry.status]),
  [
    ['08:00', 'Siti Aisyah', 'Routine Check Up (CBC)', 'Collected'],
    ['08:30', 'Muhammad Rizki', 'Dengue Serology', 'Collected'],
    ['09:00', 'Anita Dewi', 'Prenatal Panel', 'In Progress'],
    ['09:30', 'Budi Santoso', 'Lipid Profile', 'Pending'],
    ['10:00', 'Rina Melati', 'Thyroid Function', 'Scheduled'],
    ['10:30', 'Ahmad Fadhil', 'Liver Function Test', 'Scheduled'],
  ],
)

// Unique identifiers across each fixture collection.
for (const [name, values] of [
  ['orders', LAB_ORDERS.map((order) => order.number)],
  ['results', LAB_RESULTS.map((result) => result.id)],
  ['specimens', SPECIMENS.map((specimen) => specimen.id)],
  ['qc runs', QC_RUNS.map((run) => run.id)],
  ['qc alerts', QC_ALERTS.map((alert) => alert.id)],
  ['equipment', QC_EQUIPMENT.map((equipment) => equipment.id)],
] as const) {
  assert.equal(new Set(values).size, values.length, `${name} ids are unique`)
}

// Cross-tab relationships resolve and patient names stay consistent.
for (const result of LAB_RESULTS) {
  const order = findOrder(result.orderNumber)
  assert.ok(order, `${result.id} resolves to order ${result.orderNumber}`)
  assert.equal(order?.patientName, result.patientName, `${result.id} patient matches its order`)
}
for (const specimen of SPECIMENS) {
  const order = findOrder(specimen.orderNumber)
  assert.ok(order, `${specimen.id} resolves to order ${specimen.orderNumber}`)
  assert.equal(order?.patientName, specimen.patientName, `${specimen.id} patient matches its order`)
  assert.equal(specimen.id, specimen.orderNumber, `${specimen.id} uses its supplied order number`)
}

assert.equal(ORDER_DETAIL_REFERENCE.orderNumber, 'LB250513002')
assert.equal(findOrder('LB250513002')?.hasFullDetail, true)
assert.equal(findOrder('LB250513002')?.tests.length, 3)
assert.deepEqual(ORDER_DETAIL_REFERENCE.specimen.scheduled, '13 May 2025, 08:30 AM')
assert.equal(ORDER_DETAIL_REFERENCE.clinicalNote.includes('Rule out dengue'), true)
assert.equal(findOrder('missing-order'), undefined)

// Results and analytes preserve units, ranges, flags, and written status.
assert.equal(LAB_RESULTS.length, 8)
assert.equal(criticalResultCount(), 4)
assert.deepEqual(resultStatusCounts(), { Critical: 4, Abnormal: 0, Normal: 3, Pending: 1 })
assert.equal(findResult('res-1')?.patientName, 'Siti Aisyah')
assert.equal(findResult('missing-result'), undefined)
assert.deepEqual(CBC_ANALYTES.map((analyte) => [analyte.test, analyte.value, analyte.unit, analyte.referenceRange, analyte.flag, analyte.status]), [
  ['WBC (White Blood Cell)', '11.8', 'x10³/µL', '4.0 – 10.0', 'H', 'Abnormal'],
  ['RBC (Red Blood Cell)', '4.5', 'x10⁶/µL', '3.8 – 5.2', '–', 'Normal'],
  ['Hemoglobin (Hgb)', '6.8', 'g/dL', '12.0 – 16.0', 'L', 'Critical'],
  ['Hematocrit (Hct)', '31.0', '%', '36.0 – 46.0', 'L', 'Abnormal'],
  ['MCV', '82.3', 'fL', '80.0 – 100.0', '–', 'Normal'],
  ['MCH', '27.1', 'pg', '27.0 – 33.0', '–', 'Normal'],
  ['Platelet', '320', 'x10³/µL', '150 – 450', '–', 'Normal'],
])
assert.equal(HEMOGLOBIN_TREND.latest, '6.8 g/dL')
assert.equal(RESULT_PATIENT.patientId, 'P-00012345')
assert.deepEqual(
  RESULTS_METRICS.map((metric) => [metric.value, metric.label]),
  [['186', 'All Results'], ['6', 'Critical'], ['18', 'Abnormal'], ['142', 'Normal'], ['20', 'Pending Validation']],
)

// Specimen fixture facts and summary counts.
assert.equal(SPECIMENS.length, 8)
assert.deepEqual(specimenStatusCounts(), { Received: 1, 'In Transit': 1, Processing: 2, Stored: 1, Pending: 1, 'Recollect Needed': 1, Rejected: 1 })
assert.equal(findSpecimen('LB250513001')?.testGroup, 'Hematology')
assert.equal(findSpecimen('missing-specimen'), undefined)
assert.deepEqual(
  SPECIMEN_METRICS.map((metric) => [metric.value, metric.label]),
  [['186', 'Collected Today'], ['24', 'In Transit'], ['6', 'Rejected Samples'], ['118', 'Stored Samples']],
)
assert.equal(SPECIMENS[0].handlingNote.includes('Tube properly labeled'), true)

// Quality-control runs, alerts, equipment, and chart limits.
assert.equal(QC_RUNS.length, 4)
assert.deepEqual(QC_ANALYZERS, ['Cobas c 311', 'Sysmex XN-1000'])
assert.deepEqual(QC_RUNS.map((run) => [run.time, run.test, run.analyzer, run.observed, run.status]), [
  ['09:42', 'Glucose Level 2', 'Cobas c 311', '104.2 mg/dL', 'Pass'],
  ['09:21', 'Hematology Normal', 'Sysmex XN-1000', '7.6 g/dL', 'Pass'],
  ['08:55', 'Glucose Level 2', 'Cobas c 311', '112.0 mg/dL', 'Fail'],
  ['08:14', 'Electrolytes Level 1', 'Cobas c 311', '139 mmol/L', 'Pass'],
])
assert.deepEqual(
  QC_METRICS.map((metric) => [metric.value, metric.label]),
  [['128', 'QC Runs This Month'], ['98.4%', 'Quality Control Pass Rate'], ['2', 'Out-of-Control Runs'], ['12/13', 'Instruments Operational']],
)
assert.equal(QC_ALERTS.length, 2)
assert.equal(QC_ALERTS[0].severity, 'Critical')
assert.equal(QC_ALERTS[1].severity, 'Warning')
assert.equal(QC_EQUIPMENT.length, 4)
assert.equal(QC_CHART.values.length, 30)
assert.ok(Math.max(...QC_CHART.values) <= QC_CHART.limits.high)
assert.ok(Math.min(...QC_CHART.values) >= QC_CHART.limits.low)

// Filters trim, ignore case, preserve source order, and compose.
assert.deepEqual(filterOrders(DEFAULT_ORDER_FILTERS).map((order) => order.number), LAB_ORDERS.map((order) => order.number))
assert.deepEqual(filterOrders({ ...DEFAULT_ORDER_FILTERS, query: '  SITI ' }).map((order) => order.number), ['LB250513001'])
assert.deepEqual(filterOrders({ ...DEFAULT_ORDER_FILTERS, query: 'budi' }).map((order) => order.number), ['LB250513004', 'LB250513008'])
assert.deepEqual(filterOrders({ ...DEFAULT_ORDER_FILTERS, status: 'Completed' }).map((order) => order.number), ['LB250513001', 'RD250512002', 'LB250512003', 'LB250512004'])
assert.deepEqual(filterOrders({ ...DEFAULT_ORDER_FILTERS, specimen: 'Imaging' }).map((order) => order.number), ['RD250512002'])
assert.deepEqual(filterOrders({ ...DEFAULT_ORDER_FILTERS, status: 'Rejected', specimen: 'Urine' }), [])
assert.deepEqual(filterOrders({ ...DEFAULT_ORDER_FILTERS, query: 'no-such-order' }), [])

assert.deepEqual(filterResults(DEFAULT_RESULT_FILTERS).map((result) => result.id), LAB_RESULTS.map((result) => result.id))
assert.equal(filterResults({ ...DEFAULT_RESULT_FILTERS, query: 'cbc' }).length, 1)
assert.equal(filterResults({ ...DEFAULT_RESULT_FILTERS, status: 'Critical' }).length, 4)
assert.equal(filterResults({ ...DEFAULT_RESULT_FILTERS, status: 'Abnormal' }).length, 0)
assert.deepEqual(filterResults({ ...DEFAULT_RESULT_FILTERS, query: ' LB250513002 ' }).map((result) => result.id), ['res-2'])
assert.deepEqual(filterResults({ ...DEFAULT_RESULT_FILTERS, query: 'no-such-result' }), [])

assert.deepEqual(filterSpecimens(DEFAULT_SPECIMEN_FILTERS).map((specimen) => specimen.id), SPECIMENS.map((specimen) => specimen.id))
assert.deepEqual(filterSpecimens({ ...DEFAULT_SPECIMEN_FILTERS, status: 'Processing' }).map((specimen) => specimen.id), ['LB250513003', 'LB250513004'])
assert.equal(filterSpecimens({ ...DEFAULT_SPECIMEN_FILTERS, query: 'blood' }).length, 6)
assert.equal(filterSpecimens({ ...DEFAULT_SPECIMEN_FILTERS, query: '  SITI ' }).length, 1)
assert.deepEqual(filterSpecimens({ ...DEFAULT_SPECIMEN_FILTERS, query: 'no-such-specimen' }), [])

assert.deepEqual(filterQcRuns(DEFAULT_QC_FILTERS).map((run) => run.id), QC_RUNS.map((run) => run.id))
assert.deepEqual(filterQcRuns({ ...DEFAULT_QC_FILTERS, analyzer: 'Cobas c 311' }).map((run) => run.id), ['qc-1', 'qc-3', 'qc-4'])
assert.deepEqual(filterQcRuns({ ...DEFAULT_QC_FILTERS, status: 'Fail' }).map((run) => run.id), ['qc-3'])
assert.equal(filterQcRuns({ ...DEFAULT_QC_FILTERS, query: '  glucose ' }).length, 2)
assert.deepEqual(filterQcRuns({ ...DEFAULT_QC_FILTERS, query: 'no-such-run' }), [])

// Default predicates drive reset affordances honestly.
assert.ok(isDefaultOrderFilters(DEFAULT_ORDER_FILTERS))
assert.ok(isDefaultResultFilters(DEFAULT_RESULT_FILTERS))
assert.ok(isDefaultSpecimenFilters(DEFAULT_SPECIMEN_FILTERS))
assert.ok(isDefaultQcFilters(DEFAULT_QC_FILTERS))
assert.equal(isDefaultOrderFilters({ ...DEFAULT_ORDER_FILTERS, query: 'x' }), false)
assert.equal(isDefaultQcFilters({ ...DEFAULT_QC_FILTERS, analyzer: ALL_ANALYZERS }), true)
assert.equal(isDefaultQcFilters({ ...DEFAULT_QC_FILTERS, status: 'Pass' }), false)

// Order stages are derived from the supplied status only.
assert.equal(orderStages('Completed').length, 7)
assert.equal(orderStages('Completed').every((stage) => stage.state === 'done'), true)
assert.equal(orderStages('Processing').filter((stage) => stage.state === 'done').length, 4)
assert.equal(orderStages('Processing').find((stage) => stage.state === 'current')?.label, 'Processing')
assert.equal(orderStages('Pending').find((stage) => stage.state === 'current')?.label, 'Collection Scheduled')

// Route wiring replaces the old feature placeholder and preserves one page route.
const mainSource = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8')
assert.ok(mainSource.includes('<Route path="laboratory" element={<LaboratoryPage />} />'))
assert.ok(!mainSource.includes('DashboardFeaturePage page="laboratory"'))

// Helpers never mutate their fixtures.
const orderSnapshot = JSON.stringify(LAB_ORDERS)
const resultSnapshot = JSON.stringify(LAB_RESULTS)
const specimenSnapshot = JSON.stringify(SPECIMENS)
const runSnapshot = JSON.stringify(QC_RUNS)
filterOrders({ ...DEFAULT_ORDER_FILTERS, query: 'a', status: 'Completed', specimen: 'Blood' })
filterResults({ ...DEFAULT_RESULT_FILTERS, query: 'a', status: 'Critical' })
filterSpecimens({ ...DEFAULT_SPECIMEN_FILTERS, query: 'a', status: 'Processing' })
filterQcRuns({ ...DEFAULT_QC_FILTERS, query: 'a', status: 'Fail', analyzer: 'Cobas c 311' })
assert.equal(JSON.stringify(LAB_ORDERS), orderSnapshot, 'orders are not mutated')
assert.equal(JSON.stringify(LAB_RESULTS), resultSnapshot, 'results are not mutated')
assert.equal(JSON.stringify(SPECIMENS), specimenSnapshot, 'specimens are not mutated')
assert.equal(JSON.stringify(QC_RUNS), runSnapshot, 'QC runs are not mutated')

console.log('laboratory checks passed')
