import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { resolveSource } from './features/clinicalAi/domain/patientSummary.ts'
import { validateAnswer, validateCatalog, validateExchange } from './features/clinicalAi/infrastructure/assistantMapper.ts'
import { validateSummary } from './features/clinicalAi/infrastructure/patientSummaryMapper.ts'

const source = {
  sourceId: 'SYN-BUNDA-V0002-01-SRC', kind: 'emr', title: 'CAS clinical source',
  recordedOn: '2024-07-16', fields: [{ label: 'Diagnosis code', value: 'Z34.9' }],
}

const validSummary = {
  summaryId: 'SYN-BUNDA-P0002:1:1', dataVersion: 1, patientContextId: 'SYN-BUNDA-P0002',
  status: 'ready', heading: 'Clinical history summary', body: 'One source encounter.',
  generatedAt: '2026-10-23T00:00:00Z', sourceNote: 'Approved synthetic records',
  sourceCount: 1, sources: [source], contextCards: [], soapNotes: [], alerts: [],
  timeline: [{ occurredOn: '2024-07-16', title: 'Visit', clinician: 'Not supplied',
    note: 'Z34.9 recorded', sourceId: source.sourceId }],
  sourceGroups: [{ label: 'Clinical records', kind: 'emr', count: 1, sourceIds: [source.sourceId] }],
  availability: [],
  claims: [{ claimId: 'C1', number: 1, title: 'Recorded diagnosis',
    description: 'Z34.9', sourceIds: [source.sourceId] }],
  review: { reviewed: false, reviewedAt: null, reviewedBy: null },
  dataQuality: { reliability: { score: 0, scale: 100, label: 'Unassessed', status: 'Unassessed', copy: '' },
    metrics: [], freshness: [], domains: [], issues: [] },
}

const summary = validateSummary(validSummary)
assert.equal(summary.patientContextId, 'SYN-BUNDA-P0002')
assert.equal(resolveSource(summary.sources, source.sourceId)?.recordedOn, '2024-07-16')
assert.equal(resolveSource(summary.sources, 'another-patient-source'), undefined)
assert.throws(() => validateSummary({ ...validSummary, sourceCount: 2 }), /source count/)
assert.throws(() => validateSummary({ ...validSummary, claims: [{ ...validSummary.claims[0], sourceIds: ['foreign'] }] }), /unresolved citation/)
assert.throws(() => validateSummary({ ...validSummary, timeline: [{ ...validSummary.timeline[0], sourceId: 'foreign' }] }), /unresolved source/)
assert.throws(() => validateSummary({ ...validSummary, dataVersion: '1' }), /version/)

const citation = {
  sourceId: source.sourceId, marker: 'S1', title: 'CAS record', kind: 'Clinical record',
  dateLabel: '2024-07-16', publisher: 'CAS synthetic dataset', summary: 'Z34.9',
}
const exchange = {
  exchangeId: 'patient:SYN-BUNDA-P0002:1', mode: 'patient', prompt: 'What diagnoses are recorded?',
  answer: [{ type: 'excerpts', rows: [{ dateLabel: '2024-07-16', title: 'Visit',
    value: 'Z34.9', sourceId: citation.sourceId }] }], citations: [citation],
}
assert.equal(validateExchange(exchange).mode, 'patient')
assert.equal(validateAnswer({ outcome: 'answered', exchange }).outcome, 'answered')
assert.equal(validateAnswer({ outcome: 'unsupported', reason: 'promptNotSupplied' }).outcome, 'unsupported')
assert.throws(() => validateAnswer({ outcome: 'answered', exchange: {
  ...exchange, answer: [{ type: 'excerpts', rows: [{ dateLabel: 'today', title: 'Other',
    value: 'foreign data', sourceId: 'foreign' }] }],
} }), /citation/)
assert.throws(() => validateExchange({ ...exchange, answer: [{ type: 'newUnsupportedBlock' }] }), /block/)
assert.throws(() => validateAnswer({ outcome: 'invented' }), /outcome/)
const catalog = validateCatalog({
  modes: [{ key: 'general', label: 'General Assistant', description: 'Education' }],
  topics: [], landingSuggestions: [], knowledgeGroups: [], recentShortcuts: [],
  patientContext: null, generalSources: [citation],
})
assert.equal(catalog.patientContext, null)

const featureDir = new URL('./features/clinicalAi/', import.meta.url)
const forbidden: Record<string, string[]> = {
  domain: ["from 'react", "from 'gsap", "api.ts'", '../application/', '../infrastructure/', '../presentation/'],
  application: ["from 'react", "from 'gsap", "api.ts'", '../infrastructure/', '../presentation/'],
}
for (const [layer, tokens] of Object.entries(forbidden)) {
  for (const file of readdirSync(new URL(`${layer}/`, featureDir))) {
    if (!file.endsWith('.ts')) continue
    const text = readFileSync(new URL(`${layer}/${file}`, featureDir), 'utf8')
    const leaked = tokens.filter(token => text.includes(token))
    assert.deepEqual(leaked, [], `${layer}/${file} crosses an inward boundary: ${leaked.join(', ')}`)
  }
}

console.log('clinical AI domain and DTO checks passed')
