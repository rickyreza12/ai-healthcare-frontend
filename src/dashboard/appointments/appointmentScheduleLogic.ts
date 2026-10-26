import {
  SCHEDULE_DAYS,
  type ScheduleAppointment,
  type ScheduleDay,
  type ScheduleDayKey,
  type UpcomingAppointment,
} from './appointmentScheduleData.ts'

const START_MINUTES = 8 * 60
const END_MINUTES = 17 * 60

/** Shared with the calendar so block positions and grid lines use one scale. */
export const SCHEDULE_START_MINUTES = START_MINUTES
export const SCHEDULE_SPAN_MINUTES = END_MINUTES - START_MINUTES

export const ALL_CLINICS = 'All'
export const ALL_DOCTORS = 'All'
export const ALL_TYPES = 'All'

export type ScheduleFilters = {
  readonly clinic: string
  readonly doctor: string
  readonly type: string
}

export const DEFAULT_SCHEDULE_FILTERS: ScheduleFilters = {
  clinic: ALL_CLINICS,
  doctor: ALL_DOCTORS,
  type: ALL_TYPES,
}

/** `HH:MM` to minutes past midnight. */
export function scheduleMinutes(time: string): number {
  const [hours, minutes] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

/** Share of the visible time scale where the block starts, clamped to the supplied range. */
export function blockOffset(appointment: ScheduleAppointment): number {
  const start = Math.max(START_MINUTES, scheduleMinutes(appointment.start))
  return (start - START_MINUTES) / SCHEDULE_SPAN_MINUTES
}

/** Share of the visible time scale the block covers. */
export function blockSpan(appointment: ScheduleAppointment): number {
  const start = Math.max(START_MINUTES, scheduleMinutes(appointment.start))
  const end = Math.min(END_MINUTES, scheduleMinutes(appointment.end))
  return Math.max(0, end - start) / SCHEDULE_SPAN_MINUTES
}

export function appointmentRange(appointment: ScheduleAppointment): string {
  return `${appointment.start} - ${appointment.end}`
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

/** Filter options come from the fixtures so no empty choice is offered. */
export function scheduleClinics(appointments: readonly ScheduleAppointment[]): string[] {
  return uniqueSorted(appointments.map((appointment) => appointment.clinic))
}

export function scheduleDoctors(appointments: readonly ScheduleAppointment[]): string[] {
  return uniqueSorted(appointments.map((appointment) => appointment.doctor))
}

export function scheduleTypes(appointments: readonly ScheduleAppointment[]): string[] {
  return uniqueSorted(appointments.map((appointment) => appointment.visit))
}

/** Intersection of the clinic, doctor, and visit-type filters. */
export function filterAppointments(
  appointments: readonly ScheduleAppointment[],
  filters: ScheduleFilters,
): ScheduleAppointment[] {
  return appointments.filter(
    (appointment) =>
      (filters.clinic === ALL_CLINICS || appointment.clinic === filters.clinic) &&
      (filters.doctor === ALL_DOCTORS || appointment.doctor === filters.doctor) &&
      (filters.type === ALL_TYPES || appointment.visit === filters.type),
  )
}

/** Supplied rows stay visible only while their weekly slot survives the filters. */
export function filterUpcoming(
  upcoming: readonly UpcomingAppointment[],
  visible: readonly ScheduleAppointment[],
): UpcomingAppointment[] {
  const visibleIds = new Set(visible.map((appointment) => appointment.id))
  return upcoming.filter((row) => visibleIds.has(row.scheduleId))
}

export function isDefaultScheduleFilters(filters: ScheduleFilters): boolean {
  return (
    filters.clinic === DEFAULT_SCHEDULE_FILTERS.clinic &&
    filters.doctor === DEFAULT_SCHEDULE_FILTERS.doctor &&
    filters.type === DEFAULT_SCHEDULE_FILTERS.type
  )
}

export function appointmentsForDay(
  appointments: readonly ScheduleAppointment[],
  day: ScheduleDayKey,
): ScheduleAppointment[] {
  return appointments
    .filter((appointment) => appointment.day === day)
    .sort((a, b) => scheduleMinutes(a.start) - scheduleMinutes(b.start))
}

export function findScheduleAppointment(
  appointments: readonly ScheduleAppointment[],
  id: string,
): ScheduleAppointment | undefined {
  return appointments.find((appointment) => appointment.id === id)
}

export function findScheduleDay(day: ScheduleDayKey): ScheduleDay | undefined {
  return SCHEDULE_DAYS.find((entry) => entry.key === day)
}

/** Display date for a supplied day label, for example `Mon, 12 May 2024`. */
export function dayDateLabel(day: ScheduleDayKey): string {
  const entry = findScheduleDay(day)
  if (!entry) return ''
  return `${entry.short}, ${entry.date} ${entry.month} 2024`
}
