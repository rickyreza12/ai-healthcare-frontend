import assert from 'node:assert/strict'
import { ApiError, NetworkError, type Appointment } from './api.ts'
import {
  appointmentError,
  appointmentFormValues,
  appointmentWhen,
  emptyAppointmentForm,
  hasErrors,
  statusLabel,
  toCreateInput,
  validateAppointmentForm,
} from './dashboard/dataInput/appointmentInputLogic.ts'

const empty = emptyAppointmentForm()
const emptyErrors = validateAppointmentForm(empty)
assert.equal(hasErrors(emptyErrors), true, 'an empty form is invalid')
for (const field of [
  'patientId',
  'clinician',
  'clinic',
  'visitType',
  'room',
  'date',
  'startTime',
  'endTime',
] as const) {
  assert.ok(emptyErrors[field], `empty ${field} is reported`)
}

const valid = {
  patientId: 'P-00012345',
  clinician: 'Dr. Sarah Melati',
  clinic: 'Maternity Clinic',
  visitType: 'Prenatal Check-up',
  room: 'Room 302',
  date: '2026-10-26',
  startTime: '09:00',
  endTime: '10:00',
}
assert.deepEqual(validateAppointmentForm(valid), {}, 'a complete form passes')

assert.ok(
  validateAppointmentForm({ ...valid, endTime: '09:00' }).endTime,
  'an end equal to the start is rejected',
)
assert.ok(
  validateAppointmentForm({ ...valid, endTime: '08:30' }).endTime,
  'an end before the start is rejected',
)
assert.ok(validateAppointmentForm({ ...valid, date: '26/10/2026' }).date, 'a loose date is rejected')
assert.ok(validateAppointmentForm({ ...valid, startTime: '9:00' }).startTime, 'a loose time is rejected')
assert.ok(validateAppointmentForm({ ...valid, startTime: '24:00' }).startTime, 'an out-of-range hour is rejected')

assert.deepEqual(
  toCreateInput({ ...valid, patientId: ' P-00012345 ', room: ' Room 302 ' }),
  { ...valid, patientId: 'P-00012345', room: 'Room 302' },
  'payload values are trimmed',
)

const appointment: Appointment = {
  appointmentId: 'apt-1',
  patientId: 'P-00012345',
  patientName: 'Siti Aisyah',
  date: '2026-10-26',
  startTime: '09:00',
  endTime: '10:00',
  timeZone: 'Asia/Jakarta',
  visitType: 'Prenatal Check-up',
  clinician: 'Dr. Sarah Melati',
  clinic: 'Maternity Clinic',
  room: 'Room 302',
  status: 'scheduled',
  cancellationReason: null,
  version: 1,
  createdAt: '2026-10-20T00:00:00Z',
  updatedAt: '2026-10-20T00:00:00Z',
}
assert.deepEqual(
  appointmentFormValues(appointment),
  {
    patientId: 'P-00012345',
    clinician: 'Dr. Sarah Melati',
    clinic: 'Maternity Clinic',
    visitType: 'Prenatal Check-up',
    room: 'Room 302',
    date: '2026-10-26',
    startTime: '09:00',
    endTime: '10:00',
  },
  'reschedule form is filled from the appointment',
)
assert.equal(appointmentWhen(appointment), '2026-10-26 · 09:00\u201310:00', 'the when label is explicit')
assert.equal(statusLabel('scheduled'), 'Scheduled', 'scheduled label')
assert.equal(statusLabel('cancelled'), 'Cancelled', 'cancelled label')

assert.match(
  appointmentError(new ApiError(409, 'Room 302 is already booked.', 'schedule_conflict')),
  /Room 302/,
  'conflict messages reach the user',
)
assert.match(
  appointmentError(new ApiError(409, 'The appointment changed.', 'stale_version')),
  /Reload the appointment/,
  'stale versions tell the user to reload',
)
assert.match(
  appointmentError(new ApiError(401, 'Not authenticated.')),
  /session expired/,
  'expired sessions are explained',
)
assert.match(
  appointmentError(new ApiError(403, 'Forbidden')),
  /permission/,
  'forbidden responses are explained',
)
assert.match(
  appointmentError(new ApiError(500, 'Boom')),
  /Boom/,
  'server messages are passed through',
)
assert.match(
  appointmentError(new NetworkError()),
  /Cannot reach the server/,
  'network failure is explained',
)
assert.match(
  appointmentError(new Error('unexpected')),
  /could not be completed/,
  'unknown failures stay generic',
)

console.log('appointmentInput.check.ts passed')
