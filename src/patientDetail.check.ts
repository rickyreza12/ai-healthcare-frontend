import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  CLAIMS,
  DATA_DOMAINS,
  DETAIL_TABS,
  EVIDENCE_RECORDS,
  QUALITY_FRESHNESS,
  QUALITY_ISSUES,
  QUALITY_METRICS,
  QUALITY_RELIABILITY,
  REFERENCE_ALERTS,
  REFERENCE_AVAILABILITY,
  REFERENCE_CONTEXT,
  REFERENCE_DETAIL_ID,
  REFERENCE_IDENTITY,
  REFERENCE_OVERVIEW,
  REFERENCE_SOAP,
  REFERENCE_SOURCE_GROUPS,
  REFERENCE_TIMELINE,
  SUMMARY_SECTIONS,
  type DataDomainStatus,
  type SourceId,
} from './dashboard/patients/patientDetailData.ts'
import {
  ALL_SOURCES,
  availabilitySplit,
  detailHref,
  domainCounts,
  domainStatusLabel,
  domainStatusTone,
  evidenceForClaim,
  filterClaims,
  filterEvidenceBySource,
  appointmentDayLabel,
  filterPatientRecords,
  groupPatientRecords,
  medicalRecordsForPatient,
  parseDetailTab,
  parseSummarySection,
  patientAppointments,
  patientLabReports,
  patientVisitHistory,
  resolveActiveClaim,
  reviewedLabel,
  sectionHref,
} from './dashboard/patients/patientDetailLogic.ts'
import { MEDICAL_RECORDS, RECORD_CATEGORIES } from './dashboard/medicalRecords/medicalRecordData.ts'
import { LAB_FLAG_LABELS, LAB_SYNTHETIC_NOTICE, PATIENT_LAB_REPORTS } from './dashboard/patients/patientLabResultData.ts'

const tabKeys = DETAIL_TABS.map((tab) => tab.key)
assert.equal(tabKeys.length, 5, 'the reference exposes five detail tabs')
assert.equal(new Set(tabKeys).size, tabKeys.length, 'detail tab keys are unique')
assert.ok(tabKeys.includes('overview') && tabKeys.includes('ai-summary'), 'overview and AI summary exist')

assert.equal(SUMMARY_SECTIONS.length, 3, 'the AI summary workspace has three nested sections')
assert.deepEqual(
  SUMMARY_SECTIONS.map((section) => section.key),
  ['summary', 'evidence', 'data-quality'],
  'nested sections are Summary, Sources & Evidence, and Data Quality',
)

assert.equal(parseDetailTab('ai-summary'), 'ai-summary', 'a known tab value is kept')
assert.equal(parseDetailTab('nonsense'), 'overview', 'an unknown tab falls back to Overview')
assert.equal(parseDetailTab(null), 'overview', 'a missing tab falls back to Overview')
assert.equal(parseSummarySection('evidence'), 'evidence', 'a known section value is kept')
assert.equal(parseSummarySection('nonsense'), 'summary', 'an unknown section falls back to Summary')
assert.equal(parseSummarySection(undefined), 'summary', 'a missing section falls back to Summary')

assert.equal(detailHref('P-1', 'overview'), '/dashboard/patients/P-1', 'the default tab keeps the clean URL')
assert.equal(detailHref('P-1', 'ai-summary'), '/dashboard/patients/P-1?tab=ai-summary', 'non-default tabs carry the query')
assert.equal(sectionHref('P-1', 'summary'), '/dashboard/patients/P-1?tab=ai-summary', 'the default section keeps the summary URL')
assert.equal(sectionHref('P-1', 'data-quality'), '/dashboard/patients/P-1?tab=ai-summary&section=data-quality', 'other sections carry the section query')

assert.equal(REFERENCE_DETAIL_ID, 'P-00012345', 'the detail reference maps to the first directory row')
assert.equal(REFERENCE_IDENTITY.patientNumber, 'BDO01245', 'the detail reference supplies its own patient number')
assert.equal(REFERENCE_IDENTITY.emergencyContact.relation, 'Husband', 'the emergency contact relationship is supplied')

