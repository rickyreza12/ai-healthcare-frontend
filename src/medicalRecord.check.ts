import assert from 'node:assert/strict'
import {
  CHEST_XRAY_DETAIL,
  DEFAULT_MEDICAL_RECORD_ID,
  MEDICAL_RECORDS,
  RECORD_CATEGORIES,
  RECORD_TOTAL,
} from './dashboard/medicalRecords/medicalRecordData.ts'
import {
  ALL_STATUSES,
  ALL_TYPES,
  DEFAULT_RECORD_FILTERS,
  categoryType,
  filterRecords,
  findRecord,
  groupRecords,
  isDefaultRecordFilters,
  recordMonths,
  recordStatuses,
  recordTypes,
  resolveRecordSelection,
} from './dashboard/medicalRecords/medicalRecordLogic.ts'
import { duplicateValues } from './dashboard/dashboardLogic.ts'

const ids = MEDICAL_RECORDS.map((record) => record.id)
assert.equal(ids.length, 9, 'the reference supplies nine visible records')
assert.equal(duplicateValues(ids).length, 0, 'record identifiers are unique')
assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)), 'record identifiers are deterministic and URL-safe')
assert.equal(new Set(MEDICAL_RECORDS.map((record) => record.title)).size, 8, 'two supplied records share the Prescribed Medication title')

assert.equal(RECORD_TOTAL, 128, 'the global record count matches the reference summary')
assert.equal(
  RECORD_CATEGORIES.filter((category) => category.key !== 'all').reduce((total, category) => total + category.count, 0),
  RECORD_TOTAL,
  'category counts add up to the global record count',
)
assert.ok(
  RECORD_CATEGORIES.every((category) => category.count >= MEDICAL_RECORDS.length),
  'summary counts describe the global dataset, not the nine sample rows',
)
assert.equal(categoryType('all'), null, 'the All Records category keeps every type')
assert.equal(categoryType('lab'), 'Lab Result', 'a named category maps to its supplied record type')

assert.deepEqual(
  filterRecords(MEDICAL_RECORDS, DEFAULT_RECORD_FILTERS),
  MEDICAL_RECORDS,
  'default filters return every supplied record',
)
assert.ok(isDefaultRecordFilters(DEFAULT_RECORD_FILTERS), 'the default filter set is recognised as default')
assert.ok(
  !isDefaultRecordFilters({ ...DEFAULT_RECORD_FILTERS, query: 'x' }),
  'changing a filter leaves the default state',
)

for (const category of RECORD_CATEGORIES) {
  const rows = filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, category: category.key })
  assert.ok(rows.length > 0, `${category.label} has sample rows`)
  if (category.type) {
    assert.ok(rows.every((record) => record.type === category.type), `${category.label} returns only ${category.type}`)
  } else {
    assert.equal(rows.length, MEDICAL_RECORDS.length, 'All Records keeps every sample row')
  }
}
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, category: 'imaging' }).length, 2, 'Imaging matches the two supplied imaging rows')
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, category: 'prescriptions' }).length, 2, 'Prescriptions matches the two supplied prescription rows')

for (const type of recordTypes(MEDICAL_RECORDS)) {
  const rows = filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, type })
  assert.ok(rows.length > 0 && rows.every((record) => record.type === type), `${type} filtering returns only that type`)
}
for (const month of recordMonths(MEDICAL_RECORDS)) {
  const rows = filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, month })
  assert.ok(rows.length > 0 && rows.every((record) => record.month === month), `${month} filtering returns only that month`)
}
for (const status of recordStatuses(MEDICAL_RECORDS)) {
  const rows = filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, status })
  assert.ok(rows.length > 0 && rows.every((record) => record.status === status), `${status} filtering returns only that status`)
}
assert.deepEqual(recordMonths(MEDICAL_RECORDS), ['May 2024', 'April 2024'], 'months follow fixture order')
assert.deepEqual(recordStatuses(MEDICAL_RECORDS), ['Completed', 'Active', 'Expired'], 'statuses follow fixture order')

