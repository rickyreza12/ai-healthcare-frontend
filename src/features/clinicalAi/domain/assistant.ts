export type AssistantMode = 'general' | 'patient'

export type AssistantSource = {
  sourceId: string
  marker: string
  title: string
  kind: string
  dateLabel: string
  publisher: string
  summary: string
}

export type AnswerBlock =
  | { type: 'text'; text: string }
  | { type: 'keyPoints'; heading: string; items: { label: string; value: string }[] }
  | { type: 'soap'; rows: { letter: string; label: string; value: string }[] }
  | { type: 'excerpts'; rows: { dateLabel: string; title: string; value: string; sourceId: string }[] }

export type AssistantExchange = {
  exchangeId: string
  mode: AssistantMode
  prompt: string
  answer: AnswerBlock[]
  citations: AssistantSource[]
}

export type AssistantCatalog = {
  modes: { key: AssistantMode; label: string; description: string }[]
  topics: { title: string; example: string; exchangeId: string | null }[]
  landingSuggestions: { label: string; exchangeId: string | null }[]
  knowledgeGroups: { title: string; detail: string; countLabel: string }[]
  recentShortcuts: { title: string; exchangeId: string | null }[]
  patientContext: { patientId: string } | null
  generalSources: AssistantSource[]
}

export type AssistantAnswer =
  | { outcome: 'answered'; exchange: AssistantExchange }
  | { outcome: 'unsupported'; reason: string }
