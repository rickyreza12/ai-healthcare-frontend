/**
 * Reference fixture for the BUNDA Maternity / OBGYN overview.
 *
 * Every name, date, measurement, status, and note below is synthetic demonstration content
 * supplied with the approved design. It is not live or clinically validated data.
 */
export type PrenatalChecklistStatus = 'Completed' | 'Due Soon' | 'Pending'

export type MaternalMetricIcon = 'heart' | 'thermometer'
export type MaternalMetricTone = 'pink' | 'red' | 'blue'

export type MaternalMetric = {
  readonly id: string
  readonly icon: MaternalMetricIcon
  readonly tone: MaternalMetricTone
  readonly value: string
  /** Unit suffix rendered smaller than the value, as in the reference. */
  readonly unit: string
  readonly label: string
  readonly supporting?: string
  readonly supportingLabel?: string
}

export type PrenatalChecklistItem = {
  readonly id: string
  readonly label: string
  readonly status: PrenatalChecklistStatus
  readonly date: string
}

export const MATERNITY_BREADCRUMB = ['Maternity / OBGYN', 'Patient Detail'] as const

export const MATERNITY_TABS = [
  'Overview',
  'Medical Records',
  'Appointments',
  'Checklists',
  'Education',
  'Documents',
] as const

export type MaternityTab = (typeof MATERNITY_TABS)[number]

export const MATERNITY_TAB_KEYS = [
  { key: 'overview', label: 'Overview' },
  { key: 'medical-records', label: 'Medical Records' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'checklists', label: 'Checklists' },
  { key: 'education', label: 'Education' },
  { key: 'documents', label: 'Documents' },
] as const

export type MaternityTabKey = (typeof MATERNITY_TAB_KEYS)[number]['key']

export const MATERNITY_PATIENT = {
  name: 'Siti Nurhaliza',
  status: 'Ongoing Pregnancy',
  summary: ['Pregnant', '28 years old'],
  id: 'P-00012345',
  gravida: 'G1P0',
  gestationalAge: '32 weeks 4 days',
} as const

export const PREGNANCY_PROGRESS = {
  gestationalAge: '32 weeks 4 days',
  trimester: '3rd Trimester',
  estimatedDueDate: 'EDD: 20 Dec 2026',
  countdown: '(7 weeks 3 days left)',
  /** Plots the supplied 32 weeks 4 days on the supplied 40 week scale; no clinical calculation. */
  currentWeek: 32.57,
  totalWeeks: 40,
  scale: [
    { week: '0', label: 'weeks' },
    { week: '13', label: '2nd Trimester' },
    { week: '27', label: '3rd Trimester' },
    { week: '40', label: 'Full Term' },
  ],
} as const

export const MATERNAL_HEALTH: readonly MaternalMetric[] = [
  { id: 'weight', icon: 'heart', tone: 'pink', value: '62.5', unit: 'kg', label: 'Current Weight', supporting: '+5.2 kg', supportingLabel: 'total change' },
  { id: 'blood-pressure', icon: 'heart', tone: 'red', value: '120/80', unit: 'mmHg', label: 'Blood Pressure' },
  { id: 'heart-rate', icon: 'heart', tone: 'red', value: '72', unit: 'bpm', label: 'Heart Rate' },
  { id: 'temperature', icon: 'thermometer', tone: 'blue', value: '36.6', unit: '°C', label: 'Body Temperature' },
] as const

export const BABY_DEVELOPMENT = {
  headline: 'Your baby is the size of a',
  headlineEmphasis: 'honeydew melon',
  body: 'Baby is growing rapidly, gaining weight and continuing to develop lungs and brain function.',
  measures: [
    { id: 'length', icon: 'ruler', label: 'Length', value: '~ 42 cm' },
    { id: 'weight', icon: 'weight', label: 'Weight', value: '~ 1.8 kg' },
  ],
} as const

