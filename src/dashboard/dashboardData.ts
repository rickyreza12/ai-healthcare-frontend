export type NavIconKey =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'medicalRecords'
  | 'maternity'
  | 'pediatric'
  | 'pharmacy'
  | 'laboratory'
  | 'healthcareAssistant'
  | 'notifications'
  | 'analytics'
  | 'dataInput'
  | 'profile'

export type AvatarKey = 'sitiAisyah' | 'muhammadRizki' | 'anitaDewi' | 'budiSantoso' | 'rinaMelati' | 'doctor'

export type MetricArtKey = 'patients' | 'appointments' | 'newPatients' | 'lab'

export type PatientCategory = 'Outpatient' | 'Pediatric' | 'Maternity'

export type Status = 'Completed' | 'In Consultation' | 'Waiting' | 'Queued' | 'Scheduled'

export type NavItem = {
  readonly key: string
  readonly label: string
  readonly icon: NavIconKey
  readonly route: string | null
}

export const NAV_SECTION_LABEL = 'WORKSPACE'

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { key: 'patients', label: 'Patients', icon: 'patients', route: '/dashboard/patients' },
  { key: 'appointments', label: 'Appointments', icon: 'appointments', route: '/dashboard/appointments' },
  { key: 'medical-records', label: 'Medical Records', icon: 'medicalRecords', route: '/dashboard/medical-records' },
  { key: 'maternity', label: 'Maternity / OBGYN', icon: 'maternity', route: '/dashboard/maternity' },
  { key: 'pediatric', label: 'Pediatric Care', icon: 'pediatric', route: '/dashboard/pediatric' },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'pharmacy', route: '/dashboard/pharmacy' },
  { key: 'laboratory', label: 'Laboratory', icon: 'laboratory', route: '/dashboard/laboratory' },
  { key: 'healthcare-assistant', label: 'Healthcare Assistant', icon: 'healthcareAssistant', route: '/dashboard/healthcare-assistant' },
  { key: 'notifications', label: 'Notifications & Inbox', icon: 'notifications', route: '/dashboard/notifications' },
  { key: 'analytics', label: 'Analytics & Reports', icon: 'analytics', route: '/dashboard/analytics' },
  { key: 'data-input', label: 'Data Input', icon: 'dataInput', route: '/dashboard/data-input' },
  { key: 'profile', label: 'Profile & Settings', icon: 'profile', route: '/dashboard/profile' },
] as const

export const UNAVAILABLE_HINT = 'Coming soon'
export const UNAVAILABLE_CHIP = 'Soon'
export const MENU_LOCKED_HINT = 'Unavailable in this mode'

export const DOCTOR: { readonly name: string; readonly role: string; readonly avatar: AvatarKey } = {
  name: 'Dr. Ahmad Rahman',
  role: 'General Practitioner',
  avatar: 'doctor',
}

export const HERO = {
  doctorName: 'Dr. Ahmad',
  message: "Let's continue providing better care for healthier families.",
  tagline: ['Healthy Families', 'Brighter Tomorrows'],
} as const

export const PROMO = {
  headline: ['Better Care.', 'Brighter Families.'],
  note: 'Caring for Every Generation.',
} as const

export type MetricCard = {
  readonly label: string
  readonly value: number
  readonly trend: string
  readonly favorable: boolean
  readonly comparison: string
  readonly art: MetricArtKey
}

export const METRICS: readonly MetricCard[] = [
  { label: 'Total Patients', value: 124, trend: '12%', favorable: true, comparison: 'vs last month', art: 'patients' },
  { label: 'Appointments Today', value: 36, trend: '8%', favorable: true, comparison: 'vs yesterday', art: 'appointments' },
  { label: 'New Patients', value: 6, trend: '20%', favorable: true, comparison: 'vs last week', art: 'newPatients' },
  { label: 'Pending Lab Results', value: 2, trend: '33%', favorable: false, comparison: 'vs yesterday', art: 'lab' },
] as const

