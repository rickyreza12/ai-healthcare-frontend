import assert from 'node:assert/strict'
import {
  REFERENCE_APPOINTMENT_DETAIL,
  SCHEDULE_APPOINTMENTS,
  SCHEDULE_DAYS,
  SCHEDULE_HOURS,
  SCHEDULE_RANGE_LABEL,
  UPCOMING_APPOINTMENTS,
} from './dashboard/appointments/appointmentScheduleData.ts'
import {
  ALL_CLINICS,
  ALL_DOCTORS,
  ALL_TYPES,
  DEFAULT_SCHEDULE_FILTERS,
  appointmentRange,
  appointmentsForDay,
  blockOffset,
  blockSpan,
  dayDateLabel,
  filterAppointments,
  filterUpcoming,
  findScheduleAppointment,
  isDefaultScheduleFilters,
  scheduleClinics,
  scheduleDoctors,
  scheduleMinutes,
  scheduleTypes,
} from './dashboard/appointments/appointmentScheduleLogic.ts'
import { duplicateValues } from './dashboard/dashboardLogic.ts'

const ids = SCHEDULE_APPOINTMENTS.map((appointment) => appointment.id)
assert.equal(ids.length, 18, 'the reference supplies eighteen visible appointments')
assert.equal(duplicateValues(ids).length, 0, 'schedule identifiers are unique')
assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)), 'schedule identifiers are deterministic and URL-safe')

