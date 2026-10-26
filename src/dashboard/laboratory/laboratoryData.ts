/** Synthetic laboratory fixtures supplied by the approved BUNDA reference set. */

export type LabTabKey = 'overview' | 'orders' | 'results' | 'specimen-tracking' | 'quality-control'

export type LabGlyphKey =
  | 'overview'
  | 'orders'
  | 'results'
  | 'specimen'
  | 'quality'
  | 'drop'
  | 'flask'
  | 'alert'
  | 'check'
  | 'clock'
  | 'report'

export type LabTone = 'blue' | 'teal' | 'amber' | 'red' | 'green' | 'violet' | 'slate'

export const LAB_TABS: readonly { readonly key: LabTabKey; readonly label: string; readonly glyph: LabGlyphKey }[] = [
  { key: 'overview', label: 'Overview', glyph: 'overview' },
  { key: 'orders', label: 'Orders', glyph: 'orders' },
  { key: 'results', label: 'Results', glyph: 'results' },
  { key: 'specimen-tracking', label: 'Specimen Tracking', glyph: 'specimen' },
  { key: 'quality-control', label: 'Quality Control', glyph: 'quality' },
]

export const LAB_TAB_COPY: Record<LabTabKey, { readonly heading: string; readonly supporting: string }> = {
  overview: {
    heading: 'Laboratory',
    supporting: 'Monitor test activity, specimen workflow, and result turnaround.',
  },
  orders: {
    heading: 'Laboratory Orders',
    supporting: 'Review requested tests, collection state, and order progress.',
  },
  results: {
    heading: 'Laboratory Results',
    supporting: 'Review completed reports, abnormal findings, and history.',
  },
  'specimen-tracking': {
    heading: 'Specimen Tracking',
    supporting: 'Track collection, transport, processing, and storage of specimens.',
  },
  'quality-control': {
    heading: 'Laboratory Quality Control',
    supporting: 'Monitor analytical accuracy, instrument performance, and test reliability.',
  },
}

export const LAB_ARTWORK_COPY = {
  lineOne: 'Accurate Results',
  lineTwo: 'Healthier Tomorrows',
} as const

export const LAB_DOCTOR = {
  name: 'Dr. Ahmad Rahman',
  role: 'General Practitioner',
} as const

// -- Overview --------------------------------------------------------------

export type LabMetric = {
  readonly key: string
  readonly value: string
  readonly label: string
  readonly comparison: string
  readonly direction: 'up' | 'down' | null
  readonly tone: LabTone
  readonly glyph: LabGlyphKey
}

export const OVERVIEW_METRICS: readonly LabMetric[] = [
  { key: 'total', value: '186', label: 'Total Tests Today', comparison: '12% vs yesterday', direction: 'up', tone: 'teal', glyph: 'report' },
  { key: 'pending', value: '24', label: 'Pending Collection', comparison: '33% vs yesterday', direction: 'up', tone: 'amber', glyph: 'drop' },
  { key: 'processing', value: '38', label: 'In Processing', comparison: '8% vs yesterday', direction: 'down', tone: 'blue', glyph: 'flask' },
  { key: 'critical', value: '6', label: 'Critical Results', comparison: '50% vs yesterday', direction: 'up', tone: 'red', glyph: 'alert' },
  { key: 'completed', value: '118', label: 'Completed Reports', comparison: '18% vs yesterday', direction: 'up', tone: 'green', glyph: 'check' },
]

export const ACTIVITY_TREND = {
  title: 'Test Activity Trend',
  period: 'Last 7 Days',
  labels: ['7 May', '8 May', '9 May', '10 May', '11 May', '12 May', '13 May'],
  series: [
    { key: 'completed', label: 'Completed', color: '#00a895', values: [18, 17, 24, 24, 27, 28, 31] },
    { key: 'processing', label: 'In Processing', color: '#2999f8', values: [8, 10, 9, 10, 13, 15, 18] },
    { key: 'pending', label: 'Pending Collection', color: '#ffa51f', values: [4, 5, 7, 9, 8, 10, 12] },
  ],
  axis: [0, 20, 40, 60, 80],
  note: 'Synthetic test counts from the supplied demonstration dataset.',
} as const

