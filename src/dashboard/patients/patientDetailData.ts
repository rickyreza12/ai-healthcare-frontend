/**
 * Supplied synthetic reference content for the patient detail workspace.
 *
 * Every value below is copied from the approved detail references (03.1, 03.2, 03.3, 03.4).
 * None of it is generated at runtime and none of it is a live clinical conclusion.
 */

export type DetailTabKey = 'overview' | 'ai-summary' | 'medical-record' | 'appointments' | 'lab-results'

export type DetailTab = {
  readonly key: DetailTabKey
  readonly label: string
}

export const DETAIL_TABS: readonly DetailTab[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'ai-summary', label: 'AI Summary' },
  { key: 'medical-record', label: 'Medical Record' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'lab-results', label: 'Lab Results' },
]

export type SummarySectionKey = 'summary' | 'evidence' | 'data-quality'

export type SummarySection = {
  readonly key: SummarySectionKey
  readonly label: string
}

export const SUMMARY_SECTIONS: readonly SummarySection[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'evidence', label: 'Sources & Evidence' },
  { key: 'data-quality', label: 'Data Quality' },
]

export type EmergencyContact = {
  readonly name: string
  readonly relation: string
  readonly phone: string
}

export type PatientIdentity = {
  /** Detail reference supplies its own patient number, separate from the directory row identifier. */
  readonly patientNumber: string
  readonly status: string
  readonly age: number
  readonly gender: string
  readonly religion: string
  readonly dateOfBirth: string
  readonly dateOfBirthLong: string
  readonly phone: string
  readonly address: string
  readonly emergencyContact: EmergencyContact
}

export type Vital = {
  readonly label: string
  readonly value: string
  readonly unit: string
  readonly status: string
  readonly tone: VitalTone
}

export type VitalTone = 'heart' | 'pulse' | 'temperature' | 'weight'

export type OverviewCondition = {
  readonly title: string
  readonly description: string
  readonly lastVisitReason: string
  readonly lastVisitDate: string
  readonly careContext: string
  readonly careContextNote: string
}

export type Allergy = {
  readonly name: string
  readonly kind: string
  readonly severity: 'high' | 'medium' | 'low'
}

export type Medication = {
  readonly name: string
  readonly dose: string
  readonly status: string
}

export type HistoryEntry = {
  readonly date: string
  readonly title: string
  readonly note: string
  readonly clinician: string
  readonly role: string
}

export type Overview = {
  readonly vitalsChecked: string
  readonly vitals: readonly Vital[]
  readonly condition: OverviewCondition
  readonly allergies: readonly Allergy[]
  readonly medications: readonly Medication[]
  readonly history: readonly HistoryEntry[]
}

export type ClinicalSummary = {
  readonly heading: string
  readonly status: string
  readonly generated: string
  readonly sourceNote: string
  readonly body: string
  readonly sourceCount: number
}

export type ContextCard = {
  readonly label: string
  readonly value: string
  readonly detail: string
  readonly icon: ContextIconKey
}

export type ContextIconKey = 'age' | 'gender' | 'codes' | 'specialist' | 'dates' | 'medication'

export type SoapNote = {
  readonly initial: string
  readonly label: string
  readonly body: string
  readonly tone: SoapTone
}

export type SoapTone = 'subjective' | 'objective' | 'assessment' | 'plan'

export type SourceId = 'S1' | 'S2' | 'S3' | 'S4'

export type TimelineEntry = {
  readonly date: string
  readonly title: string
  readonly clinician: string
  readonly note: string
  readonly source: SourceId
}

export type AlertLevel = 'high' | 'medium' | 'info'

export type ClinicalAlert = {
  readonly title: string
  readonly description: string
  readonly level: AlertLevel
}

export type SourceGroup = {
  readonly label: string
  readonly count: string
  readonly markers: readonly SourceId[]
  readonly icon: SourceIconKey
}

export type SourceIconKey = 'emr' | 'diagnosis' | 'medication' | 'soap'

export type QuickActionKey = 'view-sources' | 'export-summary' | 'mark-reviewed' | 'open-assistant'

export type AvailabilityDomain = {
  readonly label: string
  readonly available: boolean
}

export type OverviewTab = {
  readonly summary: ClinicalSummary
  readonly context: readonly ContextCard[]
  readonly soap: readonly SoapNote[]
  readonly timeline: readonly TimelineEntry[]
  readonly alerts: readonly ClinicalAlert[]
  readonly sourceGroups: readonly SourceGroup[]
  readonly quickActions: readonly QuickActionKey[]
  readonly availability: readonly AvailabilityDomain[]
}