const overview = REFERENCE_OVERVIEW
assert.equal(overview.vitals.length, 4, 'four vital readings are supplied')
assert.ok(overview.vitals.every((vital) => vital.status === 'Normal'), 'every supplied vital reads Normal')
assert.equal(overview.allergies.length, 3, 'three allergies are supplied')
assert.equal(overview.medications.length, 3, 'three current medications are supplied')
assert.equal(overview.history.length, 4, 'four medical history entries are supplied')

assert.equal(REFERENCE_CONTEXT.length, 6, 'six clinical context cards are supplied')
assert.equal(REFERENCE_SOAP.length, 4, 'four SOAP blocks are supplied')
assert.deepEqual(REFERENCE_SOAP.map((note) => note.initial), ['S', 'O', 'A', 'P'], 'SOAP initials are S, O, A, P')
assert.equal(REFERENCE_TIMELINE.length, 4, 'four timeline entries are supplied')
assert.equal(REFERENCE_ALERTS.length, 3, 'three clinical alerts are supplied')
assert.deepEqual(REFERENCE_ALERTS.map((alert) => alert.level), ['high', 'medium', 'info'], 'alert levels are supplied in order')
assert.equal(REFERENCE_SOURCE_GROUPS.length, 4, 'four source groups are supplied')
assert.equal(REFERENCE_SOURCE_GROUPS[0].count, '12 records', 'source counts come from the reference')

const claimIds = CLAIMS.map((claim) => claim.id)
assert.equal(claimIds.length, 5, 'five AI-generated claims are supplied')
assert.equal(new Set(claimIds).size, claimIds.length, 'claim identifiers are unique')
assert.deepEqual(CLAIMS.map((claim) => claim.number), [1, 2, 3, 4, 5], 'claims are numbered one to five')

const sourceIds: readonly SourceId[] = ['S1', 'S2', 'S3', 'S4']
assert.deepEqual(EVIDENCE_RECORDS.map((record) => record.source), sourceIds, 'the four source records map to S1 to S4')
for (const claim of CLAIMS) {
  assert.ok(claim.sources.length > 0, `${claim.id} lists supporting sources`)
  assert.ok(
    claim.sources.every((source) => sourceIds.includes(source)),
    `${claim.id} only references known source records`,
  )
}

assert.equal(filterClaims(CLAIMS, ALL_SOURCES).length, 5, 'the All Sources filter keeps every claim')
for (const source of sourceIds) {
  const filtered = filterClaims(CLAIMS, source)
  assert.ok(
    filtered.every((claim) => claim.sources.includes(source)),
    `${source} filtering keeps only claims that cite it`,
  )
}

assert.equal(resolveActiveClaim(CLAIMS, 'C3')?.id, 'C3', 'a visible active claim is kept')
assert.equal(resolveActiveClaim(CLAIMS, 'MISSING')?.id, 'C1', 'a hidden active claim falls back to the first visible claim')
assert.equal(resolveActiveClaim([], 'C1'), undefined, 'an empty claim list resolves to undefined')

const evidence = evidenceForClaim(CLAIMS[0], EVIDENCE_RECORDS)
assert.equal(evidence.length, 4, 'the first claim is supported by all four records')
assert.equal(evidenceForClaim(undefined, EVIDENCE_RECORDS).length, 0, 'no claim yields no evidence')

assert.equal(filterEvidenceBySource(EVIDENCE_RECORDS, ALL_SOURCES).length, 4, 'the All Sources filter keeps every record')
const onlyS2 = filterEvidenceBySource(EVIDENCE_RECORDS, 'S2')
assert.equal(onlyS2.length, 1, 'filtering by a source shows one record')
assert.equal(onlyS2[0].source, 'S2', 'the filtered record is the chosen source')
assert.equal(
  filterEvidenceBySource(evidence, 'S3').length,
  1,
  'the source filter narrows a claim evidence list even when every claim cites every source',
)

