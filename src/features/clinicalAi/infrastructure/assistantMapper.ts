import type { AssistantAnswer, AssistantCatalog, AssistantExchange, AssistantSource } from '../domain/assistant.ts'
import { array, record, string } from './guards.ts'

function validateSource(value: unknown): AssistantSource {
  const item = record(value)
  for (const key of ['sourceId', 'marker', 'title', 'kind', 'dateLabel', 'publisher', 'summary']) string(item[key])
  return item as AssistantSource
}

export function validateExchange(value: unknown): AssistantExchange {
  const item = record(value)
  string(item.exchangeId)
  string(item.prompt)
  if (item.mode !== 'general' && item.mode !== 'patient') throw new Error('Invalid assistant mode.')
  const citations = array(item.citations).map(validateSource)
  const citationIds = new Set(citations.map(source => source.sourceId))
  for (const block of array(item.answer)) {
    const content = record(block)
    switch (content.type) {
      case 'text': string(content.text); break
      case 'keyPoints': string(content.heading); array(content.items); break
      case 'soap': array(content.rows); break
      case 'excerpts':
        for (const row of array(content.rows)) {
          if (!citationIds.has(string(record(row).sourceId))) throw new Error('Assistant citation does not resolve.')
        }
        break
      default: throw new Error('Unsupported answer block type.')
    }
  }
  return item as AssistantExchange
}

export function validateCatalog(value: unknown): AssistantCatalog {
  const item = record(value)
  for (const key of ['modes', 'topics', 'landingSuggestions', 'knowledgeGroups', 'recentShortcuts']) array(item[key])
  array(item.generalSources).forEach(validateSource)
  if (item.patientContext !== null) record(item.patientContext)
  return item as AssistantCatalog
}

export function validateAnswer(value: unknown): AssistantAnswer {
  const item = record(value)
  if (item.outcome === 'unsupported') return { outcome: 'unsupported', reason: string(item.reason) }
  if (item.outcome === 'answered') return { outcome: 'answered', exchange: validateExchange(item.exchange) }
  throw new Error('Unexpected assistant outcome.')
}