export type Claim = {
  readonly id: string
  readonly number: number
  readonly title: string
  readonly description: string
  readonly sources: readonly SourceId[]
  readonly icon: ClaimIconKey
}

export type ClaimIconKey = 'heart' | 'monitor' | 'diamond' | 'notes' | 'check'

export type EvidenceField = {
  readonly label: string
  readonly value: string
}

export type EvidenceRecord = {
  readonly source: SourceId
  readonly title: string
  readonly date: string
  readonly fields: readonly EvidenceField[]
  readonly icon: SourceIconKey
}

export type DataDomainStatus = 'available' | 'partial' | 'not-integrated' | 'not-available'

/** Domain cards reuse the context glyphs and add the notes glyph. */
export type DomainIconKey = ContextIconKey | 'notes'

export type DataDomain = {
  readonly id: string
  readonly label: string
  readonly status: DataDomainStatus
  readonly icon: DomainIconKey
}

/**
 * Only the reference patient carries supplied detail content. Every other directory
 * patient renders its real directory fields plus honest gaps.
 */
export const REFERENCE_DETAIL_ID = 'P-00012345'

export const REFERENCE_IDENTITY: PatientIdentity = {
  patientNumber: 'BDO01245',
  status: 'Active Patient',
  age: 32,
  gender: 'Female',
  religion: 'Muslim',
  dateOfBirth: '12 Mar 1992',
  dateOfBirthLong: '12 March 1992',
  phone: '+62 812 3456 7890',
  address: 'Jl. Melati No. 12, Jakarta Selatan',
  emergencyContact: { name: 'Ahmad Fauzi', relation: 'Husband', phone: '+62 812 9988 7766' },
}

export const REFERENCE_OVERVIEW: Overview = {
  vitalsChecked: 'Latest Check-up • 10 May 2024, 10:30 AM',
  vitals: [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'Normal', tone: 'heart' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'Normal', tone: 'pulse' },
    { label: 'Body Temperature', value: '36.6', unit: '°C', status: 'Normal', tone: 'temperature' },
    { label: 'Weight', value: '62.5', unit: 'kg', status: 'Normal', tone: 'weight' },
  ],
  condition: {
    title: 'Stable Condition',
    description: 'Overall condition is good. Continue regular monitoring and healthy lifestyle.',
    lastVisitReason: 'Routine Prenatal Check-up',
    lastVisitDate: '10 May 2024',
    careContext: 'Pregnant • 32 weeks',
    careContextNote: 'Estimated Due Date: 15 Jul 2024',
  },
  allergies: [
    { name: 'Penicillin', kind: 'Drug allergy', severity: 'high' },
    { name: 'Dust Mites', kind: 'Environmental allergy', severity: 'medium' },
    { name: 'Shellfish', kind: 'Food allergy', severity: 'low' },
  ],
  medications: [
    { name: 'Prenatal Vitamin', dose: '1 tablet daily', status: 'Ongoing' },
    { name: 'Iron Supplement', dose: '1 tablet daily', status: 'Ongoing' },
    { name: 'Calcium Supplement', dose: '1 tablet daily', status: 'Ongoing' },
  ],
  history: [
    { date: '10 May 2024', title: 'Routine Prenatal Check-up', note: 'Normal fetal growth. Continue current supplementation.', clinician: 'Dr. Sari Melati', role: 'General Practitioner' },
    { date: '12 Apr 2024', title: '2nd Trimester Check-up', note: 'All vitals normal. No complications.', clinician: 'Dr. Ahmad Rahman', role: 'General Practitioner' },
    { date: '15 Feb 2024', title: 'First Trimester Check-up', note: 'Pregnancy confirmed. Initial labs within normal range.', clinician: 'Dr. Lina Fauziah', role: 'Obstetrician' },
    { date: '20 Jan 2023', title: 'General Health Check-up', note: 'Overall health good. No significant issues.', clinician: 'Dr. Ahmad Rahman', role: 'General Practitioner' },
  ],
}

export const REFERENCE_SUMMARY: ClinicalSummary = {
  heading: 'AI Patient Summary',
  status: 'Ready',
  generated: 'Generated 19 Oct 2026, 08:42',
  sourceNote: 'From EMR, diagnosis, medication history and SOAP notes',
  body:
    'Siti Aisyah is a 32-year-old female, G2P1, currently in early second trimester of pregnancy, with history of ' +
    'essential hypertension. Based on EMR records, she is on antihypertensive therapy and regular antenatal care ' +
    'follow-up. Recent visits show stable condition with occasional nausea. Continue routine antenatal care, monitor ' +
    'BP, and reinforce nutrition and warning signs.',
  sourceCount: 4,
}

