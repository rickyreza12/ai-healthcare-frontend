import type { AvatarKey } from '../dashboardData.ts'

/** Presentational tone keys sampled from the approved reference appointment blocks. */
export type AppointmentTone = 'blue' | 'teal' | 'amber' | 'rose' | 'violet'

export type ScheduleDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type ScheduleDay = {
  readonly key: ScheduleDayKey
  readonly short: string
  readonly date: string
  readonly month: string
}

export type ScheduleAppointment = {
  readonly id: string
  readonly day: ScheduleDayKey
  /** 24-hour start, `HH:MM`. */
  readonly start: string
  /** 24-hour end, `HH:MM`. */
  readonly end: string
  readonly patient: string
  readonly visit: string
  readonly room: string
  readonly clinic: string
  readonly doctor: string
  readonly tone: AppointmentTone
  readonly avatar: AvatarKey | null
}

export type UpcomingAppointment = {
  readonly time: string
  readonly patient: string
  readonly visit: string
  readonly room: string
  /** Supplied relative copy, not a value derived from the user's clock. */
  readonly relative: string
  /** Links this supplied row to its weekly reference slot. */
  readonly scheduleId: string
  readonly avatar: AvatarKey | null
}

/**
 * The reference visibly labels `May 12 - 18, 2024` while pairing `12` with Monday, so the
 * weekday and year values are display copy rather than a real 2024 calendar sequence.
 */
export const SCHEDULE_RANGE_LABEL = 'May 12 - 18, 2024'

export const SCHEDULE_DAYS: readonly ScheduleDay[] = [
  { key: 'mon', short: 'Mon', date: '12', month: 'May' },
  { key: 'tue', short: 'Tue', date: '13', month: 'May' },
  { key: 'wed', short: 'Wed', date: '14', month: 'May' },
  { key: 'thu', short: 'Thu', date: '15', month: 'May' },
  { key: 'fri', short: 'Fri', date: '16', month: 'May' },
  { key: 'sat', short: 'Sat', date: '17', month: 'May' },
  { key: 'sun', short: 'Sun', date: '18', month: 'May' },
]

/** Hour labels from the supplied time scale. */
export const SCHEDULE_HOURS: readonly string[] = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
]

