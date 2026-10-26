export type AssistantMode = 'general' | 'patient'
export type AssistantView = 'landing' | AssistantMode

/** Refresh always returns here; nothing about the conversation is persisted. */
export const DEFAULT_VIEW: AssistantView = 'landing'

export const ASSISTANT_MODES: readonly { readonly key: AssistantMode; readonly label: string; readonly description: string }[] = [
  { key: 'general', label: 'General Assistant', description: 'Medical knowledge and hospital resources' },
  { key: 'patient', label: 'Patient Assistant', description: "Ask about a specific patient's records" },
]

export type AssistantSource = {
  readonly id: string
  readonly marker: string
  readonly title: string
  readonly kind: string
  readonly date: string
  readonly publisher: string
  readonly summary: string
}

export type AnswerBlock =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'keyPoints'; readonly heading: string; readonly items: readonly { readonly label: string; readonly value: string }[] }
  | { readonly type: 'soap'; readonly rows: readonly { readonly letter: string; readonly label: string; readonly value: string }[] }
  | { readonly type: 'excerpts'; readonly rows: readonly { readonly date: string; readonly title: string; readonly value: string; readonly sourceId: string }[] }

export type ScriptedExchange = {
  readonly id: string
  readonly mode: AssistantMode
  readonly prompt: string
  readonly answer: readonly AnswerBlock[]
  readonly citations: readonly string[]
}

export const GENERAL_SOURCES: readonly AssistantSource[] = [
  { id: 'g-s1', marker: 'S1', title: 'ICD-10-CM Official Guidelines for Coding and Reporting', kind: 'Coding Guideline', date: '1 Jan 2024', publisher: 'Centers for Medicare & Medicaid Services (CMS)', summary: 'Official coding guidelines for ICD-10-CM, including I10 Essential (primary) hypertension.' },
  { id: 'g-s2', marker: 'S2', title: 'Essential Hypertension (Clinical Overview)', kind: 'Clinical Reference', date: '15 Mar 2024', publisher: 'UpToDate', summary: 'Comprehensive overview of essential hypertension including diagnosis, management and differential.' },
  { id: 'g-s3', marker: 'S3', title: '2017 ACC/AHA Guideline for High Blood Pressure in Adults', kind: 'Clinical Guideline', date: '13 Nov 2017', publisher: 'American Heart Association (AHA)', summary: 'Evidence-based recommendations for the diagnosis and management of hypertension in adults.' },
  { id: 'g-s4', marker: 'S4', title: 'SOAP Note Documentation Guide', kind: 'Clinical Education', date: '10 Feb 2023', publisher: 'American Academy of Family Physicians (AAFP)', summary: 'Guide to SOAP documentation in primary care, including examples and best practices.' },
  { id: 'g-s5', marker: 'S5', title: 'Clinical Documentation Best Practices', kind: 'Best Practices', date: '5 Jan 2024', publisher: 'Agency for Healthcare Research and Quality', summary: 'Principles of high-quality clinical documentation, including structure, accuracy and completeness.' },
]

export const PATIENT_SOURCES: readonly AssistantSource[] = [
  { id: 'p-s2', marker: 'S2', title: 'Diagnosis Record (ICD-10)', kind: 'Diagnosis', date: '12 Mar 2024', publisher: 'Dr. Ahmad Rahman', summary: 'I10 – Essential (primary) hypertension. Pre-existing hypertension, diagnosed prior to pregnancy.' },
  { id: 'p-s3', marker: 'S3', title: 'Medication History', kind: 'Medication', date: '10 Jan 2024 – ongoing', publisher: 'Dr. Ahmad Rahman', summary: 'Amlodipine 5 mg tablet – 1 tablet once daily. Monitor blood pressure regularly.' },
  { id: 'p-s1', marker: 'S1', title: 'SOAP Note', kind: 'Clinical Note', date: '20 Oct 2026', publisher: 'Dr. Sinta Dewi', summary: 'Antenatal visit GA 23+4: BP 118/76 mmHg, weight 62 kg, FHR 150 bpm. Continue medication.' },
  { id: 'p-s4', marker: 'S4', title: 'Lab Result', kind: 'Laboratory', date: '15 Aug 2026', publisher: 'BUNDA Laboratory', summary: 'Blood pressure 134/86 mmHg (elevated). Mild headache resolved. Monitor BP.' },
]

