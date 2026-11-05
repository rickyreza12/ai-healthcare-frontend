import { request } from '../../../api.ts'
import type { AssistantMode } from '../domain/assistant.ts'
import type { SummaryReview } from '../domain/patientSummary.ts'
import type { ClinicalAiRepository } from '../application/ports.ts'
import { validateAnswer, validateCatalog, validateExchange } from './assistantMapper.ts'
import { validateDataQuality, validateReview, validateSummary } from './patientSummaryMapper.ts'

const patientPath = (id: string) => `/api/patients/${encodeURIComponent(id)}/ai-summary`

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}

export const clinicalAiHttpRepository: ClinicalAiRepository = {
  async getSummary(patientId, signal) {
    return validateSummary(await request<unknown>(patientPath(patientId), { signal }))
  },
  async generate(patientId, expectedVersion, idempotencyKey, signal) {
    return validateSummary(await request<unknown>(`${patientPath(patientId)}/generate`, {
      method: 'POST',
      json: { expectedVersion },
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    }))
  },
  async review(patientId, body, idempotencyKey, signal) {
    return validateReview(await request<unknown>(`${patientPath(patientId)}/review`, {
      method: 'PUT',
      json: body,
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    }))
  },
  async refreshDataQuality(patientId, idempotencyKey, signal) {
    return validateDataQuality(await request<unknown>(`/api/patients/${encodeURIComponent(patientId)}/data-quality/refresh`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    }))
  },
  async getCatalog(signal) {
    return validateCatalog(await request<unknown>('/api/assistant/catalog', { signal }))
  },
  async getExchange(exchangeId, signal) {
    return validateExchange(await request<unknown>(`/api/assistant/exchanges/${encodeURIComponent(exchangeId)}`, { signal }))
  },
  async answer(mode: AssistantMode, prompt: string, patientContextId: string | null, idempotencyKey: string, signal?: AbortSignal) {
    return validateAnswer(await request<unknown>('/api/assistant/answers', {
      method: 'POST',
      json: { mode, prompt, patientContextId },
      headers: { 'Idempotency-Key': idempotencyKey },
      signal,
    }))
  },
}

export type { SummaryReview }
