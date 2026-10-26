import assert from 'node:assert/strict'
import { NAV_ITEMS, RECENT_PATIENTS } from './dashboard/dashboardData.ts'
import { duplicateValues } from './dashboard/dashboardLogic.ts'
import {
  DOCTOR_NOTE,
  LATEST_ULTRASOUND,
  MATERNAL_HEALTH,
  MATERNITY_DOCUMENTS,
  MATERNITY_EDUCATION,
  MATERNITY_EDUCATION_DISCLAIMER,
  MATERNITY_MEDICAL_RECORDS,
  MATERNITY_PATIENT,
  MATERNITY_TAB_KEYS,
  MATERNITY_TABS,
  MATERNITY_VISIT_HISTORY,
  NEXT_APPOINTMENT,
  PRENATAL_CHECKLIST,
  PREGNANCY_PROGRESS,
} from './dashboard/maternity/maternityData.ts'
import {
  checklistCounts,
  filterChecklist,
  findChecklistItem,
  findEducationResource,
  findMaternityDocument,
  findMaternityRecord,
  maternityTabHref,
  parseMaternityTab,
  progressPercent,
  unavailableNotice,
} from './dashboard/maternity/maternityLogic.ts'
import { DIRECTORY_PATIENTS } from './dashboard/patients/patientDirectoryData.ts'

// The supplied maternity fixture reuses an ID that the dashboard already assigns to another person.
// The fixture stays a separate record, so this pins both halves of that separation.
assert.equal(MATERNITY_PATIENT.id, 'P-00012345', 'the maternity fixture keeps its supplied ID')
assert.equal(MATERNITY_PATIENT.name, 'Siti Nurhaliza', 'the maternity fixture keeps its supplied name')
assert.ok(
  DIRECTORY_PATIENTS.every((patient) => patient.name !== MATERNITY_PATIENT.name),
  'the maternity fixture is not a directory patient',
)
const clashingRecent = RECENT_PATIENTS.find((patient) => patient.id === MATERNITY_PATIENT.id)
assert.ok(clashingRecent, 'the dashboard patient list still owns that ID')
assert.notEqual(clashingRecent.name, MATERNITY_PATIENT.name, 'the two records stay distinct people')

assert.deepEqual(
  [...MATERNITY_TABS],
  ['Overview', 'Medical Records', 'Appointments', 'Checklists', 'Education', 'Documents'],
  'supplied tab order and labels are preserved',
)

// Supplied strings stay display copy: they must never be recomputed from the device clock.
assert.equal(PREGNANCY_PROGRESS.gestationalAge, '32 weeks 4 days', 'gestational age is the supplied string')
assert.equal(PREGNANCY_PROGRESS.estimatedDueDate, 'EDD: 20 Dec 2026', 'due date is the supplied string')
assert.equal(PREGNANCY_PROGRESS.countdown, '(7 weeks 3 days left)', 'countdown is the supplied string')
assert.equal(Math.round(PREGNANCY_PROGRESS.currentWeek * 7), 228, 'current week encodes the supplied 32 weeks 4 days')

assert.equal(progressPercent(32.57, 40), 81, 'the bar plots the supplied week on the supplied scale')
assert.equal(progressPercent(50, 40), 100, 'the plotted fraction is clamped at the scale end')
assert.equal(progressPercent(-1, 40), 0, 'the plotted fraction is clamped at the scale start')
assert.equal(progressPercent(1, 0), 0, 'a zero scale cannot divide')

assert.equal(MATERNAL_HEALTH.length, 4, 'four maternal metrics are supplied')
assert.deepEqual(
  MATERNAL_HEALTH.map((metric) => [metric.value, metric.unit, metric.label]),
  [
    ['62.5', 'kg', 'Current Weight'],
    ['120/80', 'mmHg', 'Blood Pressure'],
    ['72', 'bpm', 'Heart Rate'],
    ['36.6', '°C', 'Body Temperature'],
  ],
  'maternal metric values and labels match the reference',
)
assert.equal(MATERNAL_HEALTH[0]?.supporting, '+5.2 kg', 'the supplied total weight change is kept')
assert.equal(MATERNAL_HEALTH[0]?.supportingLabel, 'total change', 'the weight change caption is kept')