/** Dedicated module fixture. Never joined to directory, maternity, pediatric, or inbox records. */
export const ASSISTANT_PATIENT = {
  fixtureId: 'assistant-patient-1',
  name: 'Siti Aisyah',
  patientId: 'BD001245',
  age: '32 years',
  gender: 'Female',
  status: 'Active Patient',
} as const

export const EXCHANGES: readonly ScriptedExchange[] = [
  {
    id: 'general-icd10-i10',
    mode: 'general',
    prompt: 'Can you explain ICD-10 code I10 and when it should be used?',
    citations: ['g-s1', 'g-s2', 'g-s3'],
    answer: [
      { type: 'text', text: 'ICD-10 code I10 is a billable code for Essential (primary) hypertension.' },
      { type: 'text', text: 'It should be used when a patient has a diagnosis of hypertension without a known secondary cause. This includes patients with elevated blood pressure that is not due to another specific condition (e.g., renal disease, endocrine disorders, or medication-induced hypertension).' },
      {
        type: 'keyPoints',
        heading: 'Key points about ICD-10 I10:',
        items: [
          { label: 'Code', value: 'I10' },
          { label: 'Description', value: 'Essential (primary) hypertension' },
          { label: 'Use when', value: 'Patient has hypertension without a secondary cause' },
          { label: 'Excludes', value: 'Hypertension due to other specific conditions' },
          { label: 'Applicable for', value: 'All settings of care (outpatient, inpatient, etc.)' },
        ],
      },
      { type: 'text', text: 'Always document blood pressure readings, relevant history, and any associated conditions to support the diagnosis.' },
    ],
  },
  {
    id: 'general-soap-format',
    mode: 'general',
    prompt: 'What is the SOAP documentation format?',
    citations: ['g-s4', 'g-s5'],
    answer: [
      { type: 'text', text: 'SOAP is a structured format for clinical documentation. It helps organize patient information in a clear and standardized way.' },
      {
        type: 'soap',
        rows: [
          { letter: 'S', label: 'Subjective', value: "Patient's symptoms, history, and subjective findings" },
          { letter: 'O', label: 'Objective', value: 'Objective findings from examination, vital signs, labs' },
          { letter: 'A', label: 'Assessment', value: 'Clinical interpretation, diagnosis, differential diagnosis' },
          { letter: 'P', label: 'Plan', value: 'Treatment plan, medications, education, follow-up' },
        ],
      },
      { type: 'text', text: 'SOAP helps ensure comprehensive, consistent, and high-quality clinical notes.' },
    ],
  },
  {
    id: 'patient-antenatal-summary',
    mode: 'patient',
    prompt: 'Summarize the latest antenatal visit.',
    citations: ['p-s1', 'p-s2', 'p-s3', 'p-s4'],
    answer: [
      { type: 'text', text: 'The latest antenatal visit was on 20 Oct 2026 (GA 23+4 weeks) with Dr. Sinta Dewi. The patient reported occasional nausea and improved well-being. Blood pressure was 118/76 mmHg, weight 62 kg (↑ 2 kg from prior visit), and fetal heart rate 150 bpm with normal fetal movements. Amniotic fluid and fundal height were appropriate for gestational age. She was advised to continue prenatal vitamins, amlodipine 5 mg OD, monitor BP at home, and follow up in 4 weeks.' },
    ],
  },
  {
    id: 'patient-hypertension-flag',
    mode: 'patient',
    prompt: 'Why is hypertension flagged?',
    citations: ['p-s2', 'p-s3', 'p-s1', 'p-s4'],
    answer: [
      { type: 'text', text: 'Hypertension is flagged because the patient has a history of essential hypertension predating pregnancy, and has had elevated blood pressure readings during early pregnancy. This is recorded in the diagnosis list as “Essential hypertension (I10)” and noted as a high-risk condition for antenatal care.' },
      { type: 'text', text: 'Recent BP readings have been within target (e.g., 118/76 mmHg on 20 Oct 2026) with ongoing treatment using amlodipine 5 mg OD. The system flags this to ensure closer monitoring throughout pregnancy.' },
    ],
  },
  {
    id: 'patient-soap-notes',
    mode: 'patient',
    prompt: 'Show supporting SOAP notes.',
    citations: ['p-s1'],
    answer: [
      { type: 'text', text: 'Here are the relevant SOAP note excerpts related to antenatal care and hypertension:' },
      {
        type: 'excerpts',
        rows: [
          { date: '20 Oct 2026', title: 'Antenatal Visit (GA 23+4 weeks)', value: 'BP 118/76 mmHg. Weight 62 kg (↑2 kg), FHR 150 bpm. Patient reports occasional nausea. Follow up in 4 weeks.', sourceId: 'p-s1' },
          { date: '15 Aug 2026', title: 'Antenatal Visit (GA 19+0 weeks)', value: 'BP 134/86 mmHg. Mild headache resolved. Continue medication. Advise on diet and activity.', sourceId: 'p-s1' },
        ],
      },
    ],
  },
]