export type CategoryShare = {
  readonly label: string
  readonly percent: number
  readonly color: string
}

export const CATEGORY_DISTRIBUTION: readonly CategoryShare[] = [
  { label: 'Hematology', percent: 32, color: '#2999f8' },
  { label: 'Clinical Chemistry', percent: 28, color: '#08a893' },
  { label: 'Microbiology', percent: 15, color: '#ffa51f' },
  { label: 'Immunology', percent: 12, color: '#987dfa' },
  { label: 'Urinalysis', percent: 8, color: '#75d2f5' },
  { label: 'Others', percent: 5, color: '#cfd9e6' },
]

export const CATEGORY_TOTAL = 486

export type CriticalAlert = {
  readonly id: string
  readonly patientName: string
  readonly test: string
  readonly result: string
  readonly time: string
  readonly status: 'Critical'
}

export const CRITICAL_ALERTS: readonly CriticalAlert[] = [
  { id: 'ca-1', patientName: 'Siti Aisyah', test: 'Hemoglobin', result: '6.8 g/dL', time: '10:24 AM', status: 'Critical' },
  { id: 'ca-2', patientName: 'Muhammad Rizki', test: 'WBC Count', result: '22.4 x10³/µL', time: '09:15 AM', status: 'Critical' },
  { id: 'ca-3', patientName: 'Anita Dewi', test: 'Potassium (K⁺)', result: '6.1 mmol/L', time: '08:30 AM', status: 'Critical' },
  { id: 'ca-4', patientName: 'Budi Santoso', test: 'Blood Glucose', result: '420 mg/dL', time: 'Yesterday, 4:20 PM', status: 'Critical' },
]

export type CollectionEntry = {
  readonly id: string
  readonly time: string
  readonly patientName: string
  readonly work: string
  readonly status: 'Collected' | 'In Progress' | 'Pending' | 'Scheduled'
}

export const COLLECTION_SCHEDULE: readonly CollectionEntry[] = [
  { id: 'cs-1', time: '08:00', patientName: 'Siti Aisyah', work: 'Routine Check Up (CBC)', status: 'Collected' },
  { id: 'cs-2', time: '08:30', patientName: 'Muhammad Rizki', work: 'Dengue Serology', status: 'Collected' },
  { id: 'cs-3', time: '09:00', patientName: 'Anita Dewi', work: 'Prenatal Panel', status: 'In Progress' },
  { id: 'cs-4', time: '09:30', patientName: 'Budi Santoso', work: 'Lipid Profile', status: 'Pending' },
  { id: 'cs-5', time: '10:00', patientName: 'Rina Melati', work: 'Thyroid Function', status: 'Scheduled' },
  { id: 'cs-6', time: '10:30', patientName: 'Ahmad Fadhil', work: 'Liver Function Test', status: 'Scheduled' },
]

// -- Orders ----------------------------------------------------------------

export type LabOrderStatus = 'Completed' | 'Processing' | 'Collected' | 'Pending' | 'Rejected'

export type LabOrderTest = {
  readonly name: string
  readonly category: string
  readonly specimen: string
  readonly priority: string
  readonly status: LabOrderStatus
}

export type LabOrder = {
  readonly number: string
  readonly patientName: string
  readonly patientId: string | null
  readonly testSummary: string
  readonly specimenType: string
  readonly category: string
  readonly status: LabOrderStatus
  readonly time: string
  readonly dateGroup: 'Today' | 'Yesterday'
  readonly tests: readonly LabOrderTest[]
  readonly hasFullDetail: boolean
}