export const REFERENCE_CONTEXT: readonly ContextCard[] = [
  { label: 'Age', value: '32 years', detail: 'Born 12 Mar 1992', icon: 'age' },
  { label: 'Gender', value: 'Female', detail: '', icon: 'gender' },
  { label: 'Recent Diagnosis Codes', value: '009.0, I10, Z34.8', detail: '3 recorded codes', icon: 'codes' },
  { label: 'Specialist Visit History', value: 'OBGYN', detail: '6 visits (Jan 2024 – Oct 2026)', icon: 'specialist' },
  { label: 'Visit Dates', value: '5 recorded visits', detail: 'Jan 2024 – Oct 2026', icon: 'dates' },
  { label: 'Medication History', value: '4 unique medications', detail: 'Prescribed across visits', icon: 'medication' },
]

export const REFERENCE_SOAP: readonly SoapNote[] = [
  { initial: 'S', label: 'Subjective', body: 'Occasional nausea, no vaginal bleeding, no abdominal pain.', tone: 'subjective' },
  { initial: 'O', label: 'Objective', body: 'BP 118/76 mmHg  Weight 62 kg  FHR 150 bpm', tone: 'objective' },
  { initial: 'A', label: 'Assessment', body: 'Normal intrauterine pregnancy at 16 weeks. Hypertension controlled.', tone: 'assessment' },
  { initial: 'P', label: 'Plan', body: 'Continue prenatal vitamins, antihypertensive therapy, routine ANC follow up.', tone: 'plan' },
]

export const REFERENCE_TIMELINE: readonly TimelineEntry[] = [
  { date: '20 Oct 2026', title: 'OBGYN Visit', clinician: 'Dr. Sinta Dewi', note: '23–24 weeks pregnancy. BP stable. Continue medications.', source: 'S1' },
  { date: '15 Aug 2026', title: 'OBGYN Visit', clinician: 'Dr. Sinta Dewi', note: 'Nausea improved. No bleeding. FHR 150 bpm. Continue vitamins.', source: 'S2' },
  { date: '10 May 2026', title: 'General Practitioner', clinician: 'Dr. Ahmad Rahman', note: 'BP well controlled. Advice on diet and activity.', source: 'S3' },
  { date: '12 Jan 2026', title: 'OBGYN Visit', clinician: 'Dr. Sinta Dewi', note: 'Early pregnancy. LMP 10 Dec 2025. USG confirmed IUP.', source: 'S4' },
]

export const REFERENCE_ALERTS: readonly ClinicalAlert[] = [
  { title: 'Hypertension in pregnancy', description: 'Ongoing monitoring needed — monitor BP and fetal growth.', level: 'high' },
  { title: 'Due for antenatal screening', description: 'Second trimester screening (18–22 weeks).', level: 'medium' },
  { title: 'No recent laboratory results', description: 'Latest lab results > 6 months ago. Consider routine ANC labs.', level: 'info' },
]

export const REFERENCE_SOURCE_GROUPS: readonly SourceGroup[] = [
  { label: 'EMR Records', count: '12 records', markers: ['S1', 'S2', 'S3'], icon: 'emr' },
  { label: 'Diagnosis Records (ICD-10)', count: '3 records', markers: ['S1', 'S2', 'S3'], icon: 'diagnosis' },
  { label: 'Medication History', count: '4 records', markers: ['S1', 'S2', 'S3'], icon: 'medication' },
  { label: 'SOAP Notes', count: '5 records', markers: ['S1', 'S2', 'S3'], icon: 'soap' },
]

export const REFERENCE_QUICK_ACTIONS: readonly QuickActionKey[] = [
  'view-sources',
  'export-summary',
  'mark-reviewed',
  'open-assistant',
]

export const REFERENCE_AVAILABILITY: readonly AvailabilityDomain[] = [
  { label: 'EMR Records', available: true },
  { label: 'Diagnosis', available: true },
  { label: 'Medication History', available: true },
  { label: 'SOAP Notes', available: true },
  { label: 'Imaging', available: false },
  { label: 'Laboratory', available: false },
  { label: 'Vitals', available: false },
]

export const REFERENCE_OVERVIEW_TAB: OverviewTab = {
  summary: REFERENCE_SUMMARY,
  context: REFERENCE_CONTEXT,
  soap: REFERENCE_SOAP,
  timeline: REFERENCE_TIMELINE,
  alerts: REFERENCE_ALERTS,
  sourceGroups: REFERENCE_SOURCE_GROUPS,
  quickActions: REFERENCE_QUICK_ACTIONS,
  availability: REFERENCE_AVAILABILITY,
}

