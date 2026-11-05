import type { PatientDetail as ApiPatientDetail } from '../../api.ts'
import type { AiSummary } from '../../features/clinicalAi/domain/patientSummary.ts'
import type {
  AvailabilityDomain,
  Claim,
  ClaimIconKey,
  ClinicalAlert,
  ContextCard,
  ContextIconKey,
  DataDomain,
  DataDomainStatus,
  DomainIconKey,
  EvidenceRecord,
  HistoryEntry,
  Overview,
  OverviewTab,
  PatientIdentity,
  QualityFreshness,
  QualityImpact,
  QualityIssue,
  QualityIssueType,
  QualityMetric,
  QualityMetricTone,
  QualityReliability,
  SoapNote,
  SoapTone,
  SourceGroup,
  SourceIconKey,
  TimelineEntry,
  VitalTone,
} from './patientDetailData.ts'

const VITAL_TONES: readonly VitalTone[] = ['heart', 'pulse', 'temperature', 'weight']
const CLAIM_ICONS: readonly ClaimIconKey[] = ['heart', 'monitor', 'diamond', 'notes', 'check']
const METRIC_TONES: readonly QualityMetricTone[] = ['coverage', 'freshness', 'consistency', 'identity']
const SOAP_TONES: readonly SoapTone[] = ['subjective', 'objective', 'assessment', 'plan']

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const longDateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
})

function parse(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | null | undefined, fallback = 'Not available'): string {
  const date = parse(value)
  return date ? dateFormat.format(date) : fallback
}

export function formatDateTime(value: string | null | undefined, fallback = 'Not available'): string {
  const date = parse(value)
  return date ? dateTimeFormat.format(date) : fallback
}

export function formatLongDate(value: string | null | undefined, fallback = 'Not available'): string {
  const date = parse(value)
  return date ? longDateFormat.format(date) : fallback
}