assert.equal(duplicateValues(SCHEDULE_DAYS.map((day) => day.key)).length, 0, 'day keys are unique')
assert.deepEqual(
  SCHEDULE_DAYS.map((day) => day.short),
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  'the supplied display days keep Monday-to-Sunday order',
)
assert.equal(SCHEDULE_RANGE_LABEL, 'May 12 - 18, 2024', 'the supplied range label is preserved verbatim')
assert.deepEqual(SCHEDULE_HOURS, ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'])

const dayKeys = SCHEDULE_DAYS.map((day) => day.key)
for (const appointment of SCHEDULE_APPOINTMENTS) {
  assert.ok(dayKeys.includes(appointment.day), `${appointment.id} uses a supplied display day`)
  assert.ok(
    scheduleMinutes(appointment.end) > scheduleMinutes(appointment.start),
    `${appointment.id} ends after it starts`,
  )
  assert.ok(
    scheduleMinutes(appointment.start) >= scheduleMinutes('08:00') &&
      scheduleMinutes(appointment.end) <= scheduleMinutes('17:00'),
    `${appointment.id} sits inside the supplied 08:00-17:00 time scale`,
  )
  assert.ok(appointment.visit.trim().length > 0, `${appointment.id} names its visit type`)
  assert.ok(appointment.room.trim().length > 0, `${appointment.id} names its room`)
}

assert.deepEqual(
  filterAppointments(SCHEDULE_APPOINTMENTS, DEFAULT_SCHEDULE_FILTERS),
  SCHEDULE_APPOINTMENTS,
  'default filters return every supplied appointment',
)
assert.ok(isDefaultScheduleFilters(DEFAULT_SCHEDULE_FILTERS), 'the default filter set is recognised as default')
assert.ok(
  !isDefaultScheduleFilters({ ...DEFAULT_SCHEDULE_FILTERS, doctor: 'Dr. Maya Sari' }),
  'changing a filter leaves the default state',
)

const clinics = scheduleClinics(SCHEDULE_APPOINTMENTS)
const doctors = scheduleDoctors(SCHEDULE_APPOINTMENTS)
const types = scheduleTypes(SCHEDULE_APPOINTMENTS)
for (const [option, field] of [[clinics, 'clinic'], [doctors, 'doctor'], [types, 'visit']] as const) {
  assert.equal(new Set(option).size, option.length, `${field} options are unique`)
  assert.ok(option.length > 1, `${field} options are worth filtering`)
}
assert.deepEqual(
  [...new Set(SCHEDULE_APPOINTMENTS.map((appointment) => appointment.clinic))].sort((a, b) => a.localeCompare(b)),
  clinics,
  'clinic options come from the supplied fixtures only',
)
assert.ok(!clinics.includes(ALL_CLINICS) && !doctors.includes(ALL_DOCTORS) && !types.includes(ALL_TYPES), 'the All option stays out of the fixture options')

for (const clinic of clinics) {
  const rows = filterAppointments(SCHEDULE_APPOINTMENTS, { ...DEFAULT_SCHEDULE_FILTERS, clinic })
  assert.ok(rows.length > 0, `${clinic} has sample appointments`)
  assert.ok(rows.every((row) => row.clinic === clinic), `${clinic} filtering returns only that clinic`)
}
for (const doctor of doctors) {
  const rows = filterAppointments(SCHEDULE_APPOINTMENTS, { ...DEFAULT_SCHEDULE_FILTERS, doctor })
  assert.ok(rows.length > 0, `${doctor} has sample appointments`)
  assert.ok(rows.every((row) => row.doctor === doctor), `${doctor} filtering returns only that doctor`)
}
for (const type of types) {
  const rows = filterAppointments(SCHEDULE_APPOINTMENTS, { ...DEFAULT_SCHEDULE_FILTERS, type })
  assert.ok(rows.length > 0, `${type} has sample appointments`)
  assert.ok(rows.every((row) => row.visit === type), `${type} filtering returns only that type`)
}

const combined = filterAppointments(SCHEDULE_APPOINTMENTS, {
  clinic: 'Pediatric Clinic',
  doctor: 'Dr. Maya Sari',
  type: 'Child Vaccination',
})
assert.equal(combined.length, 2, 'combined filters intersect')
assert.ok(combined.every((row) => row.clinic === 'Pediatric Clinic' && row.visit === 'Child Vaccination'))
assert.equal(
  filterAppointments(SCHEDULE_APPOINTMENTS, { clinic: 'Pediatric Clinic', doctor: ALL_DOCTORS, type: 'OBGYN Consultation' }).length,
  0,
  'a contradictory combination returns nothing',
)
assert.equal(
  filterAppointments(
    SCHEDULE_APPOINTMENTS,
    { clinic: 'General Clinic', doctor: 'Dr. Ahmad Rahman', type: ALL_TYPES },
  ).length,
  4,
  'a narrow but coherent combination keeps its rows',
)

assert.equal(appointmentsForDay(SCHEDULE_APPOINTMENTS, 'mon').length, 4, 'Monday carries four supplied appointments')
assert.deepEqual(
  appointmentsForDay(SCHEDULE_APPOINTMENTS, 'mon').map((row) => row.start),
  ['08:30', '10:00', '13:00', '15:30'],
  'a day list is ordered by start time',
)
assert.equal(appointmentsForDay(SCHEDULE_APPOINTMENTS, 'sun').length, 1, 'Sunday carries one supplied appointment')
assert.equal(appointmentsForDay([], 'mon').length, 0, 'an empty input produces an empty day')

assert.equal(findScheduleAppointment(SCHEDULE_APPOINTMENTS, REFERENCE_APPOINTMENT_DETAIL.scheduleId)?.patient, 'Dewi Lestari')
assert.equal(findScheduleAppointment(SCHEDULE_APPOINTMENTS, 'no-such-appointment'), undefined, 'an unknown identifier resolves to nothing')
assert.equal(dayDateLabel('mon'), 'Mon, 12 May 2024', 'supplied display days render with their reference date')
assert.equal(appointmentRange(SCHEDULE_APPOINTMENTS[0]), '08:30 - 09:30', 'block time range uses the supplied format')

const first = SCHEDULE_APPOINTMENTS[0]
assert.equal(blockOffset(first), 30 / 540, 'a block offset follows the supplied 08:00 start')
assert.equal(blockSpan(first), 60 / 540, 'a block span follows the supplied duration')
assert.ok(
  SCHEDULE_APPOINTMENTS.every((row) => blockOffset(row) >= 0 && blockOffset(row) + blockSpan(row) <= 1),
  'every supplied block fits inside the rendered time scale',
)

const upcomingIds = UPCOMING_APPOINTMENTS.map((row) => row.scheduleId)
assert.equal(duplicateValues(upcomingIds).length, 0, 'upcoming rows resolve to distinct reference slots')
assert.ok(
  UPCOMING_APPOINTMENTS.every((row) => findScheduleAppointment(SCHEDULE_APPOINTMENTS, row.scheduleId) !== undefined),
  'every upcoming row links to a supplied appointment',
)
assert.deepEqual(
  filterUpcoming(UPCOMING_APPOINTMENTS, SCHEDULE_APPOINTMENTS).length,
  UPCOMING_APPOINTMENTS.length,
  'unfiltered upcoming rows all stay visible',
)
const prenatalOnly = filterAppointments(SCHEDULE_APPOINTMENTS, { ...DEFAULT_SCHEDULE_FILTERS, type: 'Prenatal Check-up' })
assert.equal(filterUpcoming(UPCOMING_APPOINTMENTS, prenatalOnly).length, 2, 'filtering the calendar also narrows the upcoming list')
assert.equal(filterUpcoming(UPCOMING_APPOINTMENTS, []).length, 0, 'an empty calendar clears the upcoming list')

const snapshot = JSON.stringify(SCHEDULE_APPOINTMENTS)
filterAppointments(SCHEDULE_APPOINTMENTS, { clinic: 'General Clinic', doctor: ALL_DOCTORS, type: ALL_TYPES })
appointmentsForDay(SCHEDULE_APPOINTMENTS, 'tue')
assert.equal(JSON.stringify(SCHEDULE_APPOINTMENTS), snapshot, 'helpers never mutate the supplied fixtures')

console.log('appointment schedule checks passed')