const domainIds = DATA_DOMAINS.map((domain) => domain.id)
assert.equal(domainIds.length, 12, 'twelve data domains are supplied')
assert.equal(new Set(domainIds).size, domainIds.length, 'domain identifiers are unique')
assert.deepEqual(
  domainCounts(DATA_DOMAINS),
  { available: 6, partial: 0, 'not-integrated': 2, 'not-available': 4 },
  'domain states match the supplied totals',
)
assert.equal(domainStatusLabel('available'), 'Available', 'available maps to Available')
assert.equal(domainStatusLabel('partial'), 'Partial', 'partial maps to Partial')
assert.equal(domainStatusLabel('not-integrated'), 'Not Yet Integrated', 'not-integrated maps to Not Yet Integrated')
assert.equal(domainStatusLabel('not-available'), 'Not Available', 'not-available maps to Not Available')
assert.equal(domainStatusTone('available'), 'ok', 'available uses the ok tone')
assert.equal(domainStatusTone('partial'), 'warn', 'partial uses the warn tone')
assert.equal(domainStatusTone('not-integrated'), 'no', 'not-integrated uses the no tone')
const statusSample: DataDomainStatus = 'available'
assert.equal(domainStatusLabel(statusSample), 'Available', 'the status type is closed and exhaustive')

const split = availabilitySplit(REFERENCE_AVAILABILITY)
assert.equal(split.available.length, 4, 'four domains are written as available')
assert.equal(split.unavailable.length, 3, 'three domains are written as unavailable')
assert.ok(split.unavailable.includes('Laboratory'), 'Laboratory is written as unavailable')

assert.equal(QUALITY_RELIABILITY.score, 82, 'the overall reliability score is the supplied fixture')
assert.equal(QUALITY_RELIABILITY.scale, 100, 'the reliability scale is the supplied fixture')
assert.equal(QUALITY_RELIABILITY.status, 'High Reliability', 'the reliability status is the supplied fixture')

assert.equal(QUALITY_METRICS.length, 4, 'four supporting quality metrics are supplied')
assert.equal(new Set(QUALITY_METRICS.map((metric) => metric.id)).size, QUALITY_METRICS.length, 'quality metric identifiers are unique')
assert.deepEqual(
  QUALITY_METRICS.map((metric) => metric.value),
  ['78/100', '85/100', '80/100', '95/100'],
  'each metric renders its exact source value',
)

assert.equal(QUALITY_FRESHNESS.length, 5, 'five freshness records are supplied')
assert.equal(new Set(QUALITY_FRESHNESS.map((record) => record.id)).size, QUALITY_FRESHNESS.length, 'freshness identifiers are unique')
assert.deepEqual(
  QUALITY_FRESHNESS.map((record) => record.value),
  ['15 Oct 2026, 08:42', '20 Oct 2026 (5 days ago)', '12 Oct 2026 (8 days ago)', '20 Oct 2026 (5 days ago)', '15 Aug 2026 (2 months ago)'],
  'freshness values stay exactly as supplied and are never recalculated',
)

assert.equal(QUALITY_ISSUES.length, 4, 'four gap and conflict records are supplied')
assert.equal(new Set(QUALITY_ISSUES.map((issue) => issue.id)).size, QUALITY_ISSUES.length, 'issue identifiers are unique')
assert.deepEqual(
  QUALITY_ISSUES.map((issue) => issue.type),
  ['Missing Data', 'Missing Data', 'Data Conflict', 'Missing Data'],
  'issue types stay exactly as supplied',
)
assert.deepEqual(
  QUALITY_ISSUES.map((issue) => issue.impact),
  ['High', 'High', 'Medium', 'Medium'],
  'issue impacts stay exactly as supplied',
)

const sourceText = ['patientDetailData.ts', 'patientDetailLogic.ts', 'patientLabResultData.ts']
  .map((file) => readFileSync(new URL(`./dashboard/patients/${file}`, import.meta.url), 'utf8'))
  .join('\n')
