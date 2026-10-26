import assert from 'node:assert/strict'
import {
  MEDICATIONS,
  MEDICATION_CATEGORIES,
  MEDICATION_GLOBAL_COUNT,
  MEDICATION_PAGE_SIZE,
  MEDICATION_STATUSES,
  MEDICATION_TABS,
} from './dashboard/pharmacy/pharmacyData.ts'
import {
  DEFAULT_MEDICATION_FILTERS,
  clampPage,
  filterMedications,
  isDefaultMedicationFilters,
  medicationMatches,
  showingRangeText,
  tabHasNoSuppliedRows,
  totalPages,
  visibleRows,
} from './dashboard/pharmacy/pharmacyLogic.ts'

const DEFAULTS = DEFAULT_MEDICATION_FILTERS

// Fixture identity: nine rows, stable and unique ids.
assert.equal(MEDICATIONS.length, 9, 'nine medication rows are supplied')
assert.deepEqual(
  MEDICATIONS.map((medication) => medication.id),
  [
    'paracetamol-500',
    'amoxicillin-500',
    'ibuprofen-400',
    'omeprazole-20',
    'amlodipine-5',
    'metformin-500',
    'cetirizine-10',
    'salbutamol-inhaler',
    'loratadine-10',
  ],
  'fixture ids are stable',
)
assert.equal(new Set(MEDICATIONS.map((medication) => medication.id)).size, 9, 'fixture ids are unique')

// Loratadine is the approved ninth row with its complete demo fields.
const loratadine = MEDICATIONS.find((medication) => medication.id === 'loratadine-10')
assert.ok(loratadine, 'loratadine-10 exists')
assert.deepEqual(
  { ...loratadine, id: undefined },
  {
    id: undefined,
    name: 'Loratadine 10 mg',
    genericName: 'Loratadine',
    category: 'Antihistamine (OTC)',
    dosage: '10 mg',
    form: 'Tablet',
    stock: 64,
    price: 'Rp 2.000',
    prescription: 'Not required',
    status: 'In Stock',
  },
  'loratadine-10 has the approved fields',
)

// Default state returns all rows in supplied order.
assert.deepEqual(filterMedications(DEFAULTS).map((medication) => medication.id), MEDICATIONS.map((medication) => medication.id))
assert.ok(isDefaultMedicationFilters(DEFAULTS))
assert.equal(isDefaultMedicationFilters({ ...DEFAULTS, query: 'para' }), false)
assert.equal(isDefaultMedicationFilters({ ...DEFAULTS, tab: 'otc' }), false)

// Search matches name, generic name, and category, case-insensitively.
assert.ok(medicationMatches(MEDICATIONS[0], 'PARACETAMOL'))
assert.ok(medicationMatches(MEDICATIONS[7], 'salbutamol sulfate'), 'generic name is searchable')
assert.ok(medicationMatches(MEDICATIONS[1], 'antibiotic'), 'category is searchable')
assert.ok(!medicationMatches(MEDICATIONS[0], 'amox'))
assert.ok(medicationMatches(MEDICATIONS[0], '   '), 'blank query matches everything')
assert.equal(filterMedications({ ...DEFAULTS, query: '  OTC ' }).length, 4, 'search is trimmed and case-insensitive')

// Category and status filters, alone and together (intersection semantics).
assert.deepEqual(
  filterMedications({ ...DEFAULTS, category: 'Analgesic (OTC)' }).map((medication) => medication.id),
  ['paracetamol-500', 'ibuprofen-400'],
)
assert.deepEqual(
  filterMedications({ ...DEFAULTS, status: 'Low Stock' }).map((medication) => medication.id),
  ['ibuprofen-400', 'metformin-500', 'salbutamol-inhaler'],
)
assert.deepEqual(
  filterMedications({ ...DEFAULTS, category: 'Analgesic (OTC)', status: 'In Stock' }).map((medication) => medication.id),
  ['paracetamol-500'],
)
assert.deepEqual(
  filterMedications({ ...DEFAULTS, category: 'Antibiotic', status: 'Out of Stock' }),
  [],
  'contradictory filters return no rows',
)

