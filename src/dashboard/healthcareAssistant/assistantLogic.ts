import { EXCHANGES, GENERAL_SOURCES, PATIENT_SOURCES, type AssistantMode, type AssistantSource, type ScriptedExchange } from './assistantData.ts'

export function normalizePrompt(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[?.!\s]+$/, '')
}

/** Exact supplied prompts only; anything else returns null so no answer is fabricated. */
export function matchPrompt(input: string, mode: AssistantMode): ScriptedExchange | null {
  const needle = normalizePrompt(input)
  if (!needle) return null
  return EXCHANGES.find((exchange) => exchange.mode === mode && normalizePrompt(exchange.prompt) === needle) ?? null
}

export function exchangesFor(mode: AssistantMode): readonly ScriptedExchange[] {
  return EXCHANGES.filter((exchange) => exchange.mode === mode)
}

export function sourcesFor(mode: AssistantMode): readonly AssistantSource[] {
  return mode === 'general' ? GENERAL_SOURCES : PATIENT_SOURCES
}

export function findSource(id: string, mode: AssistantMode): AssistantSource | null {
  return sourcesFor(mode).find((source) => source.id === id) ?? null
}

export function findExchange(id: string): ScriptedExchange | null {
  return EXCHANGES.find((exchange) => exchange.id === id) ?? null
}
