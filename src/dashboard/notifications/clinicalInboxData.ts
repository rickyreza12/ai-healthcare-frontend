export type InboxKind = 'Urgent' | 'Message' | 'Follow-up' | 'Info'

export type InboxPortrait =
  | 'sitiAisyah'
  | 'muhammadRizki'
  | 'budiSantoso'
  | 'anitaDewi'
  | 'ahmadFadhil'
  | 'followupIcon'
  | 'labIcon'
  | 'appointmentIcon'

export type InboxItem = {
  readonly id: string
  readonly sourceName: string
  /** Supplied reference label (patient ID or affected-count); never a live patient route. */
  readonly referenceLabel: string
  readonly portrait: InboxPortrait
  readonly subject: string
  readonly kind: InboxKind
  readonly timeLabel: string
  /** Explicit fixture order: 1 is the newest supplied item. */
  readonly order: number
  readonly preview: string
  readonly unread: boolean
}

/** Supplied synthetic queue. Order 1 (Siti Aisyah) is newest under Newest First. */
export const INBOX_ITEMS: readonly InboxItem[] = [
  {
    id: 'siti-aisyah-bp-alert',
    sourceName: 'Siti Aisyah',
    referenceLabel: 'Patient ID: B0001245',
    portrait: 'sitiAisyah',
    subject: 'High Blood Pressure Alert',
    kind: 'Urgent',
    timeLabel: '10:24 AM',
    order: 1,
    preview: 'Latest reading 162/98 mmHg, higher than normal range.',
    unread: true,
  },
  {
    id: 'rizki-new-message',
    sourceName: 'Muhammad Rizki',
    referenceLabel: 'Patient ID: B0002389',
    portrait: 'muhammadRizki',
    subject: 'New Patient Message',
    kind: 'Message',
    timeLabel: '09:15 AM',
    order: 2,
    preview: 'Hi Doctor, I have a question about the medication you prescribed...',
    unread: true,
  },
  {
    id: 'followup-reminder-tomorrow',
    sourceName: 'Follow-up Reminder',
    referenceLabel: '2 patients',
    portrait: 'followupIcon',
    subject: 'Follow-up Reminder',
    kind: 'Follow-up',
    timeLabel: '08:30 AM',
    order: 3,
    preview: 'Scheduled follow-up appointments tomorrow (2 patients).',
    unread: false,
  },
  {
    id: 'budi-glucose-alert',
    sourceName: 'Budi Santoso',
    referenceLabel: 'Patient ID: B0000456',
    portrait: 'budiSantoso',
    subject: 'Abnormal Lab Result',
    kind: 'Urgent',
    timeLabel: 'Yesterday, 4:20 PM',
    order: 4,
    preview: 'Fasting glucose: 260 mg/dL (Ref: 70-125 mg/dL)',
    unread: true,
  },
  {
    id: 'anita-refill-request',
    sourceName: 'Anita Dewi',
    referenceLabel: 'Patient ID: B0001789',
    portrait: 'anitaDewi',
    subject: 'Prescription Refill Request',
    kind: 'Message',
    timeLabel: 'Yesterday, 2:14 PM',
    order: 5,
    preview: 'Request for hypertension medication refill (Amlodipine 5mg).',
    unread: true,
  },
  {
    id: 'lab-cbc-available',
    sourceName: 'Lab Department',
    referenceLabel: 'Laboratory',
    portrait: 'labIcon',
    subject: 'Lab Result Available',
    kind: 'Info',
    timeLabel: 'Yesterday, 11:03 AM',
    order: 6,
    preview: 'Complete Blood Count (CBC) results are ready for review.',
    unread: false,
  },
  {
    id: 'appointment-rescheduled',
    sourceName: 'Appointment Update',
    referenceLabel: '1 patient',
    portrait: 'appointmentIcon',
    subject: 'Appointment Rescheduled',
    kind: 'Message',
    timeLabel: 'May 18, 2026, 5:30 PM',
    order: 7,
    preview: 'Patient moved appointment from May 20 to May 22, 2026.',
    unread: false,
  },
  {
    id: 'ahmad-dtp-due',
    sourceName: 'Ahmad Fadhil',
    referenceLabel: 'Patient ID: B0003012',
    portrait: 'ahmadFadhil',
    subject: 'Vaccination Due',
    kind: 'Follow-up',
    timeLabel: 'May 18, 2026, 10:12 AM',
    order: 8,
    preview: 'DTP booster due in 1 week (May 25, 2026).',
    unread: true,
  },
]

