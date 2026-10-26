import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import {
  ASSISTANT_MODES,
  ASSISTANT_PATIENT,
  DEFAULT_VIEW,
  EXCHANGES,
  GENERAL_SOURCES,
  LANDING_SUGGESTIONS,
  PATIENT_SOURCES,
  RECENT_CONVERSATIONS,
  TOPICS,
} from './dashboard/healthcareAssistant/assistantData.ts'
import { findExchange, findSource, matchPrompt } from './dashboard/healthcareAssistant/assistantLogic.ts'

const unique = (values: readonly string[]) => new Set(values).size === values.length

// Unique modes, prompt IDs, source IDs.
assert.ok(unique(ASSISTANT_MODES.map((mode) => mode.key)))
assert.ok(unique(EXCHANGES.map((exchange) => exchange.id)))
assert.ok(unique([...GENERAL_SOURCES, ...PATIENT_SOURCES].map((source) => source.id)))
assert.ok(unique(EXCHANGES.map((exchange) => exchange.prompt)))
assert.equal(DEFAULT_VIEW, 'landing')

// Exact supplied prompts match, with whitespace, case, and trailing punctuation normalized.
assert.equal(matchPrompt('Can you explain ICD-10 code I10 and when it should be used?', 'general')?.id, 'general-icd10-i10')
assert.equal(matchPrompt('  what is the SOAP   documentation format ', 'general')?.id, 'general-soap-format')
assert.equal(matchPrompt('Why is hypertension flagged', 'patient')?.id, 'patient-hypertension-flag')
// Arbitrary or near prompts are rejected.
assert.equal(matchPrompt('', 'general'), null)
assert.equal(matchPrompt('What is diabetes?', 'general'), null)
assert.equal(matchPrompt('Explain ICD-10 code I10 please', 'general'), null)
// Modes stay isolated.
assert.equal(matchPrompt('Why is hypertension flagged?', 'general'), null)
assert.equal(matchPrompt('What is the SOAP documentation format?', 'patient'), null)

// Every citation resolves within its own mode.
for (const exchange of EXCHANGES) {
  for (const id of exchange.citations) assert.ok(findSource(id, exchange.mode), `${exchange.id} cites ${id}`)
  for (const block of exchange.answer) {
    if (block.type === 'excerpts') for (const row of block.rows) assert.ok(findSource(row.sourceId, exchange.mode))
  }
}
assert.ok(GENERAL_SOURCES.every((source) => findSource(source.id, 'patient') === null))

// Shortcuts point only to supplied General exchanges.
for (const item of [...TOPICS, ...LANDING_SUGGESTIONS, ...RECENT_CONVERSATIONS]) {
  if (item.exchangeId) assert.equal(findExchange(item.exchangeId)?.mode, 'general')
}

// Patient fixture is dedicated and not joined to same-name records in other families.
assert.equal(ASSISTANT_PATIENT.patientId, 'BD001245')
const assistantDir = new URL('./dashboard/healthcareAssistant/', import.meta.url)
for (const file of readdirSync(assistantDir)) {
  const text = readFileSync(new URL(file, assistantDir), 'utf8')
  assert.ok(!/from '\.\.\/(patients|maternity|pediatric|notifications|medicalRecords)\//.test(text), `${file} imports no other patient family`)
  assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|https?:\/\/|api[_-]?key|claude-|gpt-|localStorage|console\./i.test(text), `${file} has no network, model, secret, storage, or logging`)
}

// Lookups never mutate fixtures.
const snapshot = JSON.stringify([EXCHANGES, GENERAL_SOURCES, PATIENT_SOURCES, ASSISTANT_PATIENT])
matchPrompt('Show supporting SOAP notes.', 'patient')
findSource('p-s1', 'patient')
assert.equal(JSON.stringify([EXCHANGES, GENERAL_SOURCES, PATIENT_SOURCES, ASSISTANT_PATIENT]), snapshot)

console.log('healthcare assistant checks passed')