for (const forbidden of ['Math.random', 'Date.now', 'new Date(', 'fetch(']) {
  assert.ok(!sourceText.includes(forbidden), `patient detail fixtures never use ${forbidden}`)
}

assert.equal(reviewedLabel(false), 'Mark Reviewed', 'the unreviewed label invites review')
assert.equal(reviewedLabel(true), 'Reviewed in this session', 'the reviewed label stays local and honest')

const patientRecords = medicalRecordsForPatient(REFERENCE_DETAIL_ID)
assert.equal(patientRecords.length, 9, 'the reference patient owns the nine supplied records')
assert.equal(medicalRecordsForPatient('P-00012399').length, 0, 'another patient never inherits the reference records')
assert.equal(patientRecords[0].id, 'record-2024-05-05-chest-x-ray', 'records stay newest first')

const groups = groupPatientRecords(patientRecords)
assert.deepEqual(groups.map((group) => group.month), ['May 2024', 'April 2024'], 'records group by supplied month')
assert.deepEqual(groups.map((group) => group.records.length), [5, 4], 'month groups keep every supplied record')

assert.equal(filterPatientRecords(patientRecords, 'all').length, 9, 'the all category keeps every record')
assert.equal(filterPatientRecords(patientRecords, 'lab').length, 2, 'two supplied lab-result records')
assert.equal(filterPatientRecords(patientRecords, 'imaging').length, 2, 'two supplied imaging records')
assert.equal(filterPatientRecords(patientRecords, 'prescriptions').length, 2, 'two supplied prescription records')
assert.equal(filterPatientRecords(patientRecords, 'documents').length, 1, 'one supplied document record')
assert.equal(filterPatientRecords(patientRecords, 'consultations').length, 2, 'two supplied consultation records')
assert.equal(new Set(RECORD_CATEGORIES.map((category) => category.key)).size, RECORD_CATEGORIES.length, 'category keys are unique')
assert.equal(MEDICAL_RECORDS.filter((record) => record.type === 'Lab Result').length, 2, 'lab rows derive from lab-result records only')

const referenceAppointments = patientAppointments(REFERENCE_DETAIL_ID)
assert.equal(referenceAppointments.length, 1, 'the reference patient owns one supplied schedule row')
assert.equal(referenceAppointments[0].id, 'schedule-ref-mon-12-0830-siti-aisyah', 'the supplied schedule row is kept')
assert.equal(appointmentDayLabel(referenceAppointments[0]), 'Mon 12 May', 'the supplied weekday copy is not recalculated')
assert.equal(patientAppointments('P-00012399').length, 0, 'another patient never inherits the reference appointment')

const referenceHistory = patientVisitHistory(REFERENCE_DETAIL_ID)
assert.deepEqual(referenceHistory, REFERENCE_OVERVIEW.history, 'visit history reuses the supplied patient-detail fixture')
assert.equal(referenceHistory.length, 4, 'the reference patient owns four supplied historical visits')
assert.deepEqual(
  referenceHistory.map((visit) => visit.date),
  ['10 May 2024', '12 Apr 2024', '15 Feb 2024', '20 Jan 2023'],
  'historical visits stay newest first',
)
assert.equal(referenceHistory[0].title, 'Routine Prenatal Check-up', 'the newest visit keeps its supplied title')
assert.equal(referenceHistory[0].clinician, 'Dr. Sari Melati', 'the newest visit keeps its supplied clinician')
assert.equal(referenceHistory[0].role, 'General Practitioner', 'the newest visit keeps its supplied role')
assert.equal(referenceHistory[0].note, 'Normal fetal growth. Continue current supplementation.', 'the newest visit keeps its supplied note')
assert.equal(referenceHistory[3].title, 'General Health Check-up', 'the oldest visit keeps its supplied title')
assert.equal(referenceHistory[3].date, '20 Jan 2023', 'the oldest visit keeps its supplied date')
assert.equal(patientVisitHistory('P-00012399').length, 0, 'another patient never inherits the reference visit history')