assert.equal(PRENATAL_CHECKLIST.length, 5, 'five checklist items are supplied')
assert.deepEqual(
  PRENATAL_CHECKLIST.map((item) => [item.label, item.status, item.date]),
  [
    ['First Trimester Screening', 'Completed', '12 Jun 2026'],
    ['Anomaly Scan (USG)', 'Completed', '28 Aug 2026'],
    ['Blood Test (3rd Trimester)', 'Due Soon', '20 Oct 2026'],
    ['Tdap Vaccination', 'Pending', '20 Oct 2026'],
    ['Group B Strep Test', 'Pending', '4 Nov 2026'],
  ],
  'checklist order, statuses, and dates match the reference',
)
assert.deepEqual(
  checklistCounts(PRENATAL_CHECKLIST),
  { Completed: 2, 'Due Soon': 1, Pending: 2 },
  'checklist status counts follow the supplied data',
)
assert.equal(duplicateValues(PRENATAL_CHECKLIST.map((item) => item.id)).length, 0, 'checklist ids are unique')
assert.ok(PRENATAL_CHECKLIST.every((item) => /^[a-z0-9-]+$/.test(item.id)), 'checklist ids are URL-safe')

const anomalyScan = findChecklistItem(PRENATAL_CHECKLIST, 'anomaly-scan')
assert.equal(anomalyScan?.label, 'Anomaly Scan (USG)', 'a checklist item resolves by id')
assert.equal(findChecklistItem(PRENATAL_CHECKLIST, null), undefined, 'a missing selection resolves to nothing')
assert.equal(findChecklistItem(PRENATAL_CHECKLIST, 'not-a-fixture'), undefined, 'an unknown id resolves to nothing')

assert.equal(NEXT_APPOINTMENT.type, 'Routine Check-up', 'appointment type is supplied')
assert.equal(NEXT_APPOINTMENT.time, '09:00 – 09:30 AM', 'appointment time is supplied')
assert.equal(NEXT_APPOINTMENT.clinician, 'Dr. Sari Melati, Sp.OG', 'appointment clinician is supplied')
assert.equal(NEXT_APPOINTMENT.room, 'Room 201', 'appointment room is supplied')

assert.equal(DOCTOR_NOTE.clinician, 'Dr. Sari Melati, Sp.OG', 'the note keeps its supplied clinician')
assert.equal(DOCTOR_NOTE.recorded, '20 Oct 2026', 'the note keeps its supplied date')
assert.ok(DOCTOR_NOTE.body.startsWith('Patient is doing well.'), 'the note keeps its supplied text')

assert.equal(LATEST_ULTRASOUND.caption.length, 2, 'the ultrasound caption has two supplied lines')

const notice = unavailableNotice('Education')
assert.equal(notice.title, 'Education', 'an unavailable notice names the control')
assert.ok(notice.body.length > 0, 'an unavailable notice explains itself')

assert.equal(NAV_ITEMS.find((item) => item.key === 'maternity')?.route, '/dashboard/maternity', 'maternity navigation is now real')
assert.equal(duplicateValues(NAV_ITEMS.map((item) => item.key)).length, 0, 'navigation keys are unique')
const routes = NAV_ITEMS.map((item) => item.route).filter((route): route is string => route !== null)
assert.equal(duplicateValues(routes).length, 0, 'implemented navigation routes are unique')

