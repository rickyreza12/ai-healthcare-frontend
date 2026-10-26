import { SCHEDULE_APPOINTMENTS } from '../appointments/appointmentScheduleData.ts'
import { LAB_ORDERS, LAB_RESULTS, QC_RUNS, SPECIMENS } from '../laboratory/laboratoryData.ts'
import { MATERNITY_MEDICAL_RECORDS } from '../maternity/maternityData.ts'
import { MEDICAL_RECORDS } from '../medicalRecords/medicalRecordData.ts'
import { INBOX_ITEMS } from '../notifications/clinicalInboxData.ts'
import { DIRECTORY_PATIENTS } from '../patients/patientDirectoryData.ts'
import { VACCINATIONS } from '../pediatric/pediatricData.ts'
import { MEDICATIONS } from '../pharmacy/pharmacyData.ts'

/**
 * A fixture row shown by Data Input. Fields stay `unknown` because resources come from
 * different workspaces and the registry, not a shared model, describes each one.
 */
export type DataInputRecord = { readonly [field: string]: unknown }

export type OperationStatus =
  | 'implemented'
  | 'proposed'
  | 'blocked'
  | 'out-of-scope'
  | 'local-demo-only'

export type ResourceOperation = {
  readonly status: OperationStatus
  readonly available: boolean
  /** Source path and contract state that justify the status. */
  readonly evidence: string
}

export type FieldKind = 'text' | 'number' | 'boolean'

export type ResourceField = {
  readonly key: string
  readonly label: string
  readonly kind: FieldKind
}

export type SortField = {
  readonly key: string
  readonly label: string
}

export type Relationship = {
  readonly field: string
  readonly target: string
  readonly targetField: string
}

export type ResourceDefinition = {
  readonly key: string
  readonly label: string
  readonly singular: string
  readonly workspace: string
  readonly source: string
  readonly apiSpec: string | null
  readonly identifierField: string
  readonly displayField: string
  readonly classification: 'clinical' | 'operational'
  readonly fields: readonly ResourceField[]
  readonly listFields: readonly string[]
  readonly searchFields: readonly string[]
  readonly sortFields: readonly SortField[]
  readonly relationships: readonly Relationship[]
  readonly readOnlyReason: string
  readonly records: readonly DataInputRecord[]
  /** True when the workspace reads the feature API instead of the local fixture. */
  readonly serverBacked?: boolean
  readonly operations: {
    readonly read: ResourceOperation
    readonly create: ResourceOperation
    readonly update: ResourceOperation
    readonly delete: ResourceOperation
  }
}

export type UnregisteredFixture = {
  readonly resource: string
  readonly source: string
  readonly decision: 'blocked' | 'out-of-scope'
  readonly reason: string
}

export const DATA_INPUT_COPY = {
  heading: 'Data Input',
  supporting:
    'Enter appointments and inspect patients through feature-owned APIs. Other demonstration records stay read-only.',
  localOnly:
    'Patients and appointments come from the backend. Every other resource on this page is local demonstration data and is never sent to a server.',
  countNote: 'Counts for local resources are the supplied fixture rows, not production totals.',
  blockedHeading: 'Why most data entry is still unavailable',
  blockedLead:
    'A resource may only accept changes when an implemented backend route, authorization, audit, and tests exist.',
  blockedPoints: [
    'Patients are server-backed reads. Creation, editing, merging, archiving, and deletion are out of scope.',
    'Appointments support create, reschedule, and cancel through the appointments feature API.',
    'Medical records, maternity, pediatric, pharmacy, laboratory, and inbox remain local fixtures with no approved writes.',
    'Analytics and Healthcare Assistant expose projections and scripted reads, not record collections.',
    'The backend has no role model yet, so every authenticated user may read patients and write appointments.',
  ],
  nextStep:
    'Approve roles, audit retention, and the next clinical resource before enabling more data entry.',
} as const

const specPath = (folder: string) => `workspaces/result/api-specifications/${folder}/openapi.yaml`