export const QUICK_ACTION_LABELS: Record<QuickActionKey, string> = {
  'view-sources': 'View Sources',
  'export-summary': 'Export Summary',
  'mark-reviewed': 'Mark Reviewed',
  'open-assistant': 'Open in Healthcare Assistant',
}

export const CLAIMS: readonly Claim[] = [
  {
    id: 'C1',
    number: 1,
    title: 'Recurrent hypertension in pregnancy',
    description: 'Patient has a history of essential hypertension, with recurrent elevated BP during current pregnancy.',
    sources: ['S1', 'S2', 'S3', 'S4'],
    icon: 'heart',
  },
  {
    id: 'C2',
    number: 2,
    title: 'Ongoing prenatal follow-up',
    description: 'Patient is in early second trimester and has been attending regular ANC visits with routine monitoring.',
    sources: ['S1', 'S2', 'S3', 'S4'],
    icon: 'monitor',
  },
  {
    id: 'C3',
    number: 3,
    title: 'Medication continuity',
    description: 'Patient has been taking amlodipine 5 mg once daily and prenatal vitamins, with good adherence.',
    sources: ['S1', 'S2', 'S3', 'S4'],
    icon: 'diamond',
  },
  {
    id: 'C4',
    number: 4,
    title: 'Symptoms improved based on SOAP notes',
    description: 'Nausea has decreased and no red flag symptoms reported in recent visits.',
    sources: ['S1', 'S2', 'S3', 'S4'],
    icon: 'notes',
  },
  {
    id: 'C5',
    number: 5,
    title: 'No evidence of preeclampsia at this time',
    description: 'Urine protein negative, BP controlled, and no severe features noted in recent records.',
    sources: ['S1', 'S2', 'S3', 'S4'],
    icon: 'check',
  },
]

export const EVIDENCE_RECORDS: readonly EvidenceRecord[] = [
  {
    source: 'S1',
    title: 'EMR Record – Problem List / Medical History',
    date: '20 Oct 2026',
    icon: 'emr',
    fields: [
      { label: 'Department', value: 'General Practice' },
      { label: 'Clinician', value: 'Dr. Sinta Dewi' },
      { label: 'Diagnosis', value: 'I10 – Essential (primary) hypertension' },
      { label: 'Notes', value: 'Known history of hypertension, diagnosed prior to pregnancy. Continue monitoring BP, lifestyle modification, and medication.' },
    ],
  },
  {
    source: 'S2',
    title: 'Diagnosis Record (ICD-10)',
    date: '15 Aug 2026',
    icon: 'diagnosis',
    fields: [
      { label: 'Department', value: 'OBGYN' },
      { label: 'Clinician', value: 'Dr. Sinta Dewi' },
      { label: 'Diagnosis', value: 'O10.0 – Pre-existing hypertension complicating pregnancy, childbirth and the puerperium.' },
    ],
  },
  {
    source: 'S3',
    title: 'Medication History',
    date: '10 May 2026',
    icon: 'medication',
    fields: [
      { label: 'Medication', value: 'Amlodipine 5 mg tablet' },
      { label: 'Dose & Frequency', value: '1 tablet once daily' },
      { label: 'Indication', value: 'Hypertension' },
      { label: 'Prescribed by', value: 'Dr. Ahmad Rahman' },
    ],
  },
  {
    source: 'S4',
    title: 'SOAP Note – ANC Visit',
    date: '12 Jan 2026',
    icon: 'soap',
    fields: [
      { label: 'Subjective', value: 'Headache denies, nausea improved, no visual disturbance.' },
      { label: 'Objective', value: 'BP 118/76 mmHg, HR 82 bpm. Urine protein negative.' },
      { label: 'Assessment', value: 'G2P1, 18 weeks. Chronic hypertension, controlled.' },
      { label: 'Plan', value: 'Continue amlodipine 5 mg once daily. Continue prenatal vitamins. Routine ANC follow up in 4 weeks. Educate on warning signs.' },
    ],
  },
]

