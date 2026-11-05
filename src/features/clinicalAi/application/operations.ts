import type { AssistantMode } from '../domain/assistant.ts'
import type { ClinicalAiRepository } from './ports.ts'

export const getPatientSummary = (repo: ClinicalAiRepository, id: string, signal?: AbortSignal) =>
  repo.getSummary(id, signal)

export const generatePatientSummary = (
  repo: ClinicalAiRepository,
  id: string,
  expectedVersion: number,
  key: string,
  signal?: AbortSignal,
) => repo.generate(id, expectedVersion, key, signal)

export const reviewPatientSummary = (
  repo: ClinicalAiRepository,
  id: string,
  body: { summaryId: string; expectedVersion: number; reviewed: boolean },
  key: string,
  signal?: AbortSignal,
) => repo.review(id, body, key, signal)

export const refreshPatientDataQuality = (
  repo: ClinicalAiRepository,
  id: string,
  key: string,
  signal?: AbortSignal,
) => repo.refreshDataQuality(id, key, signal)

export const getAssistantCatalog = (repo: ClinicalAiRepository, signal?: AbortSignal) => repo.getCatalog(signal)

export const getAssistantExchange = (repo: ClinicalAiRepository, exchangeId: string, signal?: AbortSignal) =>
  repo.getExchange(exchangeId, signal)

export const answerAssistant = (
  repo: ClinicalAiRepository,
  mode: AssistantMode,
  prompt: string,
  patientId: string | null,
  key: string,
  signal?: AbortSignal,
) => repo.answer(mode, prompt, patientId, key, signal)