function readFixture(source: string, contract: string): ResourceOperation {
  return { status: 'local-demo-only', available: true, evidence: `Renders ${source}. ${contract}` }
}

function blocked(evidence: string): ResourceOperation {
  return { status: 'blocked', available: false, evidence }
}

function outOfScope(evidence: string): ResourceOperation {
  return { status: 'out-of-scope', available: false, evidence }
}

const PATIENT_SPEC = specPath('03-patients')
const APPOINTMENT_SPEC = specPath('04-appointments')
const RECORD_SPEC = specPath('05-medical-records')
const MATERNITY_SPEC = specPath('06-maternity')
const PEDIATRIC_SPEC = specPath('07-pediatric')
const PHARMACY_SPEC = specPath('08-pharmacy')
const INBOX_SPEC = specPath('09-clinical-inbox')
const LAB_SPEC = specPath('13-laboratory')

export const RESOURCE_REGISTRY: readonly ResourceDefinition[] = [
  {
    key: 'patients',
    label: 'Patients',
    singular: 'patient',
    workspace: 'Patients',
    source: 'src/dashboard/patients/patientDirectoryData.ts',
    apiSpec: PATIENT_SPEC,
    identifierField: 'id',
    displayField: 'name',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Patient ID', kind: 'text' },
      { key: 'name', label: 'Name', kind: 'text' },
      { key: 'age', label: 'Age', kind: 'number' },
      { key: 'gender', label: 'Gender', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'unit', label: 'Unit', kind: 'text' },
      { key: 'room', label: 'Room', kind: 'text' },
      { key: 'lastVisit', label: 'Last visit', kind: 'text' },
      { key: 'doctor', label: 'Doctor', kind: 'text' },
      { key: 'specialty', label: 'Specialty', kind: 'text' },
    ],
    listFields: ['name', 'id', 'status', 'unit', 'lastVisit'],
    searchFields: ['id', 'name', 'doctor', 'unit', 'status'],
    sortFields: [
      { key: 'name', label: 'Name (A to Z)' },
      { key: 'age', label: 'Age (lowest first)' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [],
    readOnlyReason:
      'Patients are read-only here. Creation, editing, merging, archiving, and deletion are out of scope.',
    serverBacked: true,
    records: DIRECTORY_PATIENTS,
    operations: {
      read: {
        status: 'implemented',
        available: true,
        evidence: 'GET /api/patients and GET /api/patients/{patientId} are implemented in repo/backend/app/routers/patients.py with tests.',
      },
      create: outOfScope('Patient creation is out of scope in 03-patients coverage.'),
      update: outOfScope('Patient editing is out of scope in 03-patients coverage.'),
      delete: outOfScope('The patient specification defines no delete operation.'),
    },
  },
  {
    key: 'appointments',
    label: 'Appointments',
    singular: 'appointment',
    workspace: 'Appointments',
    source: 'src/dashboard/appointments/appointmentScheduleData.ts',
    apiSpec: APPOINTMENT_SPEC,
    identifierField: 'id',
    displayField: 'patient',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Schedule ID', kind: 'text' },
      { key: 'day', label: 'Day', kind: 'text' },
      { key: 'start', label: 'Start', kind: 'text' },
      { key: 'end', label: 'End', kind: 'text' },
      { key: 'patient', label: 'Patient', kind: 'text' },
      { key: 'visit', label: 'Visit', kind: 'text' },
      { key: 'clinic', label: 'Clinic', kind: 'text' },
      { key: 'room', label: 'Room', kind: 'text' },
      { key: 'doctor', label: 'Doctor', kind: 'text' },
    ],
    listFields: ['patient', 'visit', 'start', 'clinic', 'room'],
    searchFields: ['id', 'patient', 'visit', 'clinic', 'doctor'],
    sortFields: [
      { key: 'patient', label: 'Patient (A to Z)' },
      { key: 'start', label: 'Start time' },
      { key: 'clinic', label: 'Clinic' },
    ],
    relationships: [],
    readOnlyReason:
      'Appointments support create, reschedule, and cancel. Cancellation keeps the record. Deletion is not available.',
    serverBacked: true,
    records: SCHEDULE_APPOINTMENTS,
    operations: {
      read: {
        status: 'implemented',
        available: true,
        evidence: 'GET /api/appointments and GET /api/appointments/{appointmentId} are implemented in repo/backend/app/routers/appointments.py with tests.',
      },
      create: {
        status: 'implemented',
        available: true,
        evidence: 'POST /api/appointments requires an Idempotency-Key and validates patient, clinician, clinic, room, time, and overlaps.',
      },
      update: {
        status: 'implemented',
        available: true,
        evidence: 'PATCH /api/appointments/{appointmentId} reschedules with a required record version and writes an audit event.',
      },
      delete: outOfScope(
        'Cancellation is POST /api/appointments/{appointmentId}/cancel, a status transition that keeps the record. No DELETE route exists.',
      ),
    },
  },
  {
    key: 'medical-records',
    label: 'Medical Records',
    singular: 'medical record',
    workspace: 'Medical Records',
    source: 'src/dashboard/medicalRecords/medicalRecordData.ts',
    apiSpec: RECORD_SPEC,
    identifierField: 'id',
    displayField: 'title',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Record ID', kind: 'text' },
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'type', label: 'Type', kind: 'text' },
      { key: 'clinician', label: 'Clinician', kind: 'text' },
      { key: 'date', label: 'Date', kind: 'text' },
      { key: 'time', label: 'Time', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'examination', label: 'Examination', kind: 'text' },
      { key: 'reason', label: 'Reason', kind: 'text' },
    ],
    listFields: ['title', 'type', 'clinician', 'date', 'status'],
    searchFields: ['id', 'title', 'type', 'clinician'],
    sortFields: [
      { key: 'title', label: 'Title (A to Z)' },
      { key: 'clinician', label: 'Clinician' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [],
    readOnlyReason:
      'Medical records are read-only here. The specification proposes reads only; clinical documentation writes are not approved.',
    records: MEDICAL_RECORDS,
    operations: {
      read: readFixture('MEDICAL_RECORDS', 'GET /api/medical-records/{recordId} is proposed, not implemented.'),
      create: blocked('05-medical-records defines no create operation.'),
      update: blocked('05-medical-records defines no update operation and no amendment rules.'),
      delete: blocked('05-medical-records defines no delete operation and no retention rule.'),
    },
  },
  {
    key: 'maternity-records',
    label: 'Maternity Medical Records',
    singular: 'maternity record',
    workspace: 'Maternity / OBGYN',
    source: 'src/dashboard/maternity/maternityData.ts',
    apiSpec: MATERNITY_SPEC,
    identifierField: 'id',
    displayField: 'title',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Record ID', kind: 'text' },
      { key: 'date', label: 'Date', kind: 'text' },
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'type', label: 'Type', kind: 'text' },
      { key: 'clinician', label: 'Clinician', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'summary', label: 'Summary', kind: 'text' },
    ],
    listFields: ['title', 'type', 'date', 'clinician', 'status'],
    searchFields: ['id', 'title', 'type', 'clinician'],
    sortFields: [
      { key: 'title', label: 'Title (A to Z)' },
      { key: 'clinician', label: 'Clinician' },
      { key: 'type', label: 'Type' },
    ],
    relationships: [],
    readOnlyReason:
      'Maternity records are read-only here. The maternity specification proposes reads only.',
    records: MATERNITY_MEDICAL_RECORDS,
    operations: {
      read: readFixture(
        'MATERNITY_MEDICAL_RECORDS',
        'GET /api/maternity/patients/{patientId}/medical-records is proposed, not implemented.',
      ),
      create: blocked('06-maternity defines no create operation.'),
      update: blocked('06-maternity defines no update operation.'),
      delete: blocked('06-maternity defines no delete operation.'),
    },
  },
  {
    key: 'pediatric-vaccinations',
    label: 'Pediatric Vaccinations',
    singular: 'vaccination',
    workspace: 'Pediatric Care',
    source: 'src/dashboard/pediatric/pediatricData.ts',
    apiSpec: PEDIATRIC_SPEC,
    identifierField: 'id',
    displayField: 'vaccine',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Vaccination ID', kind: 'text' },
      { key: 'date', label: 'Date', kind: 'text' },
      { key: 'vaccine', label: 'Vaccine', kind: 'text' },
      { key: 'dose', label: 'Dose', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'nextDue', label: 'Next due', kind: 'text' },
    ],
    listFields: ['vaccine', 'dose', 'date', 'status', 'nextDue'],
    searchFields: ['id', 'vaccine', 'dose', 'status'],
    sortFields: [
      { key: 'vaccine', label: 'Vaccine (A to Z)' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [],
    readOnlyReason:
      'Vaccination rows are read-only here. The pediatric specification proposes one overview read and no administration writes.',
    records: VACCINATIONS,
    operations: {
      read: readFixture(
        'VACCINATIONS',
        'GET /api/pediatric/patients/{patientId}/overview is proposed, not implemented.',
      ),
      create: blocked('07-pediatric defines no vaccination create operation.'),
      update: blocked('07-pediatric defines no vaccination update operation.'),
      delete: blocked('07-pediatric defines no vaccination delete operation.'),
    },
  },
  {
    key: 'medications',
    label: 'Medications',
    singular: 'medication',
    workspace: 'Pharmacy',
    source: 'src/dashboard/pharmacy/pharmacyData.ts',
    apiSpec: PHARMACY_SPEC,
    identifierField: 'id',
    displayField: 'name',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Medication ID', kind: 'text' },
      { key: 'name', label: 'Name', kind: 'text' },
      { key: 'genericName', label: 'Generic name', kind: 'text' },
      { key: 'category', label: 'Category', kind: 'text' },
      { key: 'dosage', label: 'Strength', kind: 'text' },
      { key: 'form', label: 'Form', kind: 'text' },
      { key: 'stock', label: 'Stock', kind: 'number' },
      { key: 'price', label: 'Price', kind: 'text' },
      { key: 'prescription', label: 'Prescription', kind: 'text' },
      { key: 'status', label: 'Stock status', kind: 'text' },
    ],
    listFields: ['name', 'category', 'stock', 'status'],
    searchFields: ['id', 'name', 'genericName', 'category', 'status'],
    sortFields: [
      { key: 'name', label: 'Name (A to Z)' },
      { key: 'stock', label: 'Stock (lowest first)' },
      { key: 'category', label: 'Category' },
    ],
    relationships: [],
    readOnlyReason:
      'The medication catalogue is read-only here. The pharmacy specification states that no write operation is proposed.',
    records: MEDICATIONS,
    operations: {
      read: readFixture('MEDICATIONS', 'GET /api/pharmacy/medications is proposed, not implemented.'),
      create: blocked('08-pharmacy states that Add Medication is unavailable and defines no create operation.'),
      update: blocked('08-pharmacy defines no stock or catalogue update operation.'),
      delete: blocked('08-pharmacy defines no delete or discontinuation operation.'),
    },
  },
  {
    key: 'lab-orders',
    label: 'Laboratory Orders',
    singular: 'laboratory order',
    workspace: 'Laboratory',
    source: 'src/dashboard/laboratory/laboratoryData.ts',
    apiSpec: LAB_SPEC,
    identifierField: 'number',
    displayField: 'testSummary',
    classification: 'clinical',
    fields: [
      { key: 'number', label: 'Order number', kind: 'text' },
      { key: 'patientName', label: 'Patient', kind: 'text' },
      { key: 'patientId', label: 'Patient ID', kind: 'text' },
      { key: 'testSummary', label: 'Tests', kind: 'text' },
      { key: 'specimenType', label: 'Specimen type', kind: 'text' },
      { key: 'category', label: 'Category', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'time', label: 'Time', kind: 'text' },
      { key: 'dateGroup', label: 'Date group', kind: 'text' },
    ],
    listFields: ['number', 'patientName', 'testSummary', 'status'],
    searchFields: ['number', 'patientName', 'testSummary', 'specimenType', 'status'],
    sortFields: [
      { key: 'number', label: 'Order number' },
      { key: 'patientName', label: 'Patient (A to Z)' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [],
    readOnlyReason:
      'Laboratory orders are read-only here. 13-laboratory proposes reads only; order creation and lifecycle commands are unavailable.',
    records: LAB_ORDERS,
    operations: {
      read: readFixture('LAB_ORDERS', 'GET /api/laboratory/orders is proposed, not implemented.'),
      create: blocked('13-laboratory defines no order create operation.'),
      update: blocked('13-laboratory defines no order update or collection transition.'),
      delete: blocked('13-laboratory defines no order cancellation or delete operation.'),
    },
  },
  {
    key: 'lab-results',
    label: 'Laboratory Results',
    singular: 'laboratory result',
    workspace: 'Laboratory',
    source: 'src/dashboard/laboratory/laboratoryData.ts',
    apiSpec: LAB_SPEC,
    identifierField: 'id',
    displayField: 'test',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Result ID', kind: 'text' },
      { key: 'orderNumber', label: 'Order number', kind: 'text' },
      { key: 'patientName', label: 'Patient', kind: 'text' },
      { key: 'test', label: 'Test', kind: 'text' },
      { key: 'time', label: 'Time', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'critical', label: 'Critical', kind: 'boolean' },
      { key: 'summary', label: 'Summary', kind: 'text' },
    ],
    listFields: ['patientName', 'test', 'orderNumber', 'status'],
    searchFields: ['id', 'orderNumber', 'patientName', 'test', 'status'],
    sortFields: [
      { key: 'patientName', label: 'Patient (A to Z)' },
      { key: 'test', label: 'Test (A to Z)' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [{ field: 'orderNumber', target: 'lab-orders', targetField: 'number' }],
    readOnlyReason:
      'Laboratory results are read-only here. 13-laboratory proposes reads only; result entry, correction, and approval are unavailable.',
    records: LAB_RESULTS,
    operations: {
      read: readFixture('LAB_RESULTS', 'GET /api/laboratory/results is proposed, not implemented.'),
      create: blocked('13-laboratory defines no result create operation.'),
      update: blocked('13-laboratory defines no result entry, correction, or approval operation.'),
      delete: blocked('13-laboratory defines no result delete operation.'),
    },
  },
  {
    key: 'lab-specimens',
    label: 'Laboratory Specimens',
    singular: 'laboratory specimen',
    workspace: 'Laboratory',
    source: 'src/dashboard/laboratory/laboratoryData.ts',
    apiSpec: LAB_SPEC,
    identifierField: 'id',
    displayField: 'patientName',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Specimen ID', kind: 'text' },
      { key: 'orderNumber', label: 'Order number', kind: 'text' },
      { key: 'patientName', label: 'Patient', kind: 'text' },
      { key: 'testGroup', label: 'Test group', kind: 'text' },
      { key: 'type', label: 'Specimen type', kind: 'text' },
      { key: 'collectionTime', label: 'Collected', kind: 'text' },
      { key: 'collector', label: 'Collector', kind: 'text' },
      { key: 'location', label: 'Location', kind: 'text' },
      { key: 'temperature', label: 'Storage', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
      { key: 'handlingNote', label: 'Handling note', kind: 'text' },
    ],
    listFields: ['patientName', 'type', 'orderNumber', 'status'],
    searchFields: ['id', 'orderNumber', 'patientName', 'testGroup', 'type', 'status'],
    sortFields: [
      { key: 'patientName', label: 'Patient (A to Z)' },
      { key: 'type', label: 'Specimen type (A to Z)' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [{ field: 'orderNumber', target: 'lab-orders', targetField: 'number' }],
    readOnlyReason:
      'Laboratory specimens are read-only here. 13-laboratory proposes reads only; collection, movement, rejection, and recollection commands are unavailable.',
    records: SPECIMENS,
    operations: {
      read: readFixture('SPECIMENS', 'GET /api/laboratory/specimens is proposed, not implemented.'),
      create: blocked('13-laboratory defines no specimen create or collection operation.'),
      update: blocked('13-laboratory defines no specimen movement or status transition.'),
      delete: blocked('13-laboratory defines no specimen delete operation.'),
    },
  },
  {
    key: 'lab-qc-runs',
    label: 'Laboratory QC Runs',
    singular: 'quality-control run',
    workspace: 'Laboratory',
    source: 'src/dashboard/laboratory/laboratoryData.ts',
    apiSpec: LAB_SPEC,
    identifierField: 'id',
    displayField: 'test',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Run ID', kind: 'text' },
      { key: 'date', label: 'Date', kind: 'text' },
      { key: 'time', label: 'Time', kind: 'text' },
      { key: 'test', label: 'Test', kind: 'text' },
      { key: 'analyzer', label: 'Analyzer', kind: 'text' },
      { key: 'observed', label: 'Observed', kind: 'text' },
      { key: 'range', label: 'Range', kind: 'text' },
      { key: 'rule', label: 'Rule', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'text' },
    ],
    listFields: ['test', 'analyzer', 'observed', 'status'],
    searchFields: ['id', 'test', 'analyzer', 'rule', 'status'],
    sortFields: [
      { key: 'test', label: 'Test (A to Z)' },
      { key: 'analyzer', label: 'Analyzer (A to Z)' },
      { key: 'status', label: 'Status' },
    ],
    relationships: [],
    readOnlyReason:
      'Quality-control runs are read-only here. 13-laboratory proposes reads only; QC entry, rule evaluation, and calibration commands are unavailable.',
    records: QC_RUNS,
    operations: {
      read: readFixture('QC_RUNS', 'GET /api/laboratory/quality-control/runs is proposed, not implemented.'),
      create: blocked('13-laboratory defines no QC run create operation.'),
      update: blocked('13-laboratory defines no QC correction or calibration operation.'),
      delete: blocked('13-laboratory defines no QC run delete operation.'),
    },
  },
  {
    key: 'inbox-messages',
    label: 'Inbox Messages',
    singular: 'inbox message',
    workspace: 'Notifications & Inbox',
    source: 'src/dashboard/notifications/clinicalInboxData.ts',
    apiSpec: INBOX_SPEC,
    identifierField: 'id',
    displayField: 'subject',
    classification: 'clinical',
    fields: [
      { key: 'id', label: 'Message ID', kind: 'text' },
      { key: 'sourceName', label: 'Source', kind: 'text' },
      { key: 'referenceLabel', label: 'Reference', kind: 'text' },
      { key: 'subject', label: 'Subject', kind: 'text' },
      { key: 'kind', label: 'Kind', kind: 'text' },
      { key: 'timeLabel', label: 'Time', kind: 'text' },
      { key: 'unread', label: 'Unread', kind: 'boolean' },
      { key: 'preview', label: 'Preview', kind: 'text' },
    ],
    listFields: ['subject', 'sourceName', 'kind', 'timeLabel'],
    searchFields: ['id', 'sourceName', 'subject', 'kind'],
    sortFields: [
      { key: 'subject', label: 'Subject (A to Z)' },
      { key: 'sourceName', label: 'Source (A to Z)' },
      { key: 'kind', label: 'Kind' },
    ],
    relationships: [],
    readOnlyReason:
      'Inbox messages are read-only here. 09-clinical-inbox proposes reads only; mark-read, resolve, archive, and reply are unavailable commands.',
    records: INBOX_ITEMS,
    operations: {
      read: readFixture('INBOX_ITEMS', 'GET /api/inbox/messages is proposed, not implemented.'),
      create: blocked('09-clinical-inbox defines no message create operation.'),
      update: blocked('09-clinical-inbox defines no mark-read, resolve, archive, or reply operation.'),
      delete: blocked('09-clinical-inbox defines no message delete operation.'),
    },
  },
]

/**
 * Fixture collections that are deliberately not registered. Keeping them visible makes the
 * audit honest about what was reviewed rather than silently skipped.
 */
export const UNREGISTERED_FIXTURES: readonly UnregisteredFixture[] = [
  {
    resource: 'Dashboard summary and global search',
    source: 'src/dashboard/dashboardData.ts',
    decision: 'out-of-scope',
    reason: 'Dashboard overview and search are proposed reads, not input records.',
  },
  {
    resource: 'Dashboard recent patients and appointments',
    source: 'src/dashboard/dashboardData.ts',
    decision: 'out-of-scope',
    reason: 'Summary rows duplicate the Patients and Appointments workspaces.',
  },
  {
    resource: 'Medical record category counts',
    source: 'src/dashboard/medicalRecords/medicalRecordData.ts',
    decision: 'out-of-scope',
    reason: 'Supplied aggregate counts, not individual records.',
  },
  {
    resource: 'Patient detail, AI summary, evidence, and data quality',
    source: 'src/dashboard/patients/patientDetailData.ts',
    decision: 'blocked',
    reason: 'Patient reads are proposed; the AI-summary review is not patient CRUD.',
  },
  {
    resource: 'Patient laboratory reports',
    source: 'src/dashboard/patients/patientLabResultData.ts',
    decision: 'blocked',
    reason: 'Patient lab reads are proposed and no mutation contract exists.',
  },
  {
    resource: 'Appointment detail',
    source: 'src/dashboard/appointments/appointmentScheduleData.ts',
    decision: 'out-of-scope',
    reason: 'A read-only view over a registered appointment row.',
  },
  {
    resource: 'Maternity checklist, visits, education, and documents',
    source: 'src/dashboard/maternity/maternityData.ts',
    decision: 'blocked',
    reason: 'The maternity specification proposes reads only.',
  },
  {
    resource: 'Pediatric milestones and growth series',
    source: 'src/dashboard/pediatric/pediatricData.ts',
    decision: 'blocked',
    reason: 'The pediatric specification proposes one overview read.',
  },
  {
    resource: 'Pharmacy tabs and categories',
    source: 'src/dashboard/pharmacy/pharmacyData.ts',
    decision: 'out-of-scope',
    reason: 'Derived filters over the registered medication list.',
  },
  {
    resource: 'Laboratory overview, quality-control summary, alerts, and equipment',
    source: 'src/dashboard/laboratory/laboratoryData.ts',
    decision: 'out-of-scope',
    reason: '13-laboratory labels these as supplied projections, not record collections.',
  },
  {
    resource: 'Analytics metrics, trends, and departments',
    source: 'src/dashboard/analytics/analyticsData.ts',
    decision: 'out-of-scope',
    reason: '10-analytics labels these as derived projections, not editable records.',
  },
  {
    resource: 'Assistant exchanges and sources',
    source: 'src/dashboard/healthcareAssistant/assistantData.ts',
    decision: 'out-of-scope',
    reason: '12-healthcare-assistant defines scripted reads and a command, not record CRUD.',
  },
  {
    resource: 'Profile and account settings',
    source: 'src/dashboard/profile/profileData.ts',
    decision: 'out-of-scope',
    reason:
      '11-profile-settings defines a self-scoped singleton. Its verified local edit stays in the Profile workspace so this boundary does not duplicate the storage key.',
  },
  {
    resource: 'Menu configuration',
    source: 'src/api.ts',
    decision: 'out-of-scope',
    reason: 'Implemented platform read; navigation is not input data.',
  },
]

export function findResource(key: string | undefined): ResourceDefinition | undefined {
  return RESOURCE_REGISTRY.find((resource) => resource.key === key)
}

export function findField(resource: ResourceDefinition, key: string): ResourceField | undefined {
  return resource.fields.find((field) => field.key === key)
}

export function isMutable(resource: ResourceDefinition): boolean {
  return (
    resource.operations.create.available ||
    resource.operations.update.available ||
    resource.operations.delete.available
  )
}
