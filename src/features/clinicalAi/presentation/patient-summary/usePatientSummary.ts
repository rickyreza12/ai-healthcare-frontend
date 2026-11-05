import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../../../api.ts'
import type { AiSummary, DataQuality } from '../../domain/patientSummary.ts'
import { clinicalAiHttpRepository as repository, newIdempotencyKey } from '../../infrastructure/clinicalAiApi.ts'
import {
  generatePatientSummary,
  getPatientSummary,
  refreshPatientDataQuality,
  reviewPatientSummary,
} from '../../application/operations.ts'

type ReadState = 'loading' | 'ready' | 'missing' | 'error'
type ActionState = 'idle' | 'generating' | 'reviewing' | 'refreshing'

export function describeError(reason: unknown, fallback: string): string {
  if (reason instanceof ApiError) {
    switch (reason.status) {
      case 401: return 'Your session expired. Sign in again to continue.'
      case 403: return 'You do not have permission to view this clinical content.'
      case 404: return 'This patient or summary was not found.'
      case 409: return 'The summary changed on the server. Reload it before trying again.'
      case 422: return reason.message
      case 429: return 'Too many requests. Wait a moment and try again.'
      case 502:
      case 503: return 'The clinical service is temporarily unavailable. Try again shortly.'
      default: return reason.message
    }
  }
  if (reason instanceof Error) return reason.message
  return fallback
}

export function usePatientSummary(patientId: string) {
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [state, setState] = useState<ReadState>('loading')
  const [action, setAction] = useState<ActionState>('idle')
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const controller = useRef<AbortController | null>(null)
  const busy = useRef(false)
  const pendingKeys = useRef<Record<ActionState, string | null>>({ idle: null, generating: null, reviewing: null, refreshing: null })

  const keyFor = (name: ActionState) => {
    const key = pendingKeys.current[name] ?? newIdempotencyKey()
    pendingKeys.current[name] = key
    return key
  }
  const clearKey = (name: ActionState) => { pendingKeys.current[name] = null }

  const load = useCallback(async () => {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setState('loading')
    setError('')
    try {
      const loaded = await getPatientSummary(repository, patientId, abort.signal)
      if (!abort.signal.aborted) { setSummary(loaded); setState('ready') }
    } catch (reason) {
      if (abort.signal.aborted) return
      setSummary(null)
      if (reason instanceof ApiError && reason.status === 404) setState('missing')
      else { setError(describeError(reason, 'Unable to load the summary.')); setState('error') }
    }
  }, [patientId])

  useEffect(() => {
    void load()
    return () => controller.current?.abort()
  }, [load])

  const begin = (name: ActionState) => {
    if (busy.current) return null
    busy.current = true
    const abort = new AbortController()
    controller.current = abort
    setAction(name)
    setError('')
    return abort
  }

  const finish = () => {
    busy.current = false
    setAction('idle')
  }

  const generate = async (expectedVersion: number | null) => {
    const abort = begin('generating')
    if (!abort) return
    const key = keyFor('generating')
    try {
      const next = await generatePatientSummary(repository, patientId, expectedVersion ?? 0, key, abort.signal)
      if (abort.signal.aborted) return
      clearKey('generating')
      setSummary(next)
      setState('ready')
      setAnnouncement('AI summary generated from source records.')
    } catch (reason) {
      if (!abort.signal.aborted) {
        if (reason instanceof ApiError && reason.status < 500) clearKey('generating')
        setError(describeError(reason, 'The summary could not be generated.'))
        setAnnouncement('Summary generation failed.')
      }
    } finally {
      finish()
    }
  }

  const review = async (reviewed: boolean) => {
    const abort = begin('reviewing')
    if (!abort) return
    const current = summary
    if (!current) { finish(); return }
    const key = keyFor('reviewing')
    try {
      const next = await reviewPatientSummary(
        repository,
        patientId,
        { summaryId: current.summaryId, expectedVersion: current.dataVersion, reviewed },
        key,
        abort.signal,
      )
      if (abort.signal.aborted) return
      clearKey('reviewing')
      setSummary(value => value?.summaryId === current.summaryId ? { ...value, review: next } : value)
      setAnnouncement(reviewed ? 'Summary marked reviewed.' : 'Summary review cleared.')
    } catch (reason) {
      if (!abort.signal.aborted) {
        if (reason instanceof ApiError && reason.status < 500) clearKey('reviewing')
        setError(describeError(reason, 'The review could not be saved.'))
        setAnnouncement('Review failed.')
      }
    } finally {
      finish()
    }
  }

  const refreshQuality = async () => {
    const abort = begin('refreshing')
    if (!abort) return
    const key = keyFor('refreshing')
    try {
      const next = await refreshPatientDataQuality(repository, patientId, key, abort.signal)
      if (abort.signal.aborted) return
      clearKey('refreshing')
      setSummary(value => value ? { ...value, dataQuality: next as DataQuality } : value)
      setAnnouncement('Data quality assessment refreshed.')
    } catch (reason) {
      if (!abort.signal.aborted) {
        if (reason instanceof ApiError && reason.status < 500) clearKey('refreshing')
        setError(describeError(reason, 'Data quality could not be refreshed.'))
        setAnnouncement('Data quality refresh failed.')
      }
    } finally {
      finish()
    }
  }

  const cancel = () => {
    controller.current?.abort()
    busy.current = false
    setAction('idle')
    setAnnouncement('Operation canceled.')
  }

  return { summary, state, action, error, announcement, load, generate, review, refreshQuality, cancel }
}
