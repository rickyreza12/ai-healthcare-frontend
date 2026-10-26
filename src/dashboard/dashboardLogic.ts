import { slugify, type Appointment, type PatientType, type RecentPatient } from './dashboardData.ts'
import type { DirectoryPatient } from './patients/patientDirectoryData.ts'
import type { MedicalRecord } from './medicalRecords/medicalRecordData.ts'

export type SearchResult = {
  readonly name: string
  readonly detail: string
  /** Present when the record has a detail route. */
  readonly href?: string
}

/**
 * Matches fixture patients, appointments, and directory patients by name, ID, reason, or visit.
 * Directory patients are an optional extra source so dashboard results keep precedence.
 * Medical records are matched separately because two supplied records share a title.
 */
export function searchFixtures(
  query: string,
  patients: readonly RecentPatient[],
  appointments: readonly Appointment[],
  directoryPatients: readonly DirectoryPatient[] = [],
  medicalRecords: readonly MedicalRecord[] = [],
): SearchResult[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  const results: SearchResult[] = []
  const matched = new Set<string>()
  const add = (name: string, detail: string, href?: string) => {
    if (matched.has(name)) return
    matched.add(name)
    results.push({ name, detail, href })
  }

  for (const patient of patients) {
    if (patient.name.toLowerCase().includes(needle) || patient.id.toLowerCase().includes(needle)) {
      add(patient.name, `${patient.id} · ${patient.reason}`, `/dashboard/patients/${encodeURIComponent(patient.id)}`)
    }
  }
  for (const appointment of appointments) {
    if (appointment.name.toLowerCase().includes(needle) || appointment.visit.toLowerCase().includes(needle)) {
      add(appointment.name, `${appointment.time} · ${appointment.visit}`, `/dashboard/appointments/${encodeURIComponent(appointmentKey(appointment))}`)
    }
  }
  for (const patient of directoryPatients) {
    if (patient.name.toLowerCase().includes(needle) || patient.id.toLowerCase().includes(needle)) {
      add(patient.name, `${patient.id} · ${patient.unit} · ${patient.status}`, `/dashboard/patients/${encodeURIComponent(patient.id)}`)
    }
  }

  const recordKeys = new Set<string>()
  for (const record of medicalRecords) {
    if (
      !record.title.toLowerCase().includes(needle) &&
      !record.type.toLowerCase().includes(needle) &&
      !record.clinician.toLowerCase().includes(needle)
    ) continue
    const key = `${record.title}-${record.date}`
    if (recordKeys.has(key)) continue
    recordKeys.add(key)
    results.push({
      name: record.title,
      detail: `${record.type} · ${record.date}`,
      href: `/dashboard/medical-records?record=${encodeURIComponent(record.id)}`,
    })
  }

  return results
}

export function sumPatientTypes(types: readonly PatientType[]): number {
  return types.reduce((total, type) => total + type.count, 0)
}

/** Stable, URL-safe route key for an appointment fixture. */
export function appointmentKey(appointment: Appointment): string {
  return `${slugify(appointment.time)}-${slugify(appointment.name)}`
}

export function findPatient(patients: readonly RecentPatient[], id: string): RecentPatient | undefined {
  return patients.find((patient) => patient.id === id)
}

export function findAppointment(appointments: readonly Appointment[], key: string): Appointment | undefined {
  return appointments.find((appointment) => appointmentKey(appointment) === key)
}

const HERO_DATE = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Hero date line for the local clock, e.g. "Today is Monday, 19 October 2026". */
export function formatDashboardDate(date: Date): string {
  return `Today is ${HERO_DATE.format(date)}`
}

/** Hero salutation for the local clock: morning 05:00-11:59, afternoon 12:00-17:59, evening otherwise. */
export function getDashboardGreeting(date: Date): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}