/** The eighteen supplied reference appointments, in reference order. */
export const SCHEDULE_APPOINTMENTS: readonly ScheduleAppointment[] = [
  { id: 'schedule-ref-mon-12-0830-siti-aisyah', day: 'mon', start: '08:30', end: '09:30', patient: 'Siti Aisyah', visit: 'General Check-up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Ahmad Rahman', tone: 'blue', avatar: 'sitiAisyah' },
  { id: 'schedule-ref-mon-12-1000-ahmad-rizki', day: 'mon', start: '10:00', end: '11:00', patient: 'Ahmad Rizki', visit: 'Pediatric Consultation', room: 'Room 201', clinic: 'Pediatric Clinic', doctor: 'Dr. Maya Sari', tone: 'teal', avatar: null },
  { id: 'schedule-ref-mon-12-1300-maya-sari', day: 'mon', start: '13:00', end: '14:00', patient: 'Maya Sari', visit: 'OBGYN Consultation', room: 'Room 301', clinic: 'Maternity Clinic', doctor: 'Dr. Sarah Melati', tone: 'rose', avatar: null },
  { id: 'schedule-ref-mon-12-1530-budi-santoso', day: 'mon', start: '15:30', end: '16:30', patient: 'Budi Santoso', visit: 'Follow Up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Ahmad Rahman', tone: 'violet', avatar: 'budiSantoso' },
  { id: 'schedule-ref-tue-13-0900-dewi-lestari', day: 'tue', start: '09:00', end: '10:00', patient: 'Dewi Lestari', visit: 'Prenatal Check-up', room: 'Room 302', clinic: 'Maternity Clinic', doctor: 'Dr. Sarah Melati', tone: 'amber', avatar: null },
  { id: 'schedule-ref-tue-13-1100-reza-maulana', day: 'tue', start: '11:00', end: '12:00', patient: 'Reza Maulana', visit: 'General Check-up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Lina Kusuma', tone: 'blue', avatar: null },
  { id: 'schedule-ref-tue-13-1400-putri-ananda', day: 'tue', start: '14:00', end: '15:00', patient: 'Putri Ananda', visit: 'Child Vaccination', room: 'Room 201', clinic: 'Pediatric Clinic', doctor: 'Dr. Maya Sari', tone: 'teal', avatar: null },
  { id: 'schedule-ref-wed-14-0930-agus-pratama', day: 'wed', start: '09:30', end: '10:30', patient: 'Agus Pratama', visit: 'Follow Up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Ahmad Rahman', tone: 'violet', avatar: null },
  { id: 'schedule-ref-wed-14-1300-nina-kurnia', day: 'wed', start: '13:00', end: '14:00', patient: 'Nina Kurnia', visit: 'General Check-up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Lina Kusuma', tone: 'blue', avatar: null },
  { id: 'schedule-ref-wed-14-1600-fajar-hidayat', day: 'wed', start: '16:00', end: '17:00', patient: 'Fajar Hidayat', visit: 'Lab Result Review', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Andi Pratama', tone: 'amber', avatar: null },
  { id: 'schedule-ref-thu-15-0800-rina-amelia', day: 'thu', start: '08:00', end: '09:00', patient: 'Rina Amelia', visit: 'OBGYN Consultation', room: 'Room 302', clinic: 'Maternity Clinic', doctor: 'Dr. Sarah Melati', tone: 'rose', avatar: null },
  { id: 'schedule-ref-thu-15-1130-zahra-putri', day: 'thu', start: '11:30', end: '12:30', patient: 'Zahra Putri', visit: 'Pediatric Consultation', room: 'Room 201', clinic: 'Pediatric Clinic', doctor: 'Dr. Maya Sari', tone: 'teal', avatar: null },
  { id: 'schedule-ref-thu-15-1430-hendra-wijaya', day: 'thu', start: '14:30', end: '15:30', patient: 'Hendra Wijaya', visit: 'Follow Up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Reza Fadli', tone: 'violet', avatar: null },
  { id: 'schedule-ref-fri-16-0930-taufik-rahman', day: 'fri', start: '09:30', end: '10:30', patient: 'Taufik Rahman', visit: 'General Check-up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Lina Kusuma', tone: 'blue', avatar: null },
  { id: 'schedule-ref-fri-16-1300-siti-nurhaliza', day: 'fri', start: '13:00', end: '14:00', patient: 'Siti Nurhaliza', visit: 'Prenatal Check-up', room: 'Room 302', clinic: 'Maternity Clinic', doctor: 'Dr. Sarah Melati', tone: 'amber', avatar: null },
  { id: 'schedule-ref-fri-16-1500-dimas-arif', day: 'fri', start: '15:00', end: '16:00', patient: 'Dimas Arif', visit: 'OBGYN Consultation', room: 'Room 302', clinic: 'Maternity Clinic', doctor: 'Dr. Sarah Melati', tone: 'rose', avatar: null },
  { id: 'schedule-ref-sat-17-1000-ali-munandar', day: 'sat', start: '10:00', end: '11:00', patient: 'Ali Munandar', visit: 'Child Vaccination', room: 'Room 201', clinic: 'Pediatric Clinic', doctor: 'Dr. Maya Sari', tone: 'teal', avatar: null },
  { id: 'schedule-ref-sun-18-1100-lina-marlina', day: 'sun', start: '11:00', end: '12:00', patient: 'Lina Marlina', visit: 'Follow Up', room: 'Room 101', clinic: 'General Clinic', doctor: 'Dr. Ahmad Rahman', tone: 'violet', avatar: null },
]

/**
 * The supplied schedule identifies patients by display name only. These ids declare which rows
 * belong to the patient-detail reference patient instead of matching names at runtime.
 */
export const REFERENCE_PATIENT_SCHEDULE_IDS: readonly string[] = ['schedule-ref-mon-12-0830-siti-aisyah']

/** The five supplied upcoming rows. Their relative labels are reference copy. */
export const UPCOMING_APPOINTMENTS: readonly UpcomingAppointment[] = [
  { time: '09:00 AM', patient: 'Dewi Lestari', visit: 'Prenatal Check-up', room: 'Room 302', relative: 'Today', scheduleId: 'schedule-ref-tue-13-0900-dewi-lestari', avatar: null },
  { time: '10:30 AM', patient: 'Ahmad Rizki', visit: 'Pediatric Consultation', room: 'Room 201', relative: 'Today', scheduleId: 'schedule-ref-mon-12-1000-ahmad-rizki', avatar: null },
  { time: '1:00 PM', patient: 'Maya Sari', visit: 'OBGYN Consultation', room: 'Room 301', relative: 'Today', scheduleId: 'schedule-ref-mon-12-1300-maya-sari', avatar: null },
  { time: '3:30 PM', patient: 'Budi Santoso', visit: 'Follow Up', room: 'Room 101', relative: 'Today', scheduleId: 'schedule-ref-mon-12-1530-budi-santoso', avatar: 'budiSantoso' },
  { time: '09:00 AM', patient: 'Siti Nurhaliza', visit: 'Prenatal Check-up', room: 'Room 302', relative: 'Tomorrow', scheduleId: 'schedule-ref-fri-16-1300-siti-nurhaliza', avatar: null },
]

export type DetailFact = {
  readonly label: string
  readonly value: string
  readonly unit?: string
}

export type DetailRow = {
  readonly label: string
  readonly value: string
}

/** Extended reference detail, supplied only for one appointment. */
export type AppointmentDetail = {
  readonly scheduleId: string
  readonly name: string
  readonly tags: readonly string[]
  readonly summary: string
  readonly facts: readonly DetailFact[]
  readonly rows: readonly DetailRow[]
}

export const REFERENCE_APPOINTMENT_DETAIL: AppointmentDetail = {
  scheduleId: 'schedule-ref-tue-13-0900-dewi-lestari',
  name: 'Dewi Lestari',
  tags: ['New Patient', 'Today'],
  summary: 'Pregnant • 28 weeks',
  facts: [
    { label: 'Age', value: '28', unit: 'years' },
    { label: 'Blood Type', value: 'B+' },
    { label: 'Weight', value: '68.5', unit: 'kg' },
    { label: 'Height', value: '160', unit: 'cm' },
  ],
  rows: [
    { label: 'Date', value: 'Mon, 12 May 2024' },
    { label: 'Time', value: '09:00 AM - 10:00 AM (1 hour)' },
    { label: 'Location', value: 'Room 302 - Maternity Clinic' },
    { label: 'Appointment', value: 'Prenatal Check-up' },
    { label: 'Description', value: 'Regular pregnancy check-up and ultrasound' },
  ],
}

/** Selected day on first render, matching the reference highlight. */
export const DEFAULT_SELECTED_DAY: ScheduleDayKey = 'mon'
export const DEFAULT_SELECTED_APPOINTMENT_ID = REFERENCE_APPOINTMENT_DETAIL.scheduleId