assert.deepEqual(
  MATERNITY_TAB_KEYS.map((entry) => entry.key),
  ['overview', 'medical-records', 'appointments', 'checklists', 'education', 'documents'],
  'tab keys are stable',
)
assert.equal(parseMaternityTab(null), 'overview', 'missing tab state falls back to Overview')
assert.equal(parseMaternityTab('not-a-tab'), 'overview', 'unknown tab state falls back to Overview')
assert.equal(parseMaternityTab('documents'), 'documents', 'a known tab state resolves')
assert.equal(maternityTabHref('overview'), '/dashboard/maternity', 'Overview uses the base route')
assert.equal(maternityTabHref('education'), '/dashboard/maternity?tab=education', 'other tabs use a query parameter')

assert.equal(MATERNITY_MEDICAL_RECORDS.length, 4, 'four medical records are supplied')
assert.deepEqual(
  MATERNITY_MEDICAL_RECORDS.map((record) => [record.id, record.type, record.date, record.status]),
  [
    ['maternity-record-2026-10-20-prenatal-checkup', 'Prenatal Visit', '20 Oct 2026', 'Completed'],
    ['maternity-record-2026-10-20-ultrasound', 'Ultrasound', '20 Oct 2026', 'Completed'],
    ['maternity-record-2026-08-28-anomaly-scan', 'Screening', '28 Aug 2026', 'Completed'],
    ['maternity-record-2026-10-20-doctor-note', 'Clinical Note', '20 Oct 2026', 'Completed'],
  ],
  'medical record order, ids, types, dates, and statuses match the approved fixtures',
)
const ultrasoundRecord = findMaternityRecord('maternity-record-2026-10-20-ultrasound')
assert.equal(ultrasoundRecord?.detail.find((fact) => fact.label === 'Estimated fetal weight')?.value, 'Approximately 1.8 kg', 'the ultrasound record keeps its supplied detail')
assert.equal(findMaternityRecord('not-a-record'), undefined, 'an unknown medical record id resolves to nothing')
assert.equal(MATERNITY_MEDICAL_RECORDS.at(-1)?.summary, DOCTOR_NOTE.body, 'the clinical note record reuses the supplied note body')

assert.equal(MATERNITY_VISIT_HISTORY.length, 3, 'three historical visits are supplied')
assert.deepEqual(
  MATERNITY_VISIT_HISTORY.map((visit) => [visit.date, visit.title]),
  [
    ['20 Oct 2026', 'Routine Prenatal Check-up'],
    ['28 Aug 2026', 'Anomaly Scan Review'],
    ['12 Jun 2026', 'First Trimester Screening'],
  ],
  'visit history keeps the approved order and titles',
)

assert.equal(filterChecklist(PRENATAL_CHECKLIST, 'All').length, 5, 'the All filter keeps every checklist item')
assert.equal(filterChecklist(PRENATAL_CHECKLIST, 'Completed').length, 2, 'the Completed filter keeps two items')
assert.equal(filterChecklist(PRENATAL_CHECKLIST, 'Due Soon').length, 1, 'the Due Soon filter keeps one item')
assert.equal(filterChecklist(PRENATAL_CHECKLIST, 'Pending').length, 2, 'the Pending filter keeps two items')
assert.deepEqual(
  filterChecklist(PRENATAL_CHECKLIST, 'Pending').map((item) => item.id),
  ['tdap-vaccination', 'group-b-strep-test'],
  'filtering preserves fixture order',
)

assert.equal(MATERNITY_EDUCATION.length, 4, 'four education resources are supplied')
assert.deepEqual(
  MATERNITY_EDUCATION.map((resource) => resource.id),
  [
    'education-third-trimester-nutrition',
    'education-birth-plan',
    'education-signs-of-labor',
    'education-urgent-care',
  ],
  'education ids match the approved fixtures',
)
assert.ok(
  MATERNITY_EDUCATION.every((resource) => resource.summary.length > 0),
  'every education resource keeps its approved summary',
)
assert.equal(
  findEducationResource('education-birth-plan')?.summary,
  'A read-only worksheet overview for preferences to discuss with the maternity care team.',
  'an education resource resolves by id',
)
assert.equal(findEducationResource('not-a-resource'), undefined, 'an unknown education id resolves to nothing')
assert.ok(MATERNITY_EDUCATION_DISCLAIMER.startsWith('Synthetic education preview.'), 'the education disclaimer is present')

