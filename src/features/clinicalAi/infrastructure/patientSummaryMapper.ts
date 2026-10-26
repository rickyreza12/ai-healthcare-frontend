import type { AiSummary } from '../domain/patientSummary.ts'
import { array, record, string } from './guards.ts'

export function validateSummary(value: unknown): AiSummary {
  const item = record(value)
  for (const field of ['summaryId', 'patientContextId', 'heading', 'body', 'status', 'generatedAt', 'sourceNote']) string(item[field])
  if (typeof item.dataVersion !== 'number' || !Number.isInteger(item.dataVersion) || item.dataVersion < 1) throw new Error('Invalid summary version.')
  const sources = array(item.sources).map(source => {
    const row = record(source)
    string(row.sourceId)
    string(row.title)
    string(row.recordedOn)
    array(row.fields).forEach(field => { const recordField = record(field); string(recordField.label); string(recordField.value) })
    return row
  })
  const ids = new Set(sources.map(source => source.sourceId))
  if (typeof item.sourceCount !== 'number' || item.sourceCount !== sources.length || ids.size !== sources.length) {
    throw new Error('Summary source count is invalid.')
  }
  for (const claim of array(item.claims)) {
    const entry = record(claim)
    string(entry.description)
    if (!array(entry.sourceIds).length || !array(entry.sourceIds).every(id => typeof id === 'string' && ids.has(id))) {
      throw new Error('Summary includes an unresolved citation.')
    }
  }
  for (const entry of array(item.timeline)) {
    const row = record(entry)
    if (!ids.has(string(row.sourceId))) throw new Error('Timeline has an unresolved source.')
  }
  for (const key of ['contextCards', 'soapNotes', 'alerts', 'sourceGroups', 'availability']) array(item[key])
  const review = record(item.review)
  if (typeof review.reviewed !== 'boolean') throw new Error('Invalid review state.')
  const quality = record(item.dataQuality)
  record(quality.reliability)
  for (const key of ['metrics', 'freshness', 'domains', 'issues']) array(quality[key])
  return item as AiSummary
}