export const LATEST_ULTRASOUND = {
  takenOn: '20 Oct 2026',
  caption: ['Normal growth and development.', 'Fetal heart rate is within normal range.'],
} as const

export const NEXT_APPOINTMENT = {
  day: 'Mon',
  date: '20',
  month: 'Oct 2026',
  type: 'Routine Check-up',
  gestationalAge: '32 weeks 4 days',
  time: '09:00 – 09:30 AM',
  clinician: 'Dr. Sari Melati, Sp.OG',
  location: 'BUNDA Mother & Child Center',
  room: 'Room 201',
} as const

export const PRENATAL_CHECKLIST: readonly PrenatalChecklistItem[] = [
  { id: 'first-trimester-screening', label: 'First Trimester Screening', status: 'Completed', date: '12 Jun 2026' },
  { id: 'anomaly-scan', label: 'Anomaly Scan (USG)', status: 'Completed', date: '28 Aug 2026' },
  { id: 'blood-test-third-trimester', label: 'Blood Test (3rd Trimester)', status: 'Due Soon', date: '20 Oct 2026' },
  { id: 'tdap-vaccination', label: 'Tdap Vaccination', status: 'Pending', date: '20 Oct 2026' },
  { id: 'group-b-strep-test', label: 'Group B Strep Test', status: 'Pending', date: '4 Nov 2026' },
] as const

export const DOCTOR_NOTE = {
  clinician: 'Dr. Sari Melati, Sp.OG',
  recorded: '20 Oct 2026',
  time: '09:30 AM',
  body:
    'Patient is doing well. Fetal growth appropriate for gestational age. Vital signs stable. ' +
    'Counseled on nutrition, birth plan, and signs of labor. Continue routine check-ups.',
} as const

/* Synthetic maternity clinical fixtures approved for this frontend demonstration only. */

export type MaternityRecordType = 'Prenatal Visit' | 'Ultrasound' | 'Screening' | 'Clinical Note'

export type MaternityRecordDetail = {
  readonly label: string
  readonly value: string
}

export type MaternityMedicalRecord = {
  readonly id: string
  readonly date: string
  readonly title: string
  readonly type: MaternityRecordType
  readonly clinician: string
  readonly status: 'Completed'
  readonly summary: string
  readonly detail: readonly MaternityRecordDetail[]
}

export const MATERNITY_MEDICAL_RECORDS: readonly MaternityMedicalRecord[] = [
  {
    id: 'maternity-record-2026-10-20-prenatal-checkup',
    date: '20 Oct 2026',
    title: 'Routine Prenatal Check-up',
    type: 'Prenatal Visit',
    clinician: 'Dr. Sari Melati, Sp.OG',
    status: 'Completed',
    summary: 'Maternal vital signs stable. Fetal growth appropriate for gestational age.',
    detail: [
      { label: 'Gestational age', value: '32 weeks 4 days' },
      { label: 'Blood pressure', value: '120/80 mmHg' },
      { label: 'Weight', value: '62.5 kg' },
      { label: 'Plan', value: 'Continue routine check-ups.' },
    ],
  },
  {
    id: 'maternity-record-2026-10-20-ultrasound',
    date: '20 Oct 2026',
    title: 'Third Trimester Ultrasound',
    type: 'Ultrasound',
    clinician: 'Dr. Sari Melati, Sp.OG',
    status: 'Completed',
    summary: 'Normal growth and development. Fetal heart rate is within normal range.',
    detail: [
      { label: 'Gestational age', value: '32 weeks 4 days' },
      { label: 'Estimated fetal weight', value: 'Approximately 1.8 kg' },
    ],
  },
  {
    id: 'maternity-record-2026-08-28-anomaly-scan',
    date: '28 Aug 2026',
    title: 'Anomaly Scan',
    type: 'Screening',
    clinician: 'Dr. Sari Melati, Sp.OG',
    status: 'Completed',
    summary: 'Synthetic demonstration screening entry linked to the completed prenatal checklist item.',
    detail: [{ label: 'Checklist reference', value: 'Anomaly Scan (USG)' }],
  },
  {
    id: 'maternity-record-2026-10-20-doctor-note',
    date: '20 Oct 2026',
    title: "Doctor's Note",
    type: 'Clinical Note',
    clinician: 'Dr. Sari Melati, Sp.OG',
    status: 'Completed',
    summary: DOCTOR_NOTE.body,
    detail: [{ label: 'Recorded', value: '20 Oct 2026, 09:30 AM' }],
  },
] as const