const STATUS_LABELS: Record<string, string> = {
  inpatient: 'Inpatient',
  outpatient: 'Outpatient',
  emergency: 'Emergency',
  follow_up: 'Follow-up',
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export function buildIdentity(patient: ApiPatientDetail): PatientIdentity {
  return {
    patientNumber: patient.patientNumber,
    status: statusLabel(patient.status),
    age: patient.age,
    gender: patient.gender,
    religion: patient.religion ?? 'Not recorded',
    dateOfBirth: formatDate(patient.dateOfBirth),
    dateOfBirthLong: formatLongDate(patient.dateOfBirth),
    phone: patient.phone ?? 'Not provided',
    address: patient.address ?? 'Not provided',
    emergencyContact: patient.emergencyContact
      ? {
          name: patient.emergencyContact.name,
          relation: patient.emergencyContact.relationship,
          phone: patient.emergencyContact.phone,
        }
      : null,
  }
}

export function buildOverview(patient: ApiPatientDetail): Overview {
  const overview = patient.overview
  const latest = overview.vitals.reduce<string | null>(
    (current, vital) => (current === null || vital.measuredAt > current ? vital.measuredAt : current),
    null,
  )
  const history: HistoryEntry[] = overview.history.map((entry) => ({
    date: formatDate(entry.occurredAt),
    title: entry.title,
    note: entry.note,
    clinician: entry.clinician.displayName,
    role: entry.clinician.specialty,
  }))

  return {
    vitalsChecked: latest ? `Latest Check-up • ${formatDateTime(latest)}` : 'No vital signs recorded',
    vitals: overview.vitals.map((vital, index) => ({
      label: vital.label,
      value: vital.value,
      unit: vital.unit,
      status: vital.status,
      tone: VITAL_TONES[index % VITAL_TONES.length],
    })),
    condition: {
      title: overview.condition.title,
      description: overview.condition.description,
      lastVisitReason: overview.condition.lastVisitReason,
      lastVisitDate: formatDate(overview.condition.lastVisitAt),
      careContext: overview.condition.careContext,
      careContextNote: overview.condition.careContextNote,
    },
    allergies: overview.allergies.map((allergy) => ({
      name: allergy.name,
      kind: allergy.kind,
      severity: allergy.severity,
    })),
    medications: overview.medications,
    history,
  }
}

const CONTEXT_ICONS: readonly ContextIconKey[] = ['age', 'gender', 'codes', 'specialist', 'dates', 'medication']

const KIND_ICONS: Record<string, SourceIconKey> = {
  emr: 'emr',
  diagnosis: 'diagnosis',
  medication: 'medication',
  soap: 'soap',
  laboratory: 'laboratory',
  procedure: 'procedure',
}

function groupIcon(kind: string): SourceIconKey {
  const key = kind.toLowerCase()
  if (key in KIND_ICONS) return KIND_ICONS[key]
  if (key.includes('diagnos')) return 'diagnosis'
  if (key.includes('medic')) return 'medication'
  if (key.includes('soap') || key.includes('note')) return 'soap'
  if (key.includes('lab')) return 'laboratory'
  if (key.includes('procedure')) return 'procedure'
  return 'emr'
}

const DOMAIN_ICONS: readonly DomainIconKey[] = ['age', 'codes', 'specialist', 'dates', 'medication', 'notes']

const DOMAIN_STATUS: Record<string, DataDomainStatus> = {
  available: 'available',
  partial: 'partial',
  not_integrated: 'not-integrated',
  not_available: 'not-available',
}

const ISSUE_TYPES: Record<string, QualityIssueType> = {
  missing_data: 'Missing Data',
  data_conflict: 'Data Conflict',
  stale_data: 'Stale Data',
  identity_mismatch: 'Identity Mismatch',
}

const IMPACTS: Record<string, QualityImpact> = { high: 'High', medium: 'Medium', low: 'Low' }

export type SummaryView = {
  tab: OverviewTab
  claims: readonly Claim[]
  evidence: readonly EvidenceRecord[]
  domains: readonly DataDomain[]
  reliability: QualityReliability
  metrics: readonly QualityMetric[]
  freshness: readonly QualityFreshness[]
  issues: readonly QualityIssue[]
}

export function buildSummaryView(summary: AiSummary): SummaryView {
  const markers = new Map(summary.sources.map((source) => [source.sourceId, source.marker]))
  const markerFor = (sourceId: string) => markers.get(sourceId) ?? sourceId

  const context: ContextCard[] = summary.contextCards.map((card, index) => ({
    label: card.label,
    value: card.value,
    detail: card.detail,
    icon: CONTEXT_ICONS[index % CONTEXT_ICONS.length],
  }))

  const soap: SoapNote[] = summary.soapNotes.map((note, index) => ({
    initial: note.initial,
    label: note.label,
    body: note.body,
    tone: SOAP_TONES[index % SOAP_TONES.length],
  }))

  const timeline: TimelineEntry[] = summary.timeline.map((entry) => ({
    date: formatDate(entry.occurredAt),
    title: entry.title,
    clinician: entry.clinician,
    note: entry.note,
    source: markerFor(entry.sourceId),
  }))

  const alerts: ClinicalAlert[] = summary.alerts.map((alert) => ({
    title: alert.title,
    description: alert.description,
    level: alert.level,
  }))

  const sourceGroups: SourceGroup[] = summary.sourceGroups.map((group) => ({
    label: group.label,
    count: `${group.count} ${group.count === 1 ? 'record' : 'records'}`,
    markers: group.sourceIds.map(markerFor),
    icon: groupIcon(group.kind),
  }))

  const availability: AvailabilityDomain[] = summary.availability.map((entry) => ({
    label: entry.status === 'partial' ? `${entry.label} (partial)` : entry.label,
    available: entry.status === 'available' || entry.status === 'partial',
  }))

  const claims: Claim[] = summary.claims.map((claim, index) => ({
    id: claim.claimId,
    number: claim.number,
    title: claim.title,
    description: claim.description,
    sources: claim.sourceIds.map(markerFor),
    icon: CLAIM_ICONS[index % CLAIM_ICONS.length],
  }))

  const evidence: EvidenceRecord[] = summary.sources.map((source) => ({
    source: source.marker,
    title: source.title,
    date: formatDate(source.recordedAt),
    icon: KIND_ICONS[source.kind] ?? 'emr',
    fields: source.fields,
  }))

  const quality = summary.dataQuality
  const domains: DataDomain[] = quality.domains.map((domain, index) => ({
    id: domain.domainId,
    label: domain.label,
    status: DOMAIN_STATUS[domain.status] ?? 'not-available',
    icon: DOMAIN_ICONS[index % DOMAIN_ICONS.length],
  }))

  const metrics: QualityMetric[] = quality.metrics.map((metric, index) => ({
    id: metric.metricId,
    label: metric.label,
    value: metric.value,
    copy: metric.copy,
    tone: METRIC_TONES[index % METRIC_TONES.length],
  }))

  const freshness: QualityFreshness[] = quality.freshness.map((item) => ({
    id: item.itemId,
    label: item.label,
    value: formatDateTime(item.at),
    icon: 'grid',
  }))

  const issues: QualityIssue[] = quality.issues.map((issue) => ({
    id: issue.issueId,
    issue: issue.issue,
    detail: issue.detail,
    type: ISSUE_TYPES[issue.type] ?? 'Missing Data',
    impact: IMPACTS[issue.impact] ?? 'Medium',
  }))

  const tab: OverviewTab = {
    summary: {
      heading: summary.heading,
      status: summary.status === 'ready' ? 'Ready' : summary.status,
      generated: `Generated ${formatDateTime(summary.generatedAt)}`,
      sourceNote: summary.sourceNote,
      body: summary.body,
      sourceCount: summary.sourceCount,
    },
    context,
    soap,
    timeline,
    alerts,
    sourceGroups,
    quickActions: ['view-sources', 'export-summary', 'mark-reviewed', 'open-assistant'],
    availability,
  }

  return {
    tab,
    claims,
    evidence,
    domains,
    reliability: { ...quality.reliability },
    metrics,
    freshness,
    issues,
  }
}
