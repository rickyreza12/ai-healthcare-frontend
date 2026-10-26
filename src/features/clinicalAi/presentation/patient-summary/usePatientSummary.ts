import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../../../api.ts'
import type { AiSummary } from '../../domain/patientSummary.ts'
import { clinicalAiHttpRepository as repository } from '../../infrastructure/clinicalAiApi.ts'
import { getPatientSummary, ingestPatient, refreshPatientSummary, reviewPatientSummary } from '../../application/operations.ts'

type ReadState = 'loading' | 'ready' | 'missing' | 'error'
type ActionState = 'idle' | 'ingesting' | 'refreshing' | 'reviewing'

export function usePatientSummary(patientId: string) {
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [state, setState] = useState<ReadState>('loading')
  const [action, setAction] = useState<ActionState>('idle')
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const controller = useRef<AbortController | null>(null)
  const busy = useRef(false)

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
      else { setError(reason instanceof Error ? reason.message : 'Unable to load summary.'); setState('error') }
    }
  }, [patientId])

  useEffect(() => {
    void load()
    return () => controller.current?.abort()
  }, [load])

  const perform = async (name: ActionState, run: (signal: AbortSignal) => Promise<AiSummary>) => {
    if (busy.current) return
    busy.current = true
    const abort = new AbortController()
    controller.current = abort
    setAction(name)
    setError('')
    try {
      const next = await run(abort.signal)
      if (abort.signal.aborted) return
      setSummary(next)
      setState('ready')
      setAnnouncement(name === 'ingesting' ? 'Clinical source imported and summary generated.' : 'Summary refreshed.')
    } catch (reason) {
      if (!abort.signal.aborted) {
        setError(reason instanceof Error ? reason.message : 'Operation failed.')
        setAnnouncement('Summary operation failed.')
      }
    } finally {
      busy.current = false
      setAction('idle')
    }
  }

  const ingest = () => perform('ingesting', async signal => {
    await ingestPatient(repository, patientId, signal)
    return refreshPatientSummary(repository, patientId, signal)
  })

  const refresh = () => perform('refreshing', signal => refreshPatientSummary(repository, patientId, signal))

  const review = async (reviewed: boolean) => {
    if (busy.current || !summary) return
    busy.current = true
    const abort = new AbortController()
    controller.current = abort
    setAction('reviewing')
    setError('')
    try {
      const next = await reviewPatientSummary(repository, patientId, summary.summaryId, reviewed, abort.signal)
      if (!abort.signal.aborted) {
        setSummary(current => current?.summaryId === summary.summaryId ? { ...current, review: next } : current)
        setAnnouncement(reviewed ? 'Summary marked reviewed.' : 'Summary review cleared.')
      }
    } catch (reason) {
      if (!abort.signal.aborted) {
        setError(reason instanceof ApiError && reason.status === 409
          ? 'Summary changed on the server. Reload it before reviewing.'
          : reason instanceof Error ? reason.message : 'Review failed.')
        setAnnouncement('Review failed.')
      }
    } finally {
      busy.current = false
      setAction('idle')
    }
  }

  const cancel = () => {
    controller.current?.abort()
    busy.current = false
    setAction('idle')
    setAnnouncement('Operation canceled.')
  }

  return { summary, state, action, error, announcement, load, ingest, refresh, review, cancel }
}