export const DATA_DOMAINS: readonly DataDomain[] = [
  { id: 'demographics', label: 'Demographics', status: 'available', icon: 'age' },
  { id: 'diagnosis', label: 'Diagnosis Codes (ICD-10)', status: 'available', icon: 'codes' },
  { id: 'specialist', label: 'Specialist Visit History', status: 'available', icon: 'specialist' },
  { id: 'visit-dates', label: 'Visit Dates', status: 'available', icon: 'dates' },
  { id: 'medication', label: 'Medication History', status: 'available', icon: 'medication' },
  { id: 'soap', label: 'SOAP Notes', status: 'available', icon: 'notes' },
  { id: 'laboratory', label: 'Laboratory Results', status: 'not-integrated', icon: 'dates' },
  { id: 'imaging', label: 'Imaging Results', status: 'not-integrated', icon: 'codes' },
  { id: 'procedures', label: 'Procedures', status: 'not-available', icon: 'specialist' },
  { id: 'allergies', label: 'Allergies', status: 'not-available', icon: 'medication' },
  { id: 'vitals', label: 'Vitals', status: 'not-available', icon: 'gender' },
  { id: 'social', label: 'Social History', status: 'not-available', icon: 'age' },
]

export type QualityMetricTone = 'coverage' | 'freshness' | 'consistency' | 'identity'

/** Static Data Quality Overview figures copied from the newest Data Quality reference. */
export type QualityReliability = {
  readonly score: number
  readonly scale: number
  readonly label: string
  readonly status: string
  readonly copy: string
}

export type QualityMetric = {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly copy: string
  readonly tone: QualityMetricTone
}

export type QualityFreshness = {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly icon: string
}

export type QualityIssueType = 'Missing Data' | 'Data Conflict'

export type QualityImpact = 'High' | 'Medium'

export type QualityIssue = {
  readonly id: string
  readonly issue: string
  readonly detail: string
  readonly type: QualityIssueType
  readonly impact: QualityImpact
}

export const QUALITY_RELIABILITY: QualityReliability = {
  score: 82,
  scale: 100,
  label: 'Overall Reliability',
  status: 'High Reliability',
  copy: 'Patient data is complete and reliable for most clinical use cases, with some gaps in laboratory, imaging and procedure records.',
}

export const QUALITY_METRICS: readonly QualityMetric[] = [
  { id: 'coverage', label: 'Coverage', value: '78/100', copy: 'Core data types available', tone: 'coverage' },
  { id: 'freshness', label: 'Freshness', value: '85/100', copy: 'Most recent visit within 12 months', tone: 'freshness' },
  { id: 'consistency', label: 'Consistency', value: '80/100', copy: 'Minor conflicts detected', tone: 'consistency' },
  { id: 'identity', label: 'Identity Match', value: '95/100', copy: 'High confidence in patient match', tone: 'identity' },
]

export const QUALITY_FRESHNESS: readonly QualityFreshness[] = [
  { id: 'summary', label: 'Summary generated', value: '15 Oct 2026, 08:42', icon: 'grid' },
  { id: 'visit', label: 'Most recent visit', value: '20 Oct 2026 (5 days ago)', icon: 'list' },
  { id: 'medication', label: 'Most recent medication record', value: '12 Oct 2026 (8 days ago)', icon: 'diamond' },
  { id: 'soap', label: 'Most recent SOAP note', value: '20 Oct 2026 (5 days ago)', icon: 'list' },
  { id: 'lab', label: 'Most recent lab result', value: '15 Aug 2026 (2 months ago)', icon: 'pulse' },
]

export const QUALITY_ISSUES: readonly QualityIssue[] = [
  { id: 'Q1', issue: 'Missing laboratory results', detail: 'No laboratory data integrated in the last 12 months.', type: 'Missing Data', impact: 'High' },
  { id: 'Q2', issue: 'Imaging results not available', detail: 'No imaging data integrated in patient record.', type: 'Missing Data', impact: 'High' },
  { id: 'Q3', issue: 'Conflicting medication frequency', detail: 'Different frequencies noted across visit records.', type: 'Data Conflict', impact: 'Medium' },
  { id: 'Q4', issue: 'Procedure history incomplete', detail: 'No procedure data integrated in patient record.', type: 'Missing Data', impact: 'Medium' },
]

export type ReferenceDetail = {
  readonly identity: PatientIdentity
  readonly overview: Overview
  readonly overviewTab: OverviewTab
  readonly claims: readonly Claim[]
  readonly evidence: readonly EvidenceRecord[]
  readonly domains: readonly DataDomain[]
}

export const REFERENCE_DETAIL: ReferenceDetail = {
  identity: REFERENCE_IDENTITY,
  overview: REFERENCE_OVERVIEW,
  overviewTab: REFERENCE_OVERVIEW_TAB,
  claims: CLAIMS,
  evidence: EVIDENCE_RECORDS,
  domains: DATA_DOMAINS,
}
