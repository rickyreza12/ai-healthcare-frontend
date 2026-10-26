import assert from 'node:assert/strict'
import {
  METRICS,
  NAV_ITEMS,
  PATIENT_TYPES,
  RECENT_PATIENTS,
  TODAYS_APPOINTMENTS,
  VISIT_TREND,
} from './dashboard/dashboardData.ts'
import {
  duplicateValues,
  appointmentKey,
  findAppointment,
  findPatient,
  formatDashboardDate,
  getDashboardGreeting,
  searchFixtures,
  sumPatientTypes,
} from './dashboard/dashboardLogic.ts'

assert.equal(duplicateValues(NAV_ITEMS.map((item) => item.key)).length, 0, 'nav keys are unique')
assert.equal(duplicateValues(NAV_ITEMS.map((item) => item.label)).length, 0, 'nav labels are unique')
assert.equal(
  duplicateValues(NAV_ITEMS.flatMap((item) => (item.route ? [item.route] : []))).length,
  0,
  'implemented routes are unique',
)
assert.ok(NAV_ITEMS.every((item) => item.route !== null), 'every workspace destination has a route')
assert.ok(NAV_ITEMS.every((item) => item.label.trim().length > 0), 'nav labels are non-empty')

assert.equal(sumPatientTypes(PATIENT_TYPES), 124, 'patient types total matches the patient count')
assert.deepEqual(PATIENT_TYPES.map((type) => type.percent), [38, 23, 16, 14, 8])
assert.deepEqual(METRICS.map((metric) => metric.value), [124, 36, 6, 2])
assert.equal(VISIT_TREND.length, 7, 'visit trend covers a week')
assert.ok(
  VISIT_TREND.every((day) => day.inpatient >= day.outpatient),
  'inpatient series stays above outpatient in the supplied fixture',
)

assert.deepEqual(searchFixtures('   ', RECENT_PATIENTS, TODAYS_APPOINTMENTS), [], 'blank query returns nothing')
assert.equal(searchFixtures('siti', RECENT_PATIENTS, TODAYS_APPOINTMENTS).length, 1, 'patient matched once')
assert.equal(searchFixtures('P-00067890', RECENT_PATIENTS, TODAYS_APPOINTMENTS)[0]?.name, 'Muhammad Rizki')
assert.ok(
  searchFixtures('prenatal', RECENT_PATIENTS, TODAYS_APPOINTMENTS).some((result) => result.name === 'Anita Dewi'),
  'appointment-only matches are searchable',
)
const broadMatches = searchFixtures('a', RECENT_PATIENTS, TODAYS_APPOINTMENTS)
assert.ok(broadMatches.length > 0, 'substring search returns matches')
assert.equal(
  new Set(broadMatches.map((result) => result.name)).size,
  broadMatches.length,
  'search results are deduplicated by name',
)
assert.ok(
  duplicateValues(RECENT_PATIENTS.map((patient) => patient.id)).length === 0,
  'patient identifiers are unique',
)

assert.equal(formatDashboardDate(new Date(2025, 4, 13)), 'Today is Tuesday, 13 May 2025', 'hero date matches the approved copy')
assert.equal(formatDashboardDate(new Date(2026, 9, 9)), 'Today is Friday, 9 October 2026', 'single-digit days are not padded')
assert.equal(formatDashboardDate(new Date(2026, 11, 31)), 'Today is Thursday, 31 December 2026', 'year boundaries stay correct')

assert.equal(getDashboardGreeting(new Date(2026, 9, 19, 4, 59)), 'Good Evening', 'evening holds before 05:00')
assert.equal(getDashboardGreeting(new Date(2026, 9, 19, 5, 0)), 'Good Morning', 'morning starts at 05:00')
assert.equal(getDashboardGreeting(new Date(2026, 9, 19, 11, 59)), 'Good Morning', 'morning ends at 11:59')
assert.equal(getDashboardGreeting(new Date(2026, 9, 19, 12, 0)), 'Good Afternoon', 'afternoon starts at 12:00')
assert.equal(getDashboardGreeting(new Date(2026, 9, 19, 17, 59)), 'Good Afternoon', 'afternoon ends at 17:59')
assert.equal(getDashboardGreeting(new Date(2026, 9, 19, 18, 0)), 'Good Evening', 'evening starts at 18:00')

const appointmentKeys = TODAYS_APPOINTMENTS.map((appointment) => appointmentKey(appointment))
assert.equal(duplicateValues(appointmentKeys).length, 0, 'appointment keys are unique')
assert.ok(
  appointmentKeys.every((key) => /^[a-z0-9-]+$/.test(key)),
  'appointment keys are URL-safe',
)
assert.equal(
  appointmentKey(TODAYS_APPOINTMENTS[0]),
  appointmentKey({ ...TODAYS_APPOINTMENTS[0] }),
  'appointment keys are deterministic',
)
assert.ok(
  TODAYS_APPOINTMENTS.every((appointment) => findAppointment(TODAYS_APPOINTMENTS, appointmentKey(appointment)) === appointment),
  'every appointment resolves from its own key',
)
assert.equal(findAppointment(TODAYS_APPOINTMENTS, 'no-such-appointment'), undefined, 'unknown appointment keys resolve to nothing')
assert.ok(
  TODAYS_APPOINTMENTS.every((appointment) => findPatient(RECENT_PATIENTS, appointment.patientId) !== undefined),
  'appointments reference known patients',
)
assert.equal(findPatient(RECENT_PATIENTS, RECENT_PATIENTS[0].id), RECENT_PATIENTS[0], 'known patient IDs resolve')
assert.equal(findPatient(RECENT_PATIENTS, 'P-00000000'), undefined, 'unknown patient IDs resolve to nothing')

console.log('dashboard checks passed')
