import assert from 'node:assert/strict'
import { DIRECTORY_PATIENTS, DIRECTORY_TABS, DIRECTORY_TOTAL, type DirectoryStatus } from './dashboard/patients/patientDirectoryData.ts'
import {
  DEFAULT_DIRECTORY_FILTERS,
  DIRECTORY_PAGE_SIZE,
  directoryDepartments,
  directoryPageWindow,
  directoryVisitDates,
  filterDirectoryPatients,
  isDefaultDirectoryFilters,
  patientAgeLabel,
  patientIdLabel,
  searchDirectoryPatients,
  statusTabKey,
  tabStatus,
} from './dashboard/patients/patientDirectoryLogic.ts'

const ids = DIRECTORY_PATIENTS.map((patient) => patient.id)
assert.equal(ids.length, DIRECTORY_TOTAL, 'the dataset holds every patient the summary counts')
assert.equal(new Set(ids).size, ids.length, 'directory patient identifiers are unique')
assert.equal(
  new Set(DIRECTORY_PATIENTS.map((patient) => patient.name)).size,
  ids.length,
  'generated names stay unique',
)

assert.equal(DIRECTORY_TOTAL, 1248, 'the global directory count matches the reference summary')
const statusTabs = DIRECTORY_TABS.filter((tab) => tab.key !== 'all')
assert.equal(
  statusTabs.reduce((total, tab) => total + tab.count, 0),
  DIRECTORY_TOTAL,
  'status summary counts add up to the global directory count',
)
for (const tab of statusTabs) {
  assert.equal(
    DIRECTORY_PATIENTS.filter((patient) => patient.status === tab.key).length,
    tab.count,
    `the ${tab.label} tab count matches the rows it filters to`,
  )
}
assert.equal(DIRECTORY_TOTAL / DIRECTORY_PAGE_SIZE, 156, 'the directory splits into the 156 pages the footer shows')

assert.deepEqual(
  filterDirectoryPatients(DIRECTORY_PATIENTS, DEFAULT_DIRECTORY_FILTERS),
  DIRECTORY_PATIENTS,
  'default filters return every sample row',
)
assert.ok(isDefaultDirectoryFilters(DEFAULT_DIRECTORY_FILTERS), 'the default filter set is recognised as default')
assert.ok(
  !isDefaultDirectoryFilters({ ...DEFAULT_DIRECTORY_FILTERS, status: 'Inpatient' }),
  'changing a filter leaves the default state',
)

for (const status of ['Inpatient', 'Outpatient', 'Emergency', 'Follow-up'] as const) {
  const rows = filterDirectoryPatients(DIRECTORY_PATIENTS, { ...DEFAULT_DIRECTORY_FILTERS, status })
  assert.ok(rows.length > 0, `${status} has sample rows`)
  assert.ok(
    rows.every((patient) => patient.status === status),
    `${status} filtering returns only that status`,
  )
  assert.equal(tabStatus(statusTabKey(status)), status, `${status} survives a tab round trip`)
}
assert.equal(tabStatus('all'), 'All', 'the All Patients tab maps to the unfiltered status')
assert.equal(
  filterDirectoryPatients(DIRECTORY_PATIENTS, { ...DEFAULT_DIRECTORY_FILTERS, status: 'Emergency' }).length,
  48,
  'Emergency matches its summary count',
)

const departments = directoryDepartments(DIRECTORY_PATIENTS)
assert.deepEqual(departments, [...departments].sort((a, b) => a.localeCompare(b)), 'departments are sorted')
assert.deepEqual(
  [...new Set(DIRECTORY_PATIENTS.map((patient) => patient.unit))].sort((a, b) => a.localeCompare(b)),
  departments,
  'departments come from the supplied unit values only',
)
for (const department of departments) {
  const rows = filterDirectoryPatients(DIRECTORY_PATIENTS, { ...DEFAULT_DIRECTORY_FILTERS, department })
  assert.ok(rows.length > 0, `${department} has sample rows`)
  assert.ok(
    rows.every((patient) => patient.unit === department),
    `${department} filtering returns only that unit`,
  )
}