assert.equal(MATERNITY_DOCUMENTS.length, 4, 'four document metadata entries are supplied')
assert.deepEqual(
  MATERNITY_DOCUMENTS.map((document) => [document.id, document.availability]),
  [
    ['document-ultrasound-summary-2026-10-20', 'Metadata only'],
    ['document-prenatal-visit-note-2026-10-20', 'Metadata only'],
    ['document-anomaly-scan-2026-08-28', 'Metadata only'],
    ['document-birth-plan-worksheet', 'Metadata only'],
  ],
  'document ids and availability match the approved fixtures',
)
assert.equal(findMaternityDocument('document-birth-plan-worksheet')?.date, 'Not completed', 'the unfinished worksheet keeps its status')
assert.equal(findMaternityDocument('not-a-document'), undefined, 'an unknown document id resolves to nothing')

assert.equal(duplicateValues(MATERNITY_MEDICAL_RECORDS.map((record) => record.id)).length, 0, 'medical record ids are unique')
assert.equal(duplicateValues(MATERNITY_VISIT_HISTORY.map((visit) => visit.id)).length, 0, 'visit ids are unique')
assert.equal(duplicateValues(MATERNITY_EDUCATION.map((resource) => resource.id)).length, 0, 'education ids are unique')
assert.equal(duplicateValues(MATERNITY_DOCUMENTS.map((document) => document.id)).length, 0, 'document ids are unique')
assert.ok(MATERNITY_MEDICAL_RECORDS.every((record) => record.id.startsWith('maternity-record-')), 'medical records stay in the maternity domain')
assert.ok(MATERNITY_VISIT_HISTORY.every((visit) => visit.id.startsWith('maternity-visit-')), 'visits stay in the maternity domain')

// Helpers read fixtures only; a mutation would show up as a changed snapshot.
const checklistSnapshot = JSON.stringify(PRENATAL_CHECKLIST)
const metricsSnapshot = JSON.stringify(MATERNAL_HEALTH)
const recordsSnapshot = JSON.stringify(MATERNITY_MEDICAL_RECORDS)
const educationSnapshot = JSON.stringify(MATERNITY_EDUCATION)
const documentsSnapshot = JSON.stringify(MATERNITY_DOCUMENTS)
checklistCounts(PRENATAL_CHECKLIST)
filterChecklist(PRENATAL_CHECKLIST, 'Completed')
findChecklistItem(PRENATAL_CHECKLIST, 'tdap-vaccination')
findMaternityRecord('maternity-record-2026-08-28-anomaly-scan')
findEducationResource('education-signs-of-labor')
findMaternityDocument('document-anomaly-scan-2026-08-28')
parseMaternityTab('appointments')
progressPercent(PREGNANCY_PROGRESS.currentWeek, PREGNANCY_PROGRESS.totalWeeks)
assert.equal(JSON.stringify(PRENATAL_CHECKLIST), checklistSnapshot, 'checklist helpers do not mutate the fixture')
assert.equal(JSON.stringify(MATERNAL_HEALTH), metricsSnapshot, 'metric helpers do not mutate the fixture')
assert.equal(JSON.stringify(MATERNITY_MEDICAL_RECORDS), recordsSnapshot, 'record helpers do not mutate the fixture')
assert.equal(JSON.stringify(MATERNITY_EDUCATION), educationSnapshot, 'education helpers do not mutate the fixture')
assert.equal(JSON.stringify(MATERNITY_DOCUMENTS), documentsSnapshot, 'document helpers do not mutate the fixture')

console.log('maternity.check.ts passed')
