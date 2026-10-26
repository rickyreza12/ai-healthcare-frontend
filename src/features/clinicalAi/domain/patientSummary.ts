export type SourceRecord = {
  sourceId: string
  kind: 'emr' | 'diagnosis' | 'medication' | 'soap'
  title: string
  recordedOn: string
  fields: { label: string; value: string }[]
}

export type SummaryClaim = {
  claimId: string
  number: number
  title: string
  description: string
  sourceIds: string[]
}

export type SummaryReview = { reviewed: boolean; reviewedAt: string | null; reviewedBy: string | null }

export type AiSummary = {
  summaryId: string
  dataVersion: number
  patientContextId: string
  status: 'ready' | 'generating' | 'failed'
  heading: string
  body: string
  generatedAt: string
  sourceNote: string
  sourceCount: number
  contextCards: { label: string; value: string; detail: string }[]
  soapNotes: { initial: string; label: string; body: string }[]
  timeline: { occurredOn: string; title: string; clinician: string; note: string; sourceId: string }[]
  alerts: { title: string; description: string; level: 'high' | 'medium' | 'info' }[]
  sourceGroups: { label: string; kind: string; count: number; sourceIds: string[] }[]
  availability: { label: string; available: boolean }[]
  claims: SummaryClaim[]
  sources: SourceRecord[]
  review: SummaryReview
  dataQuality: {
    reliability: { score: number; scale: number; label: string; status: string; copy: string }
    metrics: { metricId: string; label: string; value: string; copy: string }[]
    freshness: { itemId: string; label: string; at: string }[]
    domains: { domainId: string; label: string; status: string }[]
    issues: { issueId: string; issue: string; detail: string; type: string; impact: string }[]
  }
}

export function resolveSource(sources: SourceRecord[], sourceId: string): SourceRecord | undefined {
  return sources.find(source => source.sourceId === sourceId)
}
