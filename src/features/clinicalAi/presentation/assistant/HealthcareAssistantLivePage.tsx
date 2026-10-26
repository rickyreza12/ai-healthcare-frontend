import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../../api.ts'
import type { AssistantAnswer, AssistantCatalog, AssistantMode, AssistantSource } from '../../domain/assistant.ts'
import { getAssistantCatalog, getAssistantExchange, answerAssistant } from '../../application/operations.ts'
import { clinicalAiHttpRepository as repository } from '../../infrastructure/clinicalAiApi.ts'
import { AssistantAnswerBlocks } from './AssistantAnswerBlocks.tsx'
import { SourceDialog, type CitationDetail } from '../SourceDialog.tsx'
import heroNurse from '../../../../assets/dashboard/healthcare-assistant/assistant_hero_nurse.webp'
import '../clinicalAi.css'

type LoadState = 'loading' | 'ready' | 'error'

export function HealthcareAssistantLivePage() {
  const [params] = useSearchParams()
  const requestedId = params.get('patientId') ?? ''
  const [mode, setMode] = useState<AssistantMode>(requestedId ? 'patient' : 'general')
  const [catalog, setCatalog] = useState<AssistantCatalog | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [contextId, setContextId] = useState<string | null>(null)
  const [contextError, setContextError] = useState('')
  const [draft, setDraft] = useState('')
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [source, setSource] = useState<CitationDetail | null>(null)
  const controller = useRef<AbortController | null>(null)
  const submitting = useRef(false)

  const load = () => {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setLoadState('loading')
    getAssistantCatalog(repository, abort.signal).then(value => {
      if (!abort.signal.aborted) { setCatalog(value); setLoadState('ready') }
    }).catch(reason => {
      if (!abort.signal.aborted) {
        setLoadState('error')
        setMessage(reason instanceof Error ? reason.message : 'Catalog could not load.')
      }
    })
  }

  useEffect(() => {
    load()
    return () => controller.current?.abort()
    // Initial catalog request is owned by this page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!requestedId) { setContextId(null); setContextError(''); return }
    const abort = new AbortController()
    repository.getSummary(requestedId, abort.signal).then(summary => {
      if (abort.signal.aborted) return
      if (summary.patientContextId !== requestedId) {
        setContextError('The patient context does not match the requested patient ID.')
        setContextId(null)
      } else {
        setContextId(summary.patientContextId)
        setContextError('')
      }
    }).catch(reason => {
      if (!abort.signal.aborted) {
        setContextId(null)
        setContextError(reason instanceof Error ? reason.message : 'Patient context is unavailable.')
      }
    })
    return () => abort.abort()
  }, [requestedId])

  const switchMode = (next: AssistantMode) => {
    controller.current?.abort()
    submitting.current = false
    setBusy(false)
    setAnswer(null)
    setDraft('')
    setSource(null)
    setMode(next)
    setMessage(`${next === 'general' ? 'General' : 'Patient'} Assistant selected.`)
  }

  const fetchExchange = async (exchangeId: string) => {
    if (submitting.current) return
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setBusy(true)
    setMessage('Loading approved example…')
    try {
      const exchange = await getAssistantExchange(repository, exchangeId, abort.signal)
      if (abort.signal.aborted) return
      setMode(exchange.mode)
      setAnswer({ outcome: 'answered', exchange })
      setMessage('Approved example loaded.')
    } catch (reason) {
      if (!abort.signal.aborted) setMessage(reason instanceof Error ? reason.message : 'Example unavailable.')
    } finally { if (!abort.signal.aborted) setBusy(false) }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt || submitting.current) return
    if (mode === 'patient' && !contextId) {
      setMessage('Select an ingested patient summary before asking patient questions.')
      return
    }
    submitting.current = true
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setBusy(true)
    setAnswer(null)
    setMessage('Retrieving approved evidence…')
    try {
      const value = await answerAssistant(repository, mode, prompt,
        mode === 'patient' ? contextId ?? undefined : undefined, abort.signal)
      if (abort.signal.aborted) return
      setAnswer(value)
      setMessage(value.outcome === 'answered' ? 'Answer ready with citations.' : 'No supported answer was found.')
    } catch (reason) {
      if (!abort.signal.aborted) setMessage(reason instanceof ApiError && reason.status === 401
        ? 'Session expired. Sign in again.' : reason instanceof Error ? reason.message : 'Unable to answer.')
    } finally {
      submitting.current = false
      if (!abort.signal.aborted) setBusy(false)
    }
  }

  const stop = () => {
    controller.current?.abort()
    submitting.current = false
    setBusy(false)
    setMessage('Request canceled.')
  }

  const citations: AssistantSource[] = answer?.outcome === 'answered' ? answer.exchange.citations : []
  return <div className="clinical-page clinical-assistant-page">
    <header className="clinical-header clinical-assistant-header">
      <div>
        <p className="clinical-overline">BUNDA AI / Clinical knowledge</p>
        <h1>Healthcare Assistant</h1>
        <p className="clinical-muted">Answers are limited to approved records and explicitly supported questions.</p>
      </div>
      <img className="clinical-nurse" src={heroNurse} alt="BUNDA healthcare nurse illustration" />
    </header>
    <div className="clinical-mode-switch" role="group" aria-label="Assistant mode">
      <button type="button" aria-pressed={mode === 'general'} className={mode === 'general' ? 'clinical-active' : ''}
        onClick={() => switchMode('general')}>General Assistant</button>
      <button type="button" aria-pressed={mode === 'patient'} className={mode === 'patient' ? 'clinical-active' : ''}
        onClick={() => switchMode('patient')}>Patient Assistant</button>
    </div>
    {mode === 'patient' && <section className="clinical-card clinical-context-banner">
      <div><h2>Patient context</h2>
        <p>{contextId ? `Verified CAS patient: ${contextId}` : 'No verified patient selected.'}</p>
        {contextError && <p role="alert">{contextError}</p>}
      </div>
      <Link to="/dashboard/patients">Select an ingested patient from the patient directory</Link>
    </section>}

    {loadState === 'loading' && <section className="clinical-card" aria-busy="true">Loading approved assistant topics…</section>}
    {loadState === 'error' && <section className="clinical-card" role="alert">
      <h2>Assistant catalog unavailable</h2>
      <button type="button" onClick={load}>Try again</button>
    </section>}
    {loadState === 'ready' && <div className="clinical-grid clinical-assistant-grid">
      <section className="clinical-card clinical-main-card">
        <h2>{mode === 'general' ? 'Ask about documentation' : 'Ask about recorded patient evidence'}</h2>
        <p className="clinical-muted">{mode === 'general' ? 'Use an approved example or submit a question.' :
          'Only the selected patient’s ingested clinical records can be retrieved.'}</p>
        <div className="clinical-suggestions">
          {mode === 'general' ? catalog?.landingSuggestions.map(item =>
            <button type="button" disabled={busy || !item.exchangeId} key={item.label}
              onClick={() => item.exchangeId && void fetchExchange(item.exchangeId)}>{item.label}</button>) :
            ['What diagnoses are recorded?', 'Summarize the latest visit.'].map(prompt =>
              <button type="button" key={prompt} disabled={!contextId || busy} onClick={() => setDraft(prompt)}>{prompt}</button>)}
        </div>
        {catalog && catalog.landingSuggestions.length === 0 && mode === 'general' &&
          <p>No approved examples are available.</p>}
        <form className="clinical-composer" onSubmit={event => void submit(event)}>
          <label htmlFor="clinical-prompt">Your question</label>
          <textarea id="clinical-prompt" value={draft} maxLength={500}
            onChange={event => setDraft(event.target.value)} rows={3}
            placeholder="Ask about the approved clinical knowledge…" />
          <div><small>{draft.length}/500 characters</small>
            {busy && <button type="button" onClick={stop}>Cancel request</button>}
            <button type="submit" disabled={busy || !draft.trim() || (mode === 'patient' && !contextId)}>
              {busy ? 'Retrieving…' : 'Ask assistant'}</button></div>
        </form>
        <p role="status" aria-live="polite" className="clinical-status-message">{message}</p>
        {answer?.outcome === 'unsupported' && <article className="clinical-unsupported" role="status">
          <h3>Unsupported question</h3>
          <p>This question is not available in the approved evidence collection. No answer was generated.</p>
        </article>}
        {answer?.outcome === 'answered' && <article className="clinical-answer" aria-label="Assistant response">
          <h3>Response</h3>
          <AssistantAnswerBlocks blocks={answer.exchange.answer} sources={citations} onSource={setSource} />
        </article>}
      </section>
      <aside className="clinical-card clinical-source-rail">
        <h2>Sources &amp; Citations</h2>
        <p className="clinical-muted">Only sources supplied by the BUNDA backend are displayed.</p>
        {!citations.length && <p>No cited sources for the current response.</p>}
        <ul className="clinical-evidence">{citations.map(item => <li key={item.sourceId}>
          <div><strong>{item.marker} · {item.title}</strong><p>{item.publisher}</p><small>{item.dateLabel}</small></div>
          <button type="button" onClick={() => setSource({ title: item.title,
            subtitle: `${item.kind} · ${item.dateLabel}`, description: item.summary })}>Details</button>
        </li>)}</ul>
      </aside>
    </div>}
    <SourceDialog source={source} onClose={() => setSource(null)} />
  </div>
}
