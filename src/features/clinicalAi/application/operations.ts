import type { AssistantMode } from '../domain/assistant.ts'
import type { ClinicalAiRepository } from './ports.ts'

export const getPatientSummary = (repo: ClinicalAiRepository, id: string, signal?: AbortSignal) => repo.getSummary(id, signal)
export const ingestPatient = (repo: ClinicalAiRepository, id: string, signal?: AbortSignal) => repo.ingest(id, signal)
export const refreshPatientSummary = (repo: ClinicalAiRepository, id: string, signal?: AbortSignal) => repo.refresh(id, signal)
export const reviewPatientSummary = (repo: ClinicalAiRepository, id: string, version: string, reviewed: boolean, signal?: AbortSignal) => repo.review(id, version, reviewed, signal)
export const getAssistantCatalog = (repo: ClinicalAiRepository, signal?: AbortSignal) => repo.getCatalog(signal)
export const getAssistantExchange = (repo: ClinicalAiRepository, exchangeId: string, signal?: AbortSignal) => repo.getExchange(exchangeId, signal)
export const answerAssistant = (repo: ClinicalAiRepository, mode: AssistantMode, prompt: string, patientId?: string, signal?: AbortSignal) => repo.answer(mode, prompt, patientId, signal)