/** Global supplied counts shown in filter labels; not derived from the eight visible rows. */
export const INBOX_GLOBAL_COUNTS = {
  all: 12,
  urgent: 3,
  messages: 5,
  followUps: 4,
} as const

export type InboxFilterKey = 'all' | 'urgent' | 'messages' | 'followUps'

export const INBOX_FILTERS: readonly { readonly key: InboxFilterKey; readonly label: string }[] = [
  { key: 'all', label: `All (${INBOX_GLOBAL_COUNTS.all})` },
  { key: 'urgent', label: `Urgent Alerts (${INBOX_GLOBAL_COUNTS.urgent})` },
  { key: 'messages', label: `Patient Messages (${INBOX_GLOBAL_COUNTS.messages})` },
  { key: 'followUps', label: `Follow-ups (${INBOX_GLOBAL_COUNTS.followUps})` },
]

export type InboxSort = 'newest' | 'oldest'

export const INBOX_SORT_OPTIONS: readonly { readonly value: InboxSort; readonly label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
]

export const INBOX_DEFAULT_SELECTED_ID = 'siti-aisyah-bp-alert'

export const INBOX_PAGE = {
  heading: 'Notifications & Clinical Inbox',
  supporting: 'Stay updated with patient messages, clinical alerts, and follow-up reminders.',
} as const

export type VitalMetricKey = 'bp' | 'hr' | 'temp' | 'spo2'

export type VitalSign = {
  readonly key: VitalMetricKey
  readonly metric: string
  readonly value: string
  readonly unit: string
  readonly status: 'High' | 'Normal'
  readonly range: string
}

export type SitiDetail = {
  readonly name: string
  readonly gender: string
  readonly age: string
  readonly patientId: string
  readonly phone: string
  readonly alertTitle: string
  readonly status: 'Urgent'
  readonly alertCopy: string
  readonly vitalsRecordedAt: string
  readonly vitals: readonly VitalSign[]
  readonly messageSender: string
  readonly messageTime: string
  readonly messageBody: string
  readonly conversationLabel: string
}

/** Only the Siti Aisyah item has supplied extended detail. */
export const SITI_DETAIL: SitiDetail = {
  name: 'Siti Aisyah',
  gender: 'Female',
  age: '32 years',
  patientId: 'B0001245',
  phone: '+62 812 3456 7890',
  alertTitle: 'High Blood Pressure Alert',
  status: 'Urgent',
  alertCopy: 'Latest reading is higher than normal range. Please review and take appropriate action.',
  vitalsRecordedAt: 'Today, 10:24 AM',
  vitals: [
    { key: 'bp', metric: 'Blood pressure', value: '162/98', unit: 'mmHg', status: 'High', range: 'Normal: < 140/90' },
    { key: 'hr', metric: 'Heart rate', value: '88', unit: 'bpm', status: 'Normal', range: '60 – 100' },
    { key: 'temp', metric: 'Temperature', value: '36.8', unit: '°C', status: 'Normal', range: '36.1 – 37.2' },
    { key: 'spo2', metric: 'Oxygen saturation', value: '98', unit: '%', status: 'Normal', range: '≥ 95' },
  ],
  messageSender: 'Siti Aisyah',
  messageTime: 'Today, 10:24 AM',
  messageBody:
    'Pagi Dok, saya merasa pusing sejak semalam dan tadi pagi tekanan darah saya terasa tinggi. Mohon arahan selanjutnya. Terima kasih.',
  conversationLabel: 'View full conversation (3 messages)',
}