/** The patient source rail in the reference is scoped to this answer. */
export const PATIENT_RAIL_EXCHANGE_ID = 'patient-hypertension-flag'

export const TOPICS: readonly { readonly title: string; readonly example: string; readonly exchangeId: string | null }[] = [
  { title: 'Medical Terminology', example: 'Explain ICD-10 code I10', exchangeId: 'general-icd10-i10' },
  { title: 'Clinical Guidelines', example: 'Summarize hypertension guidelines', exchangeId: null },
  { title: 'Medications', example: 'What are common side effects of amlodipine?', exchangeId: null },
  { title: 'Hospital Procedures', example: 'Explain the SOAP documentation format', exchangeId: 'general-soap-format' },
]

export const LANDING_SUGGESTIONS: readonly { readonly label: string; readonly exchangeId: string | null }[] = [
  { label: 'Explain the difference between EMR and EHR', exchangeId: null },
  { label: 'Latest clinical guidelines for preeclampsia', exchangeId: null },
  { label: 'Summarize the SOAP documentation format', exchangeId: 'general-soap-format' },
  { label: 'What are the contraindications of amlodipine?', exchangeId: null },
  { label: 'What is the ICD-10 code for hypertension?', exchangeId: 'general-icd10-i10' },
  { label: 'Typical ANC visit schedule for normal pregnancy', exchangeId: null },
  { label: 'Common medications for gestational diabetes', exchangeId: null },
  { label: 'Explain how to document a delivery in SOAP format', exchangeId: null },
]

export const KNOWLEDGE_GROUPS: readonly { readonly title: string; readonly detail: string; readonly count: string }[] = [
  { title: 'Clinical Guidelines', detail: 'National & International', count: '12+' },
  { title: 'Drug Information', detail: 'Approved medication references', count: '8+' },
  { title: 'Medical Terminology', detail: 'ICD-10, SNOMED CT, LOINC', count: '5+' },
  { title: 'Hospital Protocols', detail: 'BUNDA internal documentation', count: '3+' },
  { title: 'Medical Education', detail: 'Textbooks and references', count: '10+' },
]

export const RECENT_CONVERSATIONS: readonly { readonly title: string; readonly tag: string; readonly time: string; readonly exchangeId: string | null }[] = [
  { title: 'Explain ICD-10 code I10', tag: 'Medical Terminology', time: '10:24 AM', exchangeId: 'general-icd10-i10' },
  { title: 'SOAP documentation format', tag: 'Clinical Documentation', time: 'Yesterday', exchangeId: 'general-soap-format' },
  { title: 'Preeclampsia guidelines', tag: 'Clinical Guidelines', time: '16 Oct 2026', exchangeId: null },
  { title: 'Amlodipine side effects', tag: 'Medication Information', time: '15 Oct 2026', exchangeId: null },
  { title: 'Difference between EMR and EHR', tag: 'Hospital Systems', time: '14 Oct 2026', exchangeId: null },
]

export const ASSISTANT_PAGE = {
  heading: 'Healthcare Assistant',
  supporting: 'Your assistant demo for medical knowledge, clinical guidelines, and patient information. Answers are supplied, source-grounded reference content.',
  disclaimer: 'Synthetic demonstration data. Not medical, clinical, or coding advice.',
} as const