const labReports = patientLabReports(REFERENCE_DETAIL_ID)
assert.deepEqual(labReports.map((report) => report.id), ['lab-2024-05-03-cbc', 'lab-2024-04-28-urine-analysis'], 'two demo reports, newest first')
assert.equal(patientLabReports('P-00012399').length, 0, 'another patient never inherits the demo reports')
assert.equal(new Set(labReports.map((report) => report.id)).size, labReports.length, 'report identifiers are unique')

const recordIds = new Set(MEDICAL_RECORDS.map((record) => record.id))
for (const report of labReports) {
  assert.ok(recordIds.has(report.medicalRecordId), `${report.id} links to a supplied medical record`)
  assert.equal(report.status, 'Final', `${report.id} keeps its written status`)
  assert.ok(report.collectedAt.includes('2024'), `${report.id} keeps its supplied 2024 collection date`)
  assert.ok(report.analytes.length > 0, `${report.id} carries at least one analyte`)
  assert.equal(new Set(report.analytes.map((analyte) => analyte.id)).size, report.analytes.length, `${report.id} analyte ids are unique`)
  for (const analyte of report.analytes) {
    assert.ok(analyte.result.length > 0, `${analyte.id} keeps a written result`)
    assert.ok(analyte.referenceRange.length > 0, `${analyte.id} keeps a demo range`)
    assert.ok(analyte.flag in LAB_FLAG_LABELS, `${analyte.id} uses a known written flag`)
  }
}
assert.equal(labReports[0].analytes.length, 5, 'the CBC demo carries five analytes')
assert.equal(labReports[1].analytes.length, 9, 'the urine demo carries nine analytes')
assert.equal(
  labReports.flatMap((report) => report.analytes).filter((analyte) => analyte.unit === null).length,
  9,
  'tests without a unit keep null instead of a placeholder',
)
assert.ok(LAB_SYNTHETIC_NOTICE.includes('Synthetic demo results'), 'the demo notice is explicit')
assert.ok(LAB_SYNTHETIC_NOTICE.includes('not clinical records'), 'the demo notice denies clinical status')
assert.ok(PATIENT_LAB_REPORTS.every((report) => report.patientId === REFERENCE_DETAIL_ID), 'every demo report belongs to the reference patient')

const pageSource = readFileSync(new URL('./dashboard/patients/PatientDetailPage.tsx', import.meta.url), 'utf8')
for (const panel of ['MedicalRecordPanel', 'AppointmentsPanel', 'LabResultsPanel']) {
  assert.ok(pageSource.includes(panel), `${panel} renders real tab content`)
}
assert.ok(!pageSource.includes('The medical record list lives on its own page.'), 'the medical-record placeholder is gone')
assert.ok(!pageSource.includes('The reference reports no integrated laboratory domain for this patient.'), 'the lab placeholder is gone')
assert.ok(pageSource.includes('patientVisitHistory'), 'the appointments panel renders supplied visit history')
assert.ok(!pageSource.includes('No historical appointments are included'), 'the reference-patient visit-history empty state is gone')

const routeSource = readFileSync(new URL('./dashboard/patients/PatientDetailRoute.tsx', import.meta.url), 'utf8')
assert.ok(routeSource.includes('<PatientDetailPage />'), 'patient routes keep the existing patient detail display')
assert.ok(!routeSource.includes('PatientAiSummaryPage'), 'the standalone AI summary replacement is not routed')

const referenceSource = readFileSync(new URL('./dashboard/patients/PatientAiReferenceDialog.tsx', import.meta.url), 'utf8')
for (const asset of ['patient-ai-summary.svg', 'patient-sources-evidence.svg', 'patient-data-quality.svg']) {
  assert.ok(referenceSource.includes(asset), `${asset} is available in the AI reference modal`)
}

console.log('patient detail checks passed')
