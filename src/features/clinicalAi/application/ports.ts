import type { AssistantMode, AssistantAnswer, AssistantCatalog, AssistantExchange } from '../domain/assistant.ts'
import type { AiSummary, DataQuality, SummaryReview } from '../domain/patientSummary.ts'

export interface ClinicalAiRepository {
  getSummary(patientId: string, signal?: AbortSignal): Promise<AiSummary>
  generate(patientId: string, expectedVersion: number, idempotencyKey: string, signal?: AbortSignal): Promise<AiSummary>
  review(
    patientId: string,
    body: { summaryId: string; expectedVersion: number; reviewed: boolean },
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<SummaryReview>
  refreshDataQuality(patientId: string, idempotencyKey: string, signal?: AbortSignal): Promise<DataQuality>
  getCatalog(signal?: AbortSignal): Promise<AssistantCatalog>
  getExchange(exchangeId: string, signal?: AbortSignal): Promise<AssistantExchange>
  answer(
    mode: AssistantMode,
    prompt: string,
    patientContextId: string | null,
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<AssistantAnswer>
}