const dates = directoryVisitDates(DIRECTORY_PATIENTS)
assert.equal(new Set(dates).size, dates.length, 'visit-date choices are unique')
assert.ok(
  dates.every((date) => DIRECTORY_PATIENTS.some((patient) => patient.lastVisit === date)),
  'visit-date choices come from the supplied last-visit values',
)
const sharedDate = filterDirectoryPatients(DIRECTORY_PATIENTS, { ...DEFAULT_DIRECTORY_FILTERS, visitDate: '17 Oct 2026' })
assert.ok(sharedDate.length > 2, 'a shared visit date keeps every matching row')
assert.ok(
  sharedDate.every((patient) => patient.lastVisit === '17 Oct 2026'),
  'a shared visit date returns only that date',
)

const combined = filterDirectoryPatients(DIRECTORY_PATIENTS, {
  status: 'Inpatient' as DirectoryStatus,
  department: 'Maternity',
  visitDate: '20 Oct 2026',
})
assert.ok(combined.length > 0, 'combined filters intersect')
assert.ok(
  combined.every(
    (patient) => patient.status === 'Inpatient' && patient.unit === 'Maternity' && patient.lastVisit === '20 Oct 2026',
  ),
  'combined filters keep only rows that satisfy every condition',
)
assert.ok(combined.some((patient) => patient.name === 'Siti Aisyah'), 'the intersection keeps the reference patient')
assert.equal(
  filterDirectoryPatients(DIRECTORY_PATIENTS, { status: 'Outpatient', department: 'Oncology', visitDate: 'All' }).length,
  0,
  'a department with no records returns nothing',
)

assert.deepEqual(searchDirectoryPatients(DIRECTORY_PATIENTS, '   '), [], 'blank search returns nothing')
assert.equal(searchDirectoryPatients(DIRECTORY_PATIENTS, 'siti aisyah')[0]?.id, 'P-00012345', 'name search is case-insensitive')
assert.equal(searchDirectoryPatients(DIRECTORY_PATIENTS, 'SITI')[0]?.name, 'Siti Aisyah', 'uppercase search resolves the same patient')
assert.equal(searchDirectoryPatients(DIRECTORY_PATIENTS, 'P-00012350')[0]?.name, 'Kayla Putri', 'an exact ID resolves')
assert.equal(searchDirectoryPatients(DIRECTORY_PATIENTS, '12351')[0]?.name, 'Dewi Lestari', 'a partial ID resolves')
assert.deepEqual(searchDirectoryPatients(DIRECTORY_PATIENTS, 'P-00099999'), [], 'an unknown ID resolves to nothing')
assert.ok(searchDirectoryPatients(DIRECTORY_PATIENTS, 'a').length > 100, 'a broad single-letter search matches many names')

// Page one stays the approved reference page; later pages come from the generated filler.
const pageOne = DIRECTORY_PATIENTS.slice(0, DIRECTORY_PAGE_SIZE)
assert.deepEqual(
  pageOne.map((patient) => patient.id),
  ['P-00012345', 'P-00012346', 'P-00012347', 'P-00012348', 'P-00012349', 'P-00012350', 'P-00012351', 'P-00012352'],
  'page one holds the eight supplied fixture rows in order',
)

const pages = (page: number, pageCount: number) =>
  directoryPageWindow(page, pageCount).map((item) => (item.kind === 'page' ? item.page : '…'))
assert.deepEqual(pages(1, 156), [1, 2, 3, 4, 5, '…', 156], 'the first page mirrors the reference footer')
assert.deepEqual(pages(78, 156), [1, '…', 76, 77, 78, 79, 80, '…', 156], 'a middle page keeps five neighbours')
assert.deepEqual(pages(156, 156), [1, '…', 152, 153, 154, 155, 156], 'the last page keeps the tail window')
assert.deepEqual(pages(1, 4), [1, 2, 3, 4], 'a short directory lists every page without gaps')
assert.deepEqual(pages(9, 3), [1, 2, 3], 'a stale page clamps to the last page')

assert.equal(patientIdLabel('P-00012345'), 'ID: P-00012345', 'identifiers render with the reference prefix')
assert.equal(patientAgeLabel(32), '32 years', 'ages render with the reference unit')

const portraits = DIRECTORY_PATIENTS.map((patient) => patient.avatar)
assert.equal(new Set(pageOne.map((patient) => patient.avatar)).size, 8, 'the reference page shows each supplied portrait once')
assert.equal(new Set(portraits).size, 8, 'generated rows reuse the supplied portraits only')
assert.equal(
  new Set(DIRECTORY_PATIENTS.map((patient) => patient.doctorAvatar)).size,
  8,
  'every attending clinician has its own supplied portrait',
)

console.log('patient directory checks passed')
