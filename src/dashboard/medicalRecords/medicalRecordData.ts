import type { AvatarKey } from '../dashboardData.ts'

export type MedicalRecordType = 'Consultation' | 'Lab Result' | 'Prescription' | 'Imaging' | 'Document'

export type MedicalRecordStatus = 'Completed' | 'Active' | 'Expired'

/** Presentational tone keys sampled from the approved reference rows. */
export type MedicalRecordTone = 'teal' | 'blue' | 'amber' | 'rose'

export type RecordIconKey = 'records' | 'stethoscope' | 'flask' | 'pill' | 'image' | 'document'

export type MedicalRecord = {
  readonly id: string
  readonly title: string
  readonly type: MedicalRecordType
  readonly clinician: string
  readonly date: string
  readonly time: string
  readonly status: MedicalRecordStatus
  readonly month: string
  readonly tone: MedicalRecordTone
  /** Supplied only for the record that carries extended detail. */
  readonly examination?: string
  readonly reason?: string
}

export type RecordCategoryKey = 'all' | 'consultations' | 'lab' | 'prescriptions' | 'imaging' | 'documents'

export type RecordCategory = {
  readonly key: RecordCategoryKey
  /** `null` means the category keeps every record type. */
  readonly type: MedicalRecordType | null
  readonly label: string
  readonly count: number
  readonly icon: RecordIconKey
}

/**
 * Supplied global summary counts. They describe the whole reference dataset,
 * not the nine sample rows rendered on this page.
 */
export const RECORD_CATEGORIES: readonly RecordCategory[] = [
  { key: 'all', type: null, label: 'All Records', count: 128, icon: 'records' },
  { key: 'consultations', type: 'Consultation', label: 'Consultations', count: 42, icon: 'stethoscope' },
  { key: 'lab', type: 'Lab Result', label: 'Lab Results', count: 28, icon: 'flask' },
  { key: 'prescriptions', type: 'Prescription', label: 'Prescriptions', count: 24, icon: 'pill' },
  { key: 'imaging', type: 'Imaging', label: 'Imaging', count: 18, icon: 'image' },
  { key: 'documents', type: 'Document', label: 'Documents', count: 16, icon: 'document' },
]

export const RECORD_TOTAL = RECORD_CATEGORIES[0].count

export const DEFAULT_MEDICAL_RECORD_ID = 'record-2024-05-05-chest-x-ray'

export type RecordImage = {
  readonly key: 'ap' | 'lateral'
  readonly label: string
  readonly alt: string
  /** Intrinsic pixel size, so the browser reserves the box and never crops the raster. */
  readonly width: number
  readonly height: number
}

/**
 * The one supplied record with extended content. The reference identifier is a medical-record
 * number, not a patient route id, so it is displayed as a label and never linked.
 */
export type MedicalRecordDetail = {
  readonly recordId: string
  readonly patientName: string
  readonly patientAge: number
  readonly patientGender: 'Female' | 'Male'
  readonly patientAvatar: AvatarKey
  readonly patientRecordLabel: string
  readonly specialty: string
  readonly department: string
  readonly examination: string
  readonly reason: string
  readonly findings: string
  readonly images: readonly RecordImage[]
  readonly documentTitle: string
  readonly documentMeta: string
}

export const CHEST_XRAY_DETAIL: MedicalRecordDetail = {
  recordId: DEFAULT_MEDICAL_RECORD_ID,
  patientName: 'Siti Aisyah',
  patientAge: 32,
  patientGender: 'Female',
  patientAvatar: 'sitiAisyah',
  patientRecordLabel: 'B0001245',
  specialty: 'Radiology Specialist',
  department: 'BUNDA Hospital - Radiology Department',
  examination: 'Chest X-Ray Thorax AP/Lateral',
  reason: 'Examination for persistent cough',
  findings: 'Lung fields are clear. No evidence of active pulmonary infiltrates. Cardiomediastinal silhouette within normal limits. No pleural effusion. Bony structures appear intact.',
  images: [
    { key: 'ap', label: 'AP View', alt: 'Chest X-ray, AP view', width: 202, height: 200 },
    { key: 'lateral', label: 'Lateral View', alt: 'Chest X-ray, lateral view', width: 206, height: 200 },
  ],
  documentTitle: 'Radiology Report - Chest X-Ray',
  documentMeta: 'PDF • 245 KB • 5 May 2024',
}

/** The nine supplied reference rows, in reference order. */
export const MEDICAL_RECORDS: readonly MedicalRecord[] = [
  { id: DEFAULT_MEDICAL_RECORD_ID, title: 'Chest X-Ray', type: 'Imaging', clinician: 'Dr. Sari Melati, Sp.Rad', date: '5 May 2024', time: '10:24 AM', status: 'Completed', month: 'May 2024', tone: 'teal', examination: CHEST_XRAY_DETAIL.examination, reason: CHEST_XRAY_DETAIL.reason },
  { id: 'record-2024-05-03-complete-blood-count-cbc', title: 'Complete Blood Count (CBC)', type: 'Lab Result', clinician: 'Dr. Ahmad Rahman', date: '3 May 2024', time: '08:15 AM', status: 'Completed', month: 'May 2024', tone: 'blue' },
  { id: 'record-2024-05-02-general-consultation', title: 'General Consultation', type: 'Consultation', clinician: 'Dr. Ahmad Rahman', date: '2 May 2024', time: '2:30 PM', status: 'Completed', month: 'May 2024', tone: 'amber' },
  { id: 'record-2024-05-02-prescribed-medication', title: 'Prescribed Medication', type: 'Prescription', clinician: 'Dr. Ahmad Rahman', date: '2 May 2024', time: '2:30 PM', status: 'Active', month: 'May 2024', tone: 'rose' },
  { id: 'record-2024-05-01-medical-certificate', title: 'Medical Certificate', type: 'Document', clinician: 'Dr. Ahmad Rahman', date: '1 May 2024', time: '09:20 AM', status: 'Completed', month: 'May 2024', tone: 'blue' },
  { id: 'record-2024-04-28-urine-analysis', title: 'Urine Analysis', type: 'Lab Result', clinician: 'Dr. Sari Melati, Sp.PK', date: '28 Apr 2024', time: '11:10 AM', status: 'Completed', month: 'April 2024', tone: 'blue' },
  { id: 'record-2024-04-20-follow-up-consultation', title: 'Follow Up Consultation', type: 'Consultation', clinician: 'Dr. Ahmad Rahman', date: '20 Apr 2024', time: '10:00 AM', status: 'Completed', month: 'April 2024', tone: 'amber' },
  { id: 'record-2024-04-15-abdominal-ultrasound', title: 'Abdominal Ultrasound', type: 'Imaging', clinician: 'Dr. Budi Santoso, Sp.Rad', date: '15 Apr 2024', time: '09:45 AM', status: 'Completed', month: 'April 2024', tone: 'teal' },
  { id: 'record-2024-04-15-prescribed-medication', title: 'Prescribed Medication', type: 'Prescription', clinician: 'Dr. Ahmad Rahman', date: '15 Apr 2024', time: '09:45 AM', status: 'Expired', month: 'April 2024', tone: 'rose' },
]
