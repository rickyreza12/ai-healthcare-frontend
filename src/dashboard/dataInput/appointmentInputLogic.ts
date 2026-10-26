import { ApiError, NetworkError, type Appointment, type AppointmentInput } from '../../api.ts'

export type AppointmentFormValues = AppointmentInput

export type FormErrors = Partial<Record<keyof AppointmentFormValues, string>>

const DATE = /^\d{4}-\d{2}-\d{2}$/
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/

export function emptyAppointmentForm(): AppointmentFormValues {
  return {
    patientId: '',
    clinician: '',
    clinic: '',
    visitType: '',
    room: '',
    date: '',
    startTime: '',
    endTime: '',
  }
}

export function appointmentFormValues(appointment: Appointment): AppointmentFormValues {
  return {
    patientId: appointment.patientId,
    clinician: appointment.clinician,
    clinic: appointment.clinic,
    visitType: appointment.visitType,
    room: appointment.room,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
  }
}

/** Client-side checks only. The server repeats every rule and owns conflict detection. */
export function validateAppointmentForm(values: AppointmentFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.patientId.trim()) errors.patientId = 'Choose a patient.'
  if (!values.clinician.trim()) errors.clinician = 'Choose a clinician.'
  if (!values.clinic.trim()) errors.clinic = 'Choose a clinic.'
  if (!values.visitType.trim()) errors.visitType = 'Choose a visit type.'
  if (!values.room.trim()) errors.room = 'Enter a room.'
  if (!DATE.test(values.date)) errors.date = 'Choose a date.'
  if (!CLOCK.test(values.startTime)) errors.startTime = 'Enter a start time as HH:MM.'
  if (!CLOCK.test(values.endTime)) errors.endTime = 'Enter an end time as HH:MM.'
  if (!errors.startTime && !errors.endTime && values.endTime <= values.startTime) {
    errors.endTime = 'End time must be after start time.'
  }
  return errors
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}

export function toCreateInput(values: AppointmentFormValues): AppointmentInput {
  return {
    patientId: values.patientId.trim(),
    clinician: values.clinician.trim(),
    clinic: values.clinic.trim(),
    visitType: values.visitType.trim(),
    room: values.room.trim(),
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
  }
}

export function appointmentWhen(appointment: Pick<Appointment, 'date' | 'startTime' | 'endTime'>): string {
  return `${appointment.date} · ${appointment.startTime}\u2013${appointment.endTime}`
}

export function statusLabel(status: Appointment['status']): string {
  return status === 'cancelled' ? 'Cancelled' : 'Scheduled'
}

/** One readable sentence for every failure the API can return. */
export function appointmentError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'schedule_conflict':
        return error.message
      case 'stale_version':
        return `${error.message} Reload the appointment before trying again.`
      case 'invalid_transition':
        return error.message
      case 'idempotency_conflict':
        return 'This submission was already used for a different appointment. Reload and try again.'
      case 'patient_not_found':
        return error.message
      case 'validation_failed':
        return error.message
      default:
        break
    }
    if (error.status === 401) return 'Your session expired. Sign in again to continue.'
    if (error.status === 403) return 'You do not have permission to change appointments.'
    if (error.status === 404) return error.message
    if (error.status === 409) return error.message
    if (error.status === 422) return error.message
    return error.message
  }
  if (error instanceof NetworkError) return error.message
  return 'The request could not be completed. Try again.'
}