export const LAB_ORDERS: readonly LabOrder[] = [
  {
    number: 'LB250513001',
    patientName: 'Siti Aisyah',
    patientId: 'P-00012345',
    testSummary: 'CBC, ESR',
    specimenType: 'Blood',
    category: 'Hematology',
    status: 'Completed',
    time: '10:24 AM',
    dateGroup: 'Today',
    tests: [
      { name: 'Complete Blood Count (CBC)', category: 'Hematology', specimen: 'Blood', priority: 'Routine', status: 'Completed' },
      { name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Hematology', specimen: 'Blood', priority: 'Routine', status: 'Completed' },
    ],
    hasFullDetail: false,
  },
  {
    number: 'LB250513002',
    patientName: 'Muhammad Rizki',
    patientId: 'P-00067890',
    testSummary: 'Dengue IgG/IgM',
    specimenType: 'Blood',
    category: 'Immunology',
    status: 'Processing',
    time: '09:15 AM',
    dateGroup: 'Today',
    tests: [
      { name: 'Complete Blood Count (CBC)', category: 'Hematology', specimen: 'Blood', priority: 'Routine', status: 'Processing' },
      { name: 'Dengue IgG/IgM', category: 'Immunology', specimen: 'Blood', priority: 'Routine', status: 'Processing' },
      { name: 'Lipid Profile', category: 'Clinical Chemistry', specimen: 'Blood', priority: 'Routine', status: 'Pending' },
    ],
    hasFullDetail: true,
  },
  {
    number: 'LB250513003',
    patientName: 'Anita Dewi',
    patientId: 'P-00054321',
    testSummary: 'Urinalysis',
    specimenType: 'Urine',
    category: 'Urinalysis',
    status: 'Collected',
    time: '08:30 AM',
    dateGroup: 'Today',
    tests: [{ name: 'Urinalysis', category: 'Urinalysis', specimen: 'Urine', priority: 'Routine', status: 'Collected' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250513004',
    patientName: 'Budi Santoso',
    patientId: 'P-00011223',
    testSummary: 'Lipid Profile',
    specimenType: 'Blood',
    category: 'Clinical Chemistry',
    status: 'Pending',
    time: '08:10 AM',
    dateGroup: 'Today',
    tests: [{ name: 'Lipid Profile', category: 'Clinical Chemistry', specimen: 'Blood', priority: 'Routine', status: 'Pending' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250513005',
    patientName: 'Rina Melati',
    patientId: 'P-00099887',
    testSummary: 'Thyroid Panel',
    specimenType: 'Blood',
    category: 'Immunology',
    status: 'Processing',
    time: '07:45 AM',
    dateGroup: 'Today',
    tests: [{ name: 'Thyroid Panel', category: 'Immunology', specimen: 'Blood', priority: 'Routine', status: 'Processing' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250513006',
    patientName: 'Ahmad Fadhil',
    patientId: null,
    testSummary: 'Lipid Profile',
    specimenType: 'Blood',
    category: 'Clinical Chemistry',
    status: 'Pending',
    time: '10:40 AM',
    dateGroup: 'Today',
    tests: [{ name: 'Lipid Profile', category: 'Clinical Chemistry', specimen: 'Blood', priority: 'Routine', status: 'Pending' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250513007',
    patientName: 'Dewi Lestari',
    patientId: null,
    testSummary: 'Thyroid Panel',
    specimenType: 'Blood',
    category: 'Hematology',
    status: 'Pending',
    time: '11:10 AM',
    dateGroup: 'Today',
    tests: [{ name: 'Thyroid Panel', category: 'Hematology', specimen: 'Blood', priority: 'Routine', status: 'Pending' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250513008',
    patientName: 'Budi Santoso',
    patientId: 'P-00011223',
    testSummary: 'Dengue IgG/IgM',
    specimenType: 'Blood',
    category: 'Immunology',
    status: 'Rejected',
    time: '11:35 AM',
    dateGroup: 'Today',
    tests: [{ name: 'Dengue IgG/IgM', category: 'Immunology', specimen: 'Blood', priority: 'Routine', status: 'Rejected' }],
    hasFullDetail: false,
  },
  {
    number: 'RD250512002',
    patientName: 'Ahmad Fadhil',
    patientId: null,
    testSummary: 'Chest X-Ray (Radiology)',
    specimenType: 'Imaging',
    category: 'Radiology',
    status: 'Completed',
    time: '11:10 AM',
    dateGroup: 'Yesterday',
    tests: [{ name: 'Chest X-Ray (Radiology)', category: 'Radiology', specimen: 'Imaging', priority: 'Routine', status: 'Completed' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250512003',
    patientName: 'Dewi Lestari',
    patientId: null,
    testSummary: 'Kidney Function Test',
    specimenType: 'Blood',
    category: 'Clinical Chemistry',
    status: 'Completed',
    time: '09:40 AM',
    dateGroup: 'Yesterday',
    tests: [{ name: 'Kidney Function Test', category: 'Clinical Chemistry', specimen: 'Blood', priority: 'Routine', status: 'Completed' }],
    hasFullDetail: false,
  },
  {
    number: 'LB250512004',
    patientName: 'Andi Pratama',
    patientId: null,
    testSummary: 'HbA1c',
    specimenType: 'Blood',
    category: 'Clinical Chemistry',
    status: 'Completed',
    time: '09:15 AM',
    dateGroup: 'Yesterday',
    tests: [{ name: 'HbA1c', category: 'Clinical Chemistry', specimen: 'Blood', priority: 'Routine', status: 'Completed' }],
    hasFullDetail: false,
  },
]

/** The full order-detail reference is supplied for LB250513002 only. */
export const ORDER_DETAIL_REFERENCE = {
  orderNumber: 'LB250513002',
  patientName: 'Muhammad Rizki',
  patientId: 'P-00067890',
  gender: 'Male',
  age: '28 years',
  dateOfBirth: '12 Jan 1997',
  phone: '+62 812 3456 7890',
  attendingDoctor: 'Dr. Ahmad Rahman',
  orderDate: '13 May 2025',
  orderTime: '09:15 AM',
  priority: 'Routine',
  specimen: {
    type: 'Blood',
    container: 'EDTA Tube',
    volume: '5 mL',
    instructions: 'N/A',
    scheduled: '13 May 2025, 08:30 AM',
    collected: '13 May 2025, 09:15 AM',
    collectedBy: 'Siti Aisyah',
    location: 'Main Clinic – Phlebotomy',
  },
  clinicalNote: 'Mild fever and headache for 2 days. Rule out dengue. Please prioritize CBC and serology.',
  billing: {
    paymentType: 'BPJS Kesehatan',
    estimatedCost: 'Rp 450.000',
    coverage: 'Full Coverage',
  },
} as const

// -- Results ---------------------------------------------------------------

export type LabResultStatus = 'Critical' | 'Abnormal' | 'Normal' | 'Pending'

export type LabResult = {
  readonly id: string
  readonly orderNumber: string
  readonly patientName: string
  readonly test: string
  readonly time: string
  readonly dateGroup: 'Today' | 'Yesterday'
  readonly status: LabResultStatus
  readonly critical: boolean
  readonly summary: string
}

export const LAB_RESULTS: readonly LabResult[] = [
  { id: 'res-1', orderNumber: 'LB250513001', patientName: 'Siti Aisyah', test: 'Complete Blood Count (CBC)', time: '10:24 AM', dateGroup: 'Today', status: 'Critical', critical: true, summary: 'Hemoglobin 6.8 g/dL, below the reference range.' },
  { id: 'res-2', orderNumber: 'LB250513002', patientName: 'Muhammad Rizki', test: 'WBC Count', time: '09:15 AM', dateGroup: 'Today', status: 'Critical', critical: true, summary: 'WBC Count 22.4 x10³/µL, above the reference range.' },
  { id: 'res-3', orderNumber: 'LB250513003', patientName: 'Anita Dewi', test: 'Potassium (K⁺)', time: '08:30 AM', dateGroup: 'Today', status: 'Critical', critical: true, summary: 'Potassium 6.1 mmol/L, above the reference range.' },
  { id: 'res-4', orderNumber: 'LB250513004', patientName: 'Budi Santoso', test: 'Blood Glucose', time: 'Yesterday, 4:20 PM', dateGroup: 'Yesterday', status: 'Critical', critical: true, summary: 'Blood glucose 420 mg/dL, above the reference range.' },
  { id: 'res-5', orderNumber: 'LB250513005', patientName: 'Rina Melati', test: 'Thyroid Panel', time: 'Yesterday, 4:20 PM', dateGroup: 'Yesterday', status: 'Normal', critical: false, summary: 'Thyroid panel returned within the supplied reference range.' },
  { id: 'res-6', orderNumber: 'RD250512002', patientName: 'Ahmad Fadhil', test: 'Chest X-Ray (Radiology)', time: 'Yesterday, 11:10 AM', dateGroup: 'Yesterday', status: 'Normal', critical: false, summary: 'Radiology report returned with no abnormal finding in the supplied reference.' },
  { id: 'res-7', orderNumber: 'LB250512003', patientName: 'Dewi Lestari', test: 'Kidney Function Test', time: 'Yesterday, 09:40 AM', dateGroup: 'Yesterday', status: 'Pending', critical: false, summary: 'Validation is pending in the supplied reference.' },
  { id: 'res-8', orderNumber: 'LB250512004', patientName: 'Andi Pratama', test: 'HbA1c', time: 'Yesterday, 09:15 AM', dateGroup: 'Yesterday', status: 'Normal', critical: false, summary: 'HbA1c returned within the supplied reference range.' },
]

export const RESULTS_METRICS: readonly LabMetric[] = [
  { key: 'all', value: '186', label: 'All Results', comparison: 'Supplied report total', direction: null, tone: 'teal', glyph: 'report' },
  { key: 'critical', value: '6', label: 'Critical', comparison: 'Requires review', direction: null, tone: 'red', glyph: 'alert' },
  { key: 'abnormal', value: '18', label: 'Abnormal', comparison: 'Requires review', direction: null, tone: 'amber', glyph: 'alert' },
  { key: 'normal', value: '142', label: 'Normal', comparison: 'Within reference range', direction: null, tone: 'blue', glyph: 'check' },
  { key: 'validation', value: '20', label: 'Pending Validation', comparison: 'Awaiting validation', direction: null, tone: 'violet', glyph: 'clock' },
]

export type Analyte = {
  readonly id: string
  readonly test: string
  readonly value: string
  readonly unit: string
  readonly referenceRange: string
  readonly flag: 'H' | 'L' | '–'
  readonly status: 'Normal' | 'Abnormal' | 'Critical'
}

export const CBC_ANALYTES: readonly Analyte[] = [
  { id: 'wbc', test: 'WBC (White Blood Cell)', value: '11.8', unit: 'x10³/µL', referenceRange: '4.0 – 10.0', flag: 'H', status: 'Abnormal' },
  { id: 'rbc', test: 'RBC (Red Blood Cell)', value: '4.5', unit: 'x10⁶/µL', referenceRange: '3.8 – 5.2', flag: '–', status: 'Normal' },
  { id: 'hgb', test: 'Hemoglobin (Hgb)', value: '6.8', unit: 'g/dL', referenceRange: '12.0 – 16.0', flag: 'L', status: 'Critical' },
  { id: 'hct', test: 'Hematocrit (Hct)', value: '31.0', unit: '%', referenceRange: '36.0 – 46.0', flag: 'L', status: 'Abnormal' },
  { id: 'mcv', test: 'MCV', value: '82.3', unit: 'fL', referenceRange: '80.0 – 100.0', flag: '–', status: 'Normal' },
  { id: 'mch', test: 'MCH', value: '27.1', unit: 'pg', referenceRange: '27.0 – 33.0', flag: '–', status: 'Normal' },
  { id: 'plt', test: 'Platelet', value: '320', unit: 'x10³/µL', referenceRange: '150 – 450', flag: '–', status: 'Normal' },
]

export const HEMOGLOBIN_TREND = {
  labels: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24'],
  values: [12.0, 11.6, 11.2, 10.9, 10.4, 6.8],
  latest: '6.8 g/dL',
  change: '↓ 5.2',
  note: 'Supplied demonstration trend for the selected result.',
} as const

export const RESULT_PATIENT = {
  name: 'Siti Aisyah',
  patientId: 'P-00012345',
  age: '32 years',
  gender: 'Female',
  phone: '+62 812 3456 7890',
} as const

// -- Specimens -------------------------------------------------------------

export type SpecimenStatus = 'Received' | 'In Transit' | 'Processing' | 'Stored' | 'Pending' | 'Recollect Needed' | 'Rejected'

export type Specimen = {
  readonly id: string
  readonly orderNumber: string
  readonly patientName: string
  readonly testGroup: string
  readonly type: string
  readonly collectionTime: string
  readonly collector: string
  readonly location: string
  readonly temperature: string
  readonly status: SpecimenStatus
  readonly handlingNote: string
}

export const SPECIMENS: readonly Specimen[] = [
  { id: 'LB250513001', orderNumber: 'LB250513001', patientName: 'Siti Aisyah', testGroup: 'Hematology', type: 'Blood (EDTA)', collectionTime: '08:12 AM', collector: 'Dewi S.', location: 'Lab Receiving', temperature: '2–8°C', status: 'Received', handlingNote: 'Specimen received in good condition. Tube properly labeled.' },
  { id: 'LB250513002', orderNumber: 'LB250513002', patientName: 'Muhammad Rizki', testGroup: 'Clinical Chemistry', type: 'Blood (Serum)', collectionTime: '08:30 AM', collector: 'Ani T.', location: 'In Transit', temperature: 'Ambient', status: 'In Transit', handlingNote: 'In transit to the laboratory. No handling exception recorded.' },
  { id: 'LB250513003', orderNumber: 'LB250513003', patientName: 'Anita Dewi', testGroup: 'Urinalysis', type: 'Urine', collectionTime: '09:05 AM', collector: 'Rina M.', location: 'Hematology Bench', temperature: 'Ambient', status: 'Processing', handlingNote: 'Specimen received in good condition and logged for processing.' },
  { id: 'LB250513004', orderNumber: 'LB250513004', patientName: 'Budi Santoso', testGroup: 'Microbiology', type: 'Stool', collectionTime: '09:40 AM', collector: 'Fadhil A.', location: 'Microbiology Unit', temperature: 'Ambient', status: 'Processing', handlingNote: 'Specimen received in good condition and logged for processing.' },
  { id: 'LB250513005', orderNumber: 'LB250513005', patientName: 'Rina Melati', testGroup: 'Immunology', type: 'Blood (Serum)', collectionTime: '10:15 AM', collector: 'Dewi S.', location: 'Cold Storage', temperature: '4°C', status: 'Stored', handlingNote: 'Specimen stored at the supplied cold-storage temperature.' },
  { id: 'LB250513006', orderNumber: 'LB250513006', patientName: 'Ahmad Fadhil', testGroup: 'Lipid Profile', type: 'Blood (Serum)', collectionTime: '10:40 AM', collector: 'Ani T.', location: 'Lab Receiving', temperature: 'Ambient', status: 'Pending', handlingNote: 'Awaiting laboratory receipt.' },
  { id: 'LB250513007', orderNumber: 'LB250513007', patientName: 'Dewi Lestari', testGroup: 'Thyroid Panel', type: 'Blood (Serum)', collectionTime: '11:10 AM', collector: 'Rina M.', location: 'Hematology Bench', temperature: 'Ambient', status: 'Recollect Needed', handlingNote: 'Recollection requested. The supplied reference does not include a reason.' },
  { id: 'LB250513008', orderNumber: 'LB250513008', patientName: 'Budi Santoso', testGroup: 'Dengue IgG/IgM', type: 'Blood (Serum)', collectionTime: '11:35 AM', collector: 'Fadhil A.', location: 'Lab Receiving', temperature: 'Ambient', status: 'Rejected', handlingNote: 'Specimen rejected at laboratory receipt. The supplied reference gives no rejection reason.' },
]

export const SPECIMEN_METRICS: readonly LabMetric[] = [
  { key: 'collected', value: '186', label: 'Collected Today', comparison: '12% vs yesterday', direction: 'up', tone: 'teal', glyph: 'flask' },
  { key: 'transit', value: '24', label: 'In Transit', comparison: '33% vs yesterday', direction: 'up', tone: 'blue', glyph: 'clock' },
  { key: 'rejected', value: '6', label: 'Rejected Samples', comparison: '50% vs yesterday', direction: 'up', tone: 'red', glyph: 'alert' },
  { key: 'stored', value: '118', label: 'Stored Samples', comparison: '18% vs yesterday', direction: 'up', tone: 'green', glyph: 'report' },
]

export const SPECIMEN_DETAIL_TABS = ['Chain of Custody', 'Specimen Details', 'Handling Notes'] as const
export type SpecimenDetailTab = (typeof SPECIMEN_DETAIL_TABS)[number]

export const SPECIMEN_CHAIN = [
  { id: 'collected', label: 'Specimen Collected', time: '08:12 AM', place: 'Outpatient Clinic' },
  { id: 'transit', label: 'In Transit to Laboratory', time: '08:25 AM', place: 'Internal Transport' },
  { id: 'received', label: 'Received at Laboratory', time: '08:40 AM', place: 'Lab Receiving' },
  { id: 'logged', label: 'Logged In & Verified', time: '08:45 AM', place: 'Lab Receiving' },
  { id: 'processing', label: 'In Processing', time: '09:00 AM', place: 'Hematology Bench' },
  { id: 'results', label: 'Results Available', time: 'Pending', place: '—' },
] as const

// -- Quality control -------------------------------------------------------

export type QcRunStatus = 'Pass' | 'Fail'

export type QcRun = {
  readonly id: string
  readonly date: string
  readonly time: string
  readonly test: string
  readonly analyzer: string
  readonly observed: string
  readonly range: string
  readonly rule: string
  readonly status: QcRunStatus
}

export const QC_RUNS: readonly QcRun[] = [
  { id: 'qc-1', date: '21 Oct 2026', time: '09:42', test: 'Glucose Level 2', analyzer: 'Cobas c 311', observed: '104.2 mg/dL', range: '95.0–105.0', rule: '–', status: 'Pass' },
  { id: 'qc-2', date: '21 Oct 2026', time: '09:21', test: 'Hematology Normal', analyzer: 'Sysmex XN-1000', observed: '7.6 g/dL', range: '7.2–8.0', rule: '–', status: 'Pass' },
  { id: 'qc-3', date: '21 Oct 2026', time: '08:55', test: 'Glucose Level 2', analyzer: 'Cobas c 311', observed: '112.0 mg/dL', range: '95.0–105.0', rule: '1₃s', status: 'Fail' },
  { id: 'qc-4', date: '21 Oct 2026', time: '08:14', test: 'Electrolytes Level 1', analyzer: 'Cobas c 311', observed: '139 mmol/L', range: '135–145', rule: '–', status: 'Pass' },
]

export const QC_METRICS: readonly LabMetric[] = [
  { key: 'runs', value: '128', label: 'QC Runs This Month', comparison: '12% vs last month', direction: 'up', tone: 'teal', glyph: 'flask' },
  { key: 'pass', value: '98.4%', label: 'Quality Control Pass Rate', comparison: '1.6% vs last month', direction: 'up', tone: 'blue', glyph: 'check' },
  { key: 'fail', value: '2', label: 'Out-of-Control Runs', comparison: 'Requires review', direction: null, tone: 'red', glyph: 'alert' },
  { key: 'instruments', value: '12/13', label: 'Instruments Operational', comparison: '1 calibration due', direction: null, tone: 'amber', glyph: 'flask' },
]

export type QcAlert = {
  readonly id: string
  readonly title: string
  readonly severity: 'Critical' | 'Warning'
  readonly body: string
  readonly meta: string
}

export const QC_ALERTS: readonly QcAlert[] = [
  {
    id: 'qc-a1',
    title: '1₃s Rule Violation',
    severity: 'Critical',
    body: 'Glucose Level 2 control exceeded +3 standard deviations. Review analyzer and suspend affected result release.',
    meta: 'Cobas c 311 · 21 Oct 2026, 08:55',
  },
  {
    id: 'qc-a2',
    title: '1₂s Warning',
    severity: 'Warning',
    body: 'CRP Level 1 control exceeded +2 standard deviations. Investigate trend before continued testing.',
    meta: 'Mindray BS-200 · 20 Oct 2026, 16:30',
  },
]

export type QcEquipment = {
  readonly id: string
  readonly name: string
  readonly detail: string
  readonly status: 'Operational' | 'Due Soon' | 'Scheduled'
}

export const QC_EQUIPMENT: readonly QcEquipment[] = [
  { id: 'eq-1', name: 'Cobas c 311 Analyzer', detail: 'Clinical Chemistry · Last QC 09:42', status: 'Operational' },
  { id: 'eq-2', name: 'Sysmex XN-1000', detail: 'Hematology · Last QC 09:21', status: 'Operational' },
  { id: 'eq-3', name: 'Mindray BS-200', detail: 'Calibration due: 22 Oct 2026', status: 'Due Soon' },
  { id: 'eq-4', name: 'External Quality Assessment', detail: 'Scheduled: November 2026', status: 'Scheduled' },
]

export const QC_CHART = {
  title: 'Levey–Jennings Control Chart',
  subtitle: 'Clinical Chemistry · Glucose · Level 2 Control',
  period: 'Last 30 Days',
  labels: ['1 Oct', '6 Oct', '11 Oct', '16 Oct', '21 Oct', '26 Oct'],
  values: [99, 100, 101, 100, 102, 97, 98, 104, 108, 101, 100, 101, 98, 107, 104, 110, 111, 104, 107, 102, 99, 100, 102, 104, 101, 105, 102, 104, 100, 102],
  measureLabel: 'Daily control measurements',
  limits: { low: 92, high: 112, warningLow: 96, warningHigh: 108 },
  yTicks: [92, 96, 100, 104, 108, 112],
  legend: [
    { label: 'Within limits', color: '#00a895' },
    { label: 'Warning (+2 SD)', color: '#ffa51f' },
    { label: 'Violation (+3 SD)', color: '#e5484d' },
  ],
} as const

// -- Search option lists ---------------------------------------------------

export const ORDER_STATUSES: readonly LabOrderStatus[] = ['Completed', 'Processing', 'Collected', 'Pending', 'Rejected']
export const RESULT_STATUSES: readonly LabResultStatus[] = ['Critical', 'Abnormal', 'Normal', 'Pending']
export const SPECIMEN_STATUSES: readonly SpecimenStatus[] = ['Received', 'In Transit', 'Processing', 'Stored', 'Pending', 'Recollect Needed', 'Rejected']
export const QC_STATUSES: readonly QcRunStatus[] = ['Pass', 'Fail']
export const QC_ANALYZERS: readonly string[] = [...new Set(QC_RUNS.map((run) => run.analyzer))]
export const SPECIMEN_TYPES: readonly string[] = [...new Set(LAB_ORDERS.map((order) => order.specimenType))]
