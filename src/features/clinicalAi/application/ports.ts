import type { AssistantMode, AssistantAnswer, AssistantCatalog, AssistantExchange } from '../domain/assistant.ts'
import type { AiSummary, SummaryReview } from '../domain/patientSummary.ts'

export interface ClinicalAiRepository {
  getSummary(patientId: string, signal?: AbortSignal): Promise<AiSummary>
  ingest(patientId: string, signal?: AbortSignal): Promise<{ status: string; dataVersion: number }>
  refresh(patientId: string, signal?: AbortSignal): Promise<AiSummary>
  review(patientId: string, summaryId: string, reviewed: boolean, signal?: AbortSignal): Promise<SummaryReview>
  getCatalog(signal?: AbortSignal): Promise<AssistantCatalog>
  getExchange(exchangeId: string, signal?: AbortSignal): Promise<AssistantExchange>
  answer(mode: AssistantMode, prompt: string, patientContextId?: string, signal?: AbortSignal): Promise<AssistantAnswer>
  sourcePatients(signal?: AbortSignal): Promise<string[]>
}