// Tabs: prescription and OTC split the rows; supplements and supplies have no supplied rows.
assert.deepEqual(
  filterMedications({ ...DEFAULTS, tab: 'prescription' }).map((medication) => medication.id),
  ['amoxicillin-500', 'omeprazole-20', 'amlodipine-5', 'metformin-500', 'salbutamol-inhaler'],
  'Prescription Only returns only Required rows',
)
assert.ok(
  filterMedications({ ...DEFAULTS, tab: 'prescription' }).every((medication) => medication.prescription === 'Required'),
)
assert.deepEqual(
  filterMedications({ ...DEFAULTS, tab: 'otc' }).map((medication) => medication.id),
  ['paracetamol-500', 'ibuprofen-400', 'cetirizine-10', 'loratadine-10'],
  'Over the Counter returns only supplied OTC rows',
)
assert.ok(
  filterMedications({ ...DEFAULTS, tab: 'otc' }).every((medication) => medication.prescription === 'Not required'),
)
assert.deepEqual(filterMedications({ ...DEFAULTS, tab: 'supplements' }), [], 'no supplement rows were supplied')
assert.deepEqual(filterMedications({ ...DEFAULTS, tab: 'supplies' }), [], 'no medical supply rows were supplied')
assert.ok(tabHasNoSuppliedRows('supplements') && tabHasNoSuppliedRows('supplies'))
assert.ok(!tabHasNoSuppliedRows('all') && !tabHasNoSuppliedRows('prescription') && !tabHasNoSuppliedRows('otc'))

// Status is explicit fixture data, not a threshold calculation:
// Metformin (85) is Low Stock while Cetirizine (150) is In Stock.
assert.equal(MEDICATIONS[5].status, 'Low Stock')
assert.equal(MEDICATIONS[6].status, 'In Stock')
assert.equal(MEDICATIONS[3].status, 'Out of Stock')

// Global count equals the supplied count; no phantom inventory is claimed.
assert.equal(MEDICATION_GLOBAL_COUNT, 9)
assert.equal(MEDICATION_GLOBAL_COUNT, MEDICATIONS.length)
assert.equal(MEDICATION_PAGE_SIZE, 8, 'default page size is eight')
assert.ok(MEDICATION_PAGE_SIZE <= MEDICATIONS.length, 'page size is supported by the supplied rows')

// Option lists are fixture-derived and complete.
assert.equal(MEDICATION_CATEGORIES.length, new Set(MEDICATIONS.map((medication) => medication.category)).size)
assert.deepEqual([...MEDICATION_STATUSES], ['In Stock', 'Low Stock', 'Out of Stock'])
assert.equal(MEDICATION_TABS[0].key, 'all', 'All Medications starts active')
assert.equal(MEDICATION_TABS.length, 5)

// Pagination helpers over the default filtered list (9 rows, page size 8).
assert.equal(totalPages(9, 8), 2, 'nine rows at size 8 make two pages')
assert.deepEqual(
  visibleRows(MEDICATIONS, 1, 8).map((medication) => medication.id),
  MEDICATIONS.slice(0, 8).map((medication) => medication.id),
  'page 1 shows the first eight rows',
)
assert.deepEqual(
  visibleRows(MEDICATIONS, 2, 8).map((medication) => medication.id),
  ['loratadine-10'],
  'page 2 shows only loratadine',
)
assert.deepEqual(visibleRows(MEDICATIONS, 3, 8), [], 'page 3 has no rows')
assert.equal(totalPages(0, 8), 1, 'no rows still yields one page')
assert.deepEqual(visibleRows(MEDICATIONS, 1, 8), [...visibleRows(MEDICATIONS, 1, 8)], 'slicing is stable')

// Previous/Next boundaries clamp, never below 1 or beyond the last page.
assert.equal(clampPage(0, 2), 1, 'page clamps at 1')
assert.equal(clampPage(3, 2), 2, 'page clamps at totalPages')
assert.equal(clampPage(2, 2), 2)
assert.equal(clampPage(1, 5), 1)

// Page size 5 yields two pages of five and four rows.
assert.equal(totalPages(9, 5), 2)
assert.equal(visibleRows(MEDICATIONS, 1, 5).length, 5, 'size 5 page 1 has five rows')
assert.equal(visibleRows(MEDICATIONS, 2, 5).length, 4, 'size 5 page 2 has four rows')

// Filters shorter than one page collapse to a single page.
assert.equal(totalPages(filterMedications({ ...DEFAULTS, tab: 'prescription' }).length, 8), 1, 'five rows fit one page')
assert.equal(totalPages(0, 5), 1, 'empty filter result is one page')
assert.equal(visibleRows(filterMedications({ ...DEFAULTS, tab: 'supplies' }), 1, 5).length, 0, 'empty filter shows no rows')

// Showing-count copy reports the filtered range truthfully.
assert.equal(showingRangeText(9, 1, 8), 'Showing 1–8 of 9 medications')
assert.equal(showingRangeText(9, 2, 8), 'Showing 9–9 of 9 medications')
assert.equal(showingRangeText(0, 1, 8), 'Showing 0 of 0 medications')

// Helpers do not mutate fixtures.
const snapshot = JSON.stringify(MEDICATIONS)
filterMedications({ ...DEFAULTS, query: 'a', category: 'Cardiovascular', status: 'In Stock', tab: 'prescription' })
assert.equal(JSON.stringify(MEDICATIONS), snapshot, 'fixtures are not mutated')

console.log('pharmacy checks passed')
