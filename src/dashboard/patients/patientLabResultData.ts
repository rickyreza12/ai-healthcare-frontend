export type LabResultFlag = 'normal' | 'high' | 'low' | 'positive' | 'negative'

export type PatientLabAnalyte = {
  readonly id: string
  readonly name: string
  readonly result: string
  /** `null` when the test has no unit, so no placeholder is rendered. */
  readonly unit: string | null
  readonly referenceRange: string
  readonly flag: LabResultFlag
}

export type PatientLabReport = {
  readonly id: string
  readonly patientId: string
  /** The supplied medical-record row these demo values are attached to. */
  readonly medicalRecordId: string
  readonly title: string
  readonly collectedAt: string
  readonly reportedAt: string
  readonly orderedBy: string
  readonly specimen: string
  readonly status: 'Final'
  readonly analytes: readonly PatientLabAnalyte[]
}

/**
 * Approved synthetic demo values. They exist to demonstrate the interface and are
 * not clinical records, validated results, or a laboratory-system import.
 */
export const LAB_SYNTHETIC_NOTICE =
  'Synthetic demo results. Values and reference ranges are provided for interface demonstration only and are not clinical records.'

export const LAB_RANGE_LABEL = 'Demo reference range'

export const LAB_FLAG_LABELS: Record<LabResultFlag, string> = {
  normal: 'Normal',
  high: 'High',
  low: 'Low',
  positive: 'Positive',
  negative: 'Negative',
}

export const PATIENT_LAB_REPORTS: readonly PatientLabReport[] = [
  {
    id: 'lab-2024-05-03-cbc',
    patientId: 'P-00012345',
    medicalRecordId: 'record-2024-05-03-complete-blood-count-cbc',
    title: 'Complete Blood Count (CBC)',
    collectedAt: '3 May 2024, 08:15 AM',
    reportedAt: '3 May 2024, 11:30 AM',
    orderedBy: 'Dr. Ahmad Rahman',
    specimen: 'Whole blood',
    status: 'Final',
    analytes: [
      { id: 'cbc-hemoglobin', name: 'Hemoglobin', result: '12.1', unit: 'g/dL', referenceRange: '12.0-15.5', flag: 'normal' },
      { id: 'cbc-hematocrit', name: 'Hematocrit', result: '36.8', unit: '%', referenceRange: '36.0-46.0', flag: 'normal' },
      { id: 'cbc-white-blood-cells', name: 'White Blood Cells', result: '7.4', unit: 'x10^9/L', referenceRange: '4.0-11.0', flag: 'normal' },
      { id: 'cbc-red-blood-cells', name: 'Red Blood Cells', result: '4.12', unit: 'x10^12/L', referenceRange: '3.80-5.20', flag: 'normal' },
      { id: 'cbc-platelets', name: 'Platelets', result: '248', unit: 'x10^9/L', referenceRange: '150-450', flag: 'normal' },
    ],
  },
  {
    id: 'lab-2024-04-28-urine-analysis',
    patientId: 'P-00012345',
    medicalRecordId: 'record-2024-04-28-urine-analysis',
    title: 'Urine Analysis',
    collectedAt: '28 Apr 2024, 11:10 AM',
    reportedAt: '28 Apr 2024, 01:20 PM',
    orderedBy: 'Dr. Sari Melati, Sp.PK',
    specimen: 'Midstream urine',
    status: 'Final',
    analytes: [
      { id: 'urine-color', name: 'Color', result: 'Yellow', unit: null, referenceRange: 'Yellow', flag: 'normal' },
      { id: 'urine-clarity', name: 'Clarity', result: 'Clear', unit: null, referenceRange: 'Clear', flag: 'normal' },
      { id: 'urine-specific-gravity', name: 'Specific Gravity', result: '1.015', unit: null, referenceRange: '1.005-1.030', flag: 'normal' },
      { id: 'urine-ph', name: 'pH', result: '6.0', unit: null, referenceRange: '5.0-8.0', flag: 'normal' },
      { id: 'urine-protein', name: 'Protein', result: 'Negative', unit: null, referenceRange: 'Negative', flag: 'negative' },
      { id: 'urine-glucose', name: 'Glucose', result: 'Negative', unit: null, referenceRange: 'Negative', flag: 'negative' },
      { id: 'urine-ketones', name: 'Ketones', result: 'Negative', unit: null, referenceRange: 'Negative', flag: 'negative' },
      { id: 'urine-leukocyte-esterase', name: 'Leukocyte Esterase', result: 'Negative', unit: null, referenceRange: 'Negative', flag: 'negative' },
      { id: 'urine-nitrite', name: 'Nitrite', result: 'Negative', unit: null, referenceRange: 'Negative', flag: 'negative' },
    ],
  },
]
