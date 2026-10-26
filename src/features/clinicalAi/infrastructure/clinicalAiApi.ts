import { request } from '../../../api.ts'
import type { AssistantMode } from '../domain/assistant.ts'
import type { SummaryReview } from '../domain/patientSummary.ts'
import type { ClinicalAiRepository } from '../application/ports.ts'
import { validateAnswer, validateCatalog, validateExchange } from './assistantMapper.ts'
import { validateSummary } from './patientSummaryMapper.ts'

const patientPath = (id: string) => `/api/patients/${encodeURIComponent(id)}/ai-summary`

export const clinicalAiHttpRepository: ClinicalAiRepository = {
  async getSummary(patientId, signal) {
    return validateSummary(await request<unknown>(patientPath(patientId), { signal }))
  },
  async ingest(patientId, signal) {
    return request(`/api/clinical-ai/ingestion/${encodeURIComponent(patientId)}`, { method: 'POST', signal })
  },
  async refresh(patientId, signal) {
    return validateSummary(await request<unknown>(`${patientPath(patientId)}/refresh`, { method: 'POST', signal }))
  },
  async review(patientId, summaryId, reviewed, signal) {
    return request<SummaryReview>(`${patientPath(patientId)}/review`, {
      method: 'PUT', json: { reviewed, summaryId }, signal,
    })
  },
  async getCatalog(signal) {
    return validateCatalog(await request<unknown>('/api/assistant/catalog', { signal }))
  },
  async getExchange(exchangeId, signal) {
    return validateExchange(await request<unknown>(`/api/assistant/exchanges/${encodeURIComponent(exchangeId)}`, { signal }))
  },
  async answer(mode: AssistantMode, prompt: string, patientContextId?: string, signal?: AbortSignal) {
    return validateAnswer(await request<unknown>('/api/assistant/answers', {
      method: 'POST', json: { mode, prompt, ...(patientContextId ? { patientContextId } : {}) }, signal,
    }))
  },
  async sourcePatients(signal) {
    const payload = await request<{ patientIds: string[] }>('/api/clinical-ai/source-patients', { signal })
    if (!Array.isArray(payload.patientIds) || !payload.patientIds.every(id => typeof id === 'string')) {
      throw new Error('Invalid source patient list.')
    }
    return payload.patientIds
  },
}
