import type { AiSummary, AvailabilityStatus, DataQuality, SourceRecord } from '../domain/patientSummary.ts'
import { array, boolean, nullableString, number, oneOf, record, string } from './guards.ts'

const AVAILABILITY: readonly AvailabilityStatus[] = ['available', 'partial', 'not_integrated', 'not_available']
const SOURCE_KINDS = ['emr', 'diagnosis', 'medication', 'soap', 'laboratory', 'procedure'] as const

function validateSource(value: unknown): SourceRecord {
  const row = record(value)
  string(row.sourceId)
  string(row.marker)
  oneOf(row.kind, SOURCE_KINDS)
  string(row.title)
  string(row.recordedAt)
  array(row.fields).forEach(field => {
    const entry = record(field)
    string(entry.label)
    string(entry.value)
  })
  return row as SourceRecord
}

export function validateDataQuality(value: unknown): DataQuality {
  const quality = record(value)
  string(quality.assessmentId)
  string(quality.computedAt)
  const reliability = record(quality.reliability)
  number(reliability.score)
  number(reliability.scale)
  string(reliability.label)
  string(reliability.status)
  string(reliability.copy)
  array(quality.metrics).forEach(metric => {
    const row = record(metric)
    string(row.metricId)
    string(row.label)
    string(row.value)
    string(row.copy)
  })
  array(quality.freshness).forEach(item => {
    const row = record(item)
    string(row.itemId)
    string(row.label)
    if (nullableString(row.at) === null && row.at !== null) throw new Error('Unexpected backend date.')
  })
  array(quality.domains).forEach(domain => {
    const row = record(domain)
    string(row.domainId)
    string(row.label)
    oneOf(row.status, AVAILABILITY)
  })
  array(quality.issues).forEach(issue => {
    const row = record(issue)
    string(row.issueId)
    string(row.issue)
    string(row.detail)
    string(row.type)
    oneOf(row.impact, ['high', 'medium', 'low'] as const)
  })
  return quality as DataQuality
}

export function validateSummary(value: unknown): AiSummary {
  const item = record(value)
  for (const field of ['summaryId', 'patientContextId', 'heading', 'body', 'generatedAt', 'model', 'sourceNote']) {
    string(item[field])
  }
  oneOf(item.status, ['ready', 'generating', 'failed'] as const)
  if (typeof item.dataVersion !== 'number' || !Number.isInteger(item.dataVersion) || item.dataVersion < 1) {
    throw new Error('Invalid summary version.')
  }

  const sources = array(item.sources).map(validateSource)
  const ids = new Set(sources.map(source => source.sourceId))
  if (ids.size !== sources.length) throw new Error('Summary source count is invalid.')
  if (number(item.sourceCount) !== sources.length) throw new Error('Summary source count is invalid.')

  array(item.claims).forEach(claim => {
    const row = record(claim)
    string(row.claimId)
    number(row.number)
    string(row.description)
    oneOf(row.supportStatus, ['supported', 'unsupported'] as const)
    if (!array(row.sourceIds).every(id => typeof id === 'string' && ids.has(id))) {
      throw new Error('Summary includes an unresolved citation.')
    }
  })
  array(item.timeline).forEach(entry => {
    const row = record(entry)
    string(row.occurredAt)
    string(row.title)
    string(row.clinician)
    string(row.note)
    if (!ids.has(string(row.sourceId))) throw new Error('Timeline has an unresolved source.')
  })
  array(item.sourceGroups).forEach(group => {
    const row = record(group)
    string(row.label)
    string(row.kind)
    number(row.count)
    if (!array(row.sourceIds).every(id => typeof id === 'string' && ids.has(id))) {
      throw new Error('Summary includes an unresolved citation.')
    }
  })
  array(item.availability).forEach(entry => oneOf(record(entry).status, AVAILABILITY))
  array(item.contextCards).forEach(entry => {
    const row = record(entry)
    string(row.label)
    string(row.value)
    string(row.detail)
  })
  array(item.soapNotes).forEach(entry => {
    const row = record(entry)
    string(row.initial)
    string(row.label)
    string(row.body)
  })
  array(item.alerts).forEach(entry => {
    const row = record(entry)
    string(row.title)
    string(row.description)
    oneOf(row.level, ['high', 'medium', 'info'] as const)
  })

  const review = record(item.review)
  boolean(review.reviewed)
  nullableString(review.reviewedAt)
  nullableString(review.reviewedBy)
  validateDataQuality(item.dataQuality)
  return item as AiSummary
}

export function validateReview(value: unknown) {
  const review = record(value)
  boolean(review.reviewed)
  nullableString(review.reviewedAt)
  nullableString(review.reviewedBy)
  return review as import('../domain/patientSummary.ts').SummaryReview
}