assert.deepEqual(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: '   ' }), MEDICAL_RECORDS, 'a blank search keeps every record')
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: 'CHEST' })[0]?.title, 'Chest X-Ray', 'search is case-insensitive')
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: 'sp.pk' })[0]?.title, 'Urine Analysis', 'search matches the supplied clinician')
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: 'thorax' })[0]?.title, 'Chest X-Ray', 'search reaches the supplied examination')
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: 'persistent cough' })[0]?.title, 'Chest X-Ray', 'search reaches the supplied reason')
assert.equal(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: 'prescribed' }).length, 2, 'a shared title returns both supplied rows')
assert.deepEqual(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, query: 'no such record' }), [], 'an unmatched search returns nothing')

const combined = filterRecords(MEDICAL_RECORDS, {
  category: 'lab',
  query: 'urine',
  type: 'Lab Result',
  month: 'April 2024',
  status: 'Completed',
})
assert.equal(combined.length, 1, 'combined filters intersect')
assert.equal(combined[0]?.title, 'Urine Analysis', 'the intersection resolves the expected record')
assert.equal(
  filterRecords(MEDICAL_RECORDS, { category: 'lab', query: '', type: ALL_TYPES, month: 'May 2024', status: ALL_STATUSES }).length,
  1,
  'a coherent but narrow combination keeps its row',
)
assert.equal(
  filterRecords(MEDICAL_RECORDS, { category: 'imaging', query: '', type: ALL_TYPES, month: 'May 2024', status: 'Expired' }).length,
  0,
  'a contradictory combination returns nothing',
)

const groups = groupRecords(filterRecords(MEDICAL_RECORDS, DEFAULT_RECORD_FILTERS))
assert.deepEqual(groups.map((group) => group.month), ['May 2024', 'April 2024'], 'grouping keeps May before April')
assert.deepEqual(groups.map((group) => group.records.length), [5, 4], 'grouping counts follow the supplied rows')
assert.equal(groups[0]?.records[0]?.title, 'Chest X-Ray', 'the first supplied row stays first')
assert.equal(groupRecords(filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, month: 'April 2024' })).length, 1, 'a single-month result produces one group')
assert.deepEqual(groupRecords([]), [], 'an empty result produces no groups')

assert.equal(findRecord(MEDICAL_RECORDS, DEFAULT_MEDICAL_RECORD_ID)?.title, 'Chest X-Ray', 'a known record resolves')
assert.equal(findRecord(MEDICAL_RECORDS, 'record-nope'), undefined, 'an unknown record resolves to nothing')

const extended = MEDICAL_RECORDS.filter((record) => record.id === CHEST_XRAY_DETAIL.recordId)
assert.equal(extended.length, 1, 'only the supplied Chest X-Ray record carries extended content')
assert.equal(extended[0]?.examination, CHEST_XRAY_DETAIL.examination, 'the extended examination comes from one supplied value')
assert.equal(CHEST_XRAY_DETAIL.images.length, 2, 'the reference supplies two X-ray images')
assert.deepEqual(CHEST_XRAY_DETAIL.images.map((image) => image.label), ['AP View', 'Lateral View'], 'image labels follow the reference')
assert.ok(
  MEDICAL_RECORDS.filter((record) => record.id !== CHEST_XRAY_DETAIL.recordId).every((record) => !record.examination),
  'no other record inherits the Chest X-Ray examination',
)

assert.deepEqual(
  resolveRecordSelection(MEDICAL_RECORDS, null),
  { selectedId: DEFAULT_MEDICAL_RECORD_ID, unknown: null },
  'a direct page load selects the reference record',
)
assert.deepEqual(
  resolveRecordSelection(MEDICAL_RECORDS, 'record-2024-04-28-urine-analysis'),
  { selectedId: 'record-2024-04-28-urine-analysis', unknown: null },
  'a known query selects its record',
)
assert.deepEqual(
  resolveRecordSelection(MEDICAL_RECORDS, 'record-nope'),
  { selectedId: DEFAULT_MEDICAL_RECORD_ID, unknown: 'record-nope' },
  'an unknown query reports the unmatched value instead of breaking the page',
)

const snapshot = JSON.stringify(MEDICAL_RECORDS)
filterRecords(MEDICAL_RECORDS, { ...DEFAULT_RECORD_FILTERS, category: 'lab' })
groupRecords(MEDICAL_RECORDS)
assert.equal(JSON.stringify(MEDICAL_RECORDS), snapshot, 'helpers never mutate the supplied fixtures')

console.log('medical record checks passed')