export type MaternityVisit = {
  readonly id: string
  readonly date: string
  readonly title: string
  readonly clinician: string
  readonly summary: string
}

export const MATERNITY_VISIT_HISTORY: readonly MaternityVisit[] = [
  {
    id: 'maternity-visit-2026-10-20',
    date: '20 Oct 2026',
    title: 'Routine Prenatal Check-up',
    clinician: 'Dr. Sari Melati, Sp.OG',
    summary: 'Maternal vital signs stable. Fetal growth appropriate for gestational age.',
  },
  {
    id: 'maternity-visit-2026-08-28',
    date: '28 Aug 2026',
    title: 'Anomaly Scan Review',
    clinician: 'Dr. Sari Melati, Sp.OG',
    summary: 'Completed screening entry. No additional findings are supplied in this demo.',
  },
  {
    id: 'maternity-visit-2026-06-12',
    date: '12 Jun 2026',
    title: 'First Trimester Screening',
    clinician: 'Dr. Sari Melati, Sp.OG',
    summary: 'Completed prenatal checklist entry. No additional findings are supplied in this demo.',
  },
] as const

export type MaternityEducationResource = {
  readonly id: string
  readonly title: string
  readonly category: string
  readonly summary: string
}

export const MATERNITY_EDUCATION_DISCLAIMER =
  'Synthetic education preview. This demo does not provide medical advice. Follow instructions from the treating maternity care team.'

export const MATERNITY_EDUCATION: readonly MaternityEducationResource[] = [
  {
    id: 'education-third-trimester-nutrition',
    title: 'Third Trimester Nutrition',
    category: 'Nutrition',
    summary: 'General nutrition topics recorded for discussion during routine prenatal care.',
  },
  {
    id: 'education-birth-plan',
    title: 'Preparing a Birth Plan',
    category: 'Birth Preparation',
    summary: 'A read-only worksheet overview for preferences to discuss with the maternity care team.',
  },
  {
    id: 'education-signs-of-labor',
    title: 'Recognizing Signs of Labor',
    category: 'Labor',
    summary: 'General signs recorded for review with the maternity care team.',
  },
  {
    id: 'education-urgent-care',
    title: 'When to Contact the Care Team',
    category: 'Safety',
    summary: 'General reminder to contact the maternity care team for urgent concerns or worsening symptoms.',
  },
] as const

export type MaternityDocument = {
  readonly id: string
  readonly title: string
  readonly kind: string
  readonly date: string
  readonly availability: 'Metadata only'
}

export const MATERNITY_DOCUMENTS: readonly MaternityDocument[] = [
  { id: 'document-ultrasound-summary-2026-10-20', title: 'Ultrasound Summary', kind: 'Imaging summary', date: '20 Oct 2026', availability: 'Metadata only' },
  { id: 'document-prenatal-visit-note-2026-10-20', title: 'Prenatal Visit Note', kind: 'Clinical note', date: '20 Oct 2026', availability: 'Metadata only' },
  { id: 'document-anomaly-scan-2026-08-28', title: 'Anomaly Scan Record', kind: 'Screening record', date: '28 Aug 2026', availability: 'Metadata only' },
  { id: 'document-birth-plan-worksheet', title: 'Birth Plan Worksheet', kind: 'Education worksheet', date: 'Not completed', availability: 'Metadata only' },
] as const