export type PatientVisitDay = {
  readonly day: string
  readonly outpatient: number
  readonly inpatient: number
}

export const VISIT_TREND: readonly PatientVisitDay[] = [
  { day: '7 May', outpatient: 5, inpatient: 10 },
  { day: '8 May', outpatient: 9, inpatient: 15 },
  { day: '9 May', outpatient: 10, inpatient: 16 },
  { day: '10 May', outpatient: 10, inpatient: 18 },
  { day: '11 May', outpatient: 13, inpatient: 21 },
  { day: '12 May', outpatient: 17, inpatient: 27 },
  { day: '13 May', outpatient: 23, inpatient: 33 },
] as const

export const VISIT_TREND_MAX = 40
export const VISIT_TREND_TICKS: readonly number[] = [0, 10, 20, 30, 40]

export type PatientType = {
  readonly label: string
  readonly count: number
  readonly percent: number
  readonly color: string
}

export const PATIENT_TYPES: readonly PatientType[] = [
  { label: 'General Check Up', count: 48, percent: 38, color: '#2999F8' },
  { label: 'Pediatric Care', count: 28, percent: 23, color: '#FFA51F' },
  { label: 'Maternity / OBGYN', count: 20, percent: 16, color: '#00A895' },
  { label: 'Chronic Care', count: 18, percent: 14, color: '#9B6DD7' },
  { label: 'Others', count: 10, percent: 8, color: '#B0C4DE' },
] as const

export type RecentPatient = {
  readonly name: string
  readonly id: string
  readonly category: PatientCategory
  readonly reason: string
  readonly time: string
  readonly status: Status
  readonly avatar: AvatarKey
}

export const RECENT_PATIENTS: readonly RecentPatient[] = [
  { name: 'Siti Aisyah', id: 'P-00012345', category: 'Outpatient', reason: 'Routine Check Up', time: '09:00 AM', status: 'Completed', avatar: 'sitiAisyah' },
  { name: 'Muhammad Rizki', id: 'P-00067890', category: 'Pediatric', reason: 'Fever & Cough', time: '09:30 AM', status: 'In Consultation', avatar: 'muhammadRizki' },
  { name: 'Anita Dewi', id: 'P-00054321', category: 'Maternity', reason: 'Prenatal Check Up', time: '10:15 AM', status: 'Waiting', avatar: 'anitaDewi' },
  { name: 'Budi Santoso', id: 'P-00011223', category: 'Outpatient', reason: 'Follow Up', time: '11:00 AM', status: 'Completed', avatar: 'budiSantoso' },
  { name: 'Rina Melati', id: 'P-00099887', category: 'Outpatient', reason: 'Consultation', time: '11:30 AM', status: 'Queued', avatar: 'rinaMelati' },
] as const

export type Appointment = {
  readonly time: string
  readonly name: string
  readonly visit: string
  readonly status: Status
  readonly avatar: AvatarKey
  readonly patientId: string
}

export const TODAYS_APPOINTMENTS: readonly Appointment[] = [
  { time: '09:00', name: 'Siti Aisyah', visit: 'General Check Up', status: 'Completed', avatar: 'sitiAisyah', patientId: 'P-00012345' },
  { time: '09:30', name: 'Muhammad Rizki', visit: 'Fever & Cough', status: 'In Consultation', avatar: 'muhammadRizki', patientId: 'P-00067890' },
  { time: '10:00', name: 'Anita Dewi', visit: 'Prenatal Check Up', status: 'Waiting', avatar: 'anitaDewi', patientId: 'P-00054321' },
  { time: '10:30', name: 'Budi Santoso', visit: 'Follow Up', status: 'Scheduled', avatar: 'budiSantoso', patientId: 'P-00011223' },
  { time: '11:00', name: 'Rina Melati', visit: 'Consultation', status: 'Scheduled', avatar: 'rinaMelati', patientId: 'P-00099887' },
] as const

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
