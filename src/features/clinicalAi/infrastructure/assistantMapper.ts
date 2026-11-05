import type { AssistantAnswer, AssistantCatalog, AssistantExchange, AssistantMode, AssistantSource } from '../domain/assistant.ts'
import { array, oneOf, record, string } from './guards.ts'

const MODES: readonly AssistantMode[] = ['general', 'patient']

function optionalId(value: unknown): string | null {
  return value === null || value === undefined ? null : string(value)
}

function validateSource(value: unknown): AssistantSource {
  const item = record(value)
  for (const key of ['sourceId', 'marker', 'title', 'kind', 'dateLabel', 'publisher', 'summary']) string(item[key])
  return item as AssistantSource
}

export function validateExchange(value: unknown): AssistantExchange {
  const item = record(value)
  string(item.exchangeId)
  string(item.prompt)
  string(item.createdAt)
  oneOf(item.mode, MODES)
  const citations = array(item.citations).map(validateSource)
  const citationIds = new Set(citations.map(source => source.sourceId))
  for (const block of array(item.answer)) {
    const content = record(block)
    switch (content.type) {
      case 'text': string(content.text); break
      case 'keyPoints':
        string(content.heading)
        array(content.items).forEach(entry => {
          const row = record(entry)
          string(row.label)
          string(row.value)
        })
        break
      case 'soap':
        array(content.rows).forEach(entry => {
          const row = record(entry)
          string(row.letter)
          string(row.label)
          string(row.value)
        })
        break
      case 'excerpts':
        for (const row of array(content.rows)) {
          const entry = record(row)
          string(entry.dateLabel)
          string(entry.title)
          string(entry.value)
          if (!citationIds.has(string(entry.sourceId))) throw new Error('Assistant citation does not resolve.')
        }
        break
      default: throw new Error('Unsupported answer block type.')
    }
  }
  return item as AssistantExchange
}

export function validateCatalog(value: unknown): AssistantCatalog {
  const item = record(value)
  array(item.modes).forEach(mode => {
    const entry = record(mode)
    oneOf(entry.key, MODES)
    string(entry.label)
    string(entry.description)
  })
  array(item.topics).forEach(topic => {
    const entry = record(topic)
    string(entry.title)
    string(entry.example)
    optionalId(entry.exchangeId)
  })
  array(item.landingSuggestions).forEach(suggestion => {
    const entry = record(suggestion)
    string(entry.label)
    optionalId(entry.exchangeId)
  })
  array(item.knowledgeGroups).forEach(group => {
    const entry = record(group)
    string(entry.title)
    string(entry.detail)
    string(entry.countLabel)
  })
  array(item.recentShortcuts).forEach(shortcut => {
    const entry = record(shortcut)
    string(entry.title)
    optionalId(entry.exchangeId)
  })
  array(item.generalSources).forEach(validateSource)
  if (item.patientContext !== null) string(record(item.patientContext).patientId)
  return item as AssistantCatalog
}

export function validateAnswer(value: unknown): AssistantAnswer {
  const item = record(value)
  if (item.outcome === 'unsupported') return { outcome: 'unsupported', reason: string(item.reason) }
  if (item.outcome === 'answered') return { outcome: 'answered', exchange: validateExchange(item.exchange) }
  throw new Error('Unexpected assistant outcome.')
}
