import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, ApiError, type PatientDetail } from '../../../../api.ts'
import type {
  AnswerBlock,
  AssistantAnswer,
  AssistantCatalog,
  AssistantExchange,
  AssistantMode,
  AssistantSource,
} from '../../domain/assistant.ts'
import { answerAssistant, getAssistantCatalog, getAssistantExchange } from '../../application/operations.ts'
import { clinicalAiHttpRepository as repository, newIdempotencyKey } from '../../infrastructure/clinicalAiApi.ts'
import { SourceDialog, type CitationDetail } from '../SourceDialog.tsx'
import { Glyph, type GlyphKey } from '../../../../dashboard/healthcareAssistant/assistantIcons.tsx'
import heroNurse from '../../../../assets/dashboard/healthcare-assistant/assistant_hero_nurse.webp'
import doctorAvatar from '../../../../assets/dashboard/avatars/dashboard_doctor_avatar.png'
import '../../../../dashboard/healthcareAssistant/healthcareAssistant.css'
import '../clinicalAi.css'

type AssistantView = 'landing' | AssistantMode

const GROUP_GLYPHS: Record<string, GlyphKey> = {
  'Medical Terminology': 'book',
  'Clinical Guidelines': 'document',
  Medications: 'pill',
  'Drug Information': 'pill',
  'Hospital Procedures': 'clipboard',
  'Hospital Protocols': 'clipboard',
  'Medical Education': 'education',
}

const sourceDetail = (item: AssistantSource): CitationDetail => ({
  title: item.title,
  subtitle: `${item.kind} · ${item.dateLabel}`,
  description: item.summary,
})

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })

function timeLabel(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : timeFormat.format(date)
}

function errorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof ApiError) {
    if (reason.status === 401) return 'Your session expired. Sign in again to continue.'
    if (reason.status === 403) return 'You do not have permission to use the assistant.'
    if (reason.status === 429) return 'Too many requests. Wait a moment and try again.'
    if (reason.status === 502 || reason.status === 503) return 'The assistant is temporarily unavailable. Try again shortly.'
    return reason.message
  }
  return reason instanceof Error ? reason.message : fallback
}

function Spark() {
  return <svg className="ha-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" /></svg>
}

function AnswerBlocks({ blocks, sources, onSource }: {
  blocks: AnswerBlock[]
  sources: AssistantSource[]
  onSource: (source: AssistantSource) => void
}) {
  return <>{blocks.map((block, index) => {
    switch (block.type) {
      case 'text': return <p key={index}>{block.text}</p>
      case 'keyPoints': return <section className="ha-keypoints" key={index}>
        <h4>{block.heading}</h4>
        <ul>{block.items.map(item => <li key={item.label}><strong>{item.label}:</strong> {item.value}</li>)}</ul>
      </section>
      case 'soap': return <dl className="ha-soap" key={index}>{block.rows.map(row =>
        <div className={`ha-soap-row ha-soap-row--${row.letter.toLowerCase()}`} key={row.letter}>
          <dt><span className="ha-soap-letter" aria-hidden="true">{row.letter}</span>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>)}</dl>
      case 'excerpts': return <ul className="ha-excerpts" key={index}>{block.rows.map((row, rowIndex) => {
        const source = sources.find(item => item.sourceId === row.sourceId)
        return <li key={`${row.sourceId}-${rowIndex}`}>
          <span className="ha-excerpt-date">{row.dateLabel}</span>
          <span className="ha-excerpt-title">{row.title}</span>
          <span className="ha-excerpt-value">{row.value}</span>
          {source && <button type="button" className="ha-cite ha-cite--small" onClick={() => onSource(source)}>
            {source.marker}<span className="sr-only"> {source.title}</span>
          </button>}
        </li>
      })}</ul>
    }
  })}</>
}

function ModeSwitch({ catalog, mode, onSwitch }: {
  catalog: AssistantCatalog
  mode: AssistantMode
  onSwitch: (mode: AssistantMode) => void
}) {
  return <div className="ha-modes" role="group" aria-label="Assistant mode">
    {catalog.modes.map(item => {
      const active = item.key === mode
      return <button key={item.key} type="button" aria-pressed={active}
        className={`ha-mode${active ? ' ha-mode--active' : ''}`} onClick={() => onSwitch(item.key)}>
        <span className={`ha-icon-tile ha-tone--${item.key === 'general' ? 'teal' : 'blue'}`}>
          <Glyph name={item.key === 'general' ? 'hub' : 'person'} size={26} />
        </span>
        <span className="ha-mode-text">
          <span className="ha-mode-label">{item.label}</span>
          <span className="ha-mode-desc">{item.description}</span>
        </span>
      </button>
    })}
  </div>
}

function SourceRail({ sources, related, onSource }: {
  sources: AssistantSource[]
  related?: string
  onSource: (source: AssistantSource) => void
}) {
  return <aside className="ha-card ha-sources" aria-labelledby="ha-live-sources-title">
    <h2 id="ha-live-sources-title">Sources &amp; Citations</h2>
    <p className="ha-muted">Only sources supplied by the BUNDA backend are displayed.</p>
    {related && <h3 className="ha-sources-related">Related to: {related}</h3>}
    {!sources.length && <p className="ha-muted">No cited sources for the current response.</p>}
    <ul className="ha-source-list">{sources.map(item => <li key={item.sourceId}>
      <button type="button" className="ha-source" onClick={() => onSource(item)}>
        <span className="ha-source-marker">{item.marker}</span>
        <span className="ha-source-main">
          <span className="ha-source-title">{item.title}</span>
          <span className="ha-source-meta">{item.dateLabel} · {item.publisher}</span>
          <span className="ha-source-summary">{item.summary}</span>
        </span>
        <span className="ha-tag">{item.kind}</span>
      </button>
    </li>)}</ul>
  </aside>
}

export function HealthcareAssistantLivePage() {
  const [params] = useSearchParams()
  const requestedId = params.get('patientId') ?? ''
  const [catalog, setCatalog] = useState<AssistantCatalog | null>(null)
  const [catalogError, setCatalogError] = useState('')
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [view, setView] = useState<AssistantView>(requestedId ? 'patient' : 'landing')
  const [mode, setMode] = useState<AssistantMode>(requestedId ? 'patient' : 'general')
  const [draft, setDraft] = useState('')
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null)
  const [exchange, setExchange] = useState<AssistantExchange | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [source, setSource] = useState<CitationDetail | null>(null)
  const controller = useRef<AbortController | null>(null)
  const submitting = useRef(false)
  const retry = useRef<{ signature: string; key: string } | null>(null)

  const patientContextId = catalog?.patientContext?.patientId ?? (requestedId || null)

  useEffect(() => {
    const abort = new AbortController()
    setCatalogLoading(true)
    getAssistantCatalog(repository, abort.signal).then((next) => {
      if (!abort.signal.aborted) { setCatalog(next); setCatalogError(''); setCatalogLoading(false) }
    }).catch((reason) => {
      if (!abort.signal.aborted) {
        setCatalogError(errorMessage(reason, 'The assistant catalog could not be loaded.'))
        setCatalogLoading(false)
      }
    })
    return () => abort.abort()
  }, [])

  useEffect(() => {
    if (!catalog?.patientContext?.patientId) { setPatient(null); return }
    const abort = new AbortController()
    api.patients.get(catalog.patientContext.patientId).then((next) => {
      if (!abort.signal.aborted) setPatient(next)
    }).catch(() => {
      if (!abort.signal.aborted) setPatient(null)
    })
    return () => abort.abort()
  }, [catalog?.patientContext?.patientId])

  useEffect(() => () => controller.current?.abort(), [])

  const switchMode = (next: AssistantMode) => {
    controller.current?.abort()
    submitting.current = false
    setBusy(false)
    setAnswer(null)
    setExchange(null)
    setDraft('')
    setSource(null)
    setMode(next)
    setView(next)
    setMessage(`${next === 'general' ? 'General' : 'Patient'} Assistant selected.`)
  }

  const openExample = async (exchangeId: string | null, prompt: string) => {
    if (!exchangeId) {
      setDraft(prompt)
      setMessage('Question added to the composer.')
      return
    }
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setBusy(true)
    setMessage('Loading the recorded answer…')
    try {
      const next = await getAssistantExchange(repository, exchangeId, abort.signal)
      if (abort.signal.aborted) return
      setMode(next.mode)
      setView(next.mode)
      setAnswer(null)
      setExchange(next)
      setDraft('')
      setMessage('Showing a recorded conversation.')
    } catch (reason) {
      if (!abort.signal.aborted) setMessage(errorMessage(reason, 'The conversation could not be loaded.'))
    } finally {
      if (!abort.signal.aborted) setBusy(false)
    }
  }

  const requestedExchange = params.get('exchangeId') ?? ''
  useEffect(() => {
    if (catalog && requestedExchange) void openExample(requestedExchange, '')
    // The deep link is applied once the catalog is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, requestedExchange])

  const submit = async (event: FormEvent<HTMLFormElement>) => {    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt || submitting.current) return
    if (!catalog) return
    if (mode === 'patient' && !patientContextId) {
      setMessage('Open the assistant from a patient record to ask patient questions.')
      return
    }
    submitting.current = true
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setView(mode)
    setBusy(true)
    setAnswer(null)
    setExchange(null)
    setMessage('Retrieving source-grounded evidence…')
    const signature = `${mode}|${patientContextId ?? ''}|${prompt}`
    const key = retry.current?.signature === signature ? retry.current.key : newIdempotencyKey()
    retry.current = { signature, key }
    try {
      const value = await answerAssistant(repository, mode, prompt, patientContextId, key, abort.signal)
      if (abort.signal.aborted) return
      retry.current = null
      setAnswer(value)
      setMessage(value.outcome === 'answered' ? 'Answer ready with citations.' : 'No supported answer was found.')
    } catch (reason) {
      if (!abort.signal.aborted) setMessage(errorMessage(reason, 'Unable to answer right now.'))
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

  const answeredExchange = answer?.outcome === 'answered' ? answer.exchange : null
  const visibleExchange = answeredExchange ?? exchange
  const citations = visibleExchange?.citations ?? []
  const railSources = citations.length
    ? citations
    : catalog?.generalSources ?? []
  const composer = <form className="ha-composer" onSubmit={event => void submit(event)}>
    <span className="ha-attach" aria-hidden="true"><Glyph name="clip" /></span>
    <label htmlFor="ha-live-prompt" className="sr-only">Ask the healthcare assistant</label>
    <input id="ha-live-prompt" value={draft} maxLength={500} autoComplete="off"
      onChange={event => setDraft(event.target.value)}
      placeholder={mode === 'patient' ? 'Ask a question about this patient…' : 'Ask about medical knowledge, guidelines, or hospital procedures…'} />
    {busy ? <button type="button" className="ha-send" onClick={stop}><span className="sr-only">Cancel request</span>×</button> :
      <button type="submit" className="ha-send" disabled={!draft.trim() || (mode === 'patient' && !patientContextId)}>
        <Glyph name="send" /><span className="sr-only">Send</span>
      </button>}
    <p className="ha-composer-note" role="status" aria-live="polite"><Glyph name="info" size={14} />
      {message || 'Answers use approved backend evidence and show supplied citations.'}
    </p>
  </form>

  if (catalogLoading) {
    return <div className="ha-page">
      <nav className="ha-crumb" aria-label="Breadcrumb"><span aria-hidden="true">›</span><span aria-current="page">Healthcare Assistant</span></nav>
      <header className="ha-card ha-hero">
        <Glyph name="sparkles" size={64} className="ha-hero-spark" />
        <div className="ha-hero-text">
          <h1>Healthcare Assistant</h1>
          <p>Your source-grounded clinical companion for medical knowledge and patient-specific questions.</p>
        </div>
      </header>
      <section className="ha-card" aria-busy="true"><p className="ha-muted">Loading the assistant catalog…</p></section>
    </div>
  }

  if (!catalog) {
    return <div className="ha-page">
      <nav className="ha-crumb" aria-label="Breadcrumb"><span aria-hidden="true">›</span><span aria-current="page">Healthcare Assistant</span></nav>
      <header className="ha-card ha-hero">
        <Glyph name="sparkles" size={64} className="ha-hero-spark" />
        <div className="ha-hero-text">
          <h1>Healthcare Assistant</h1>
          <p>Your source-grounded clinical companion for medical knowledge and patient-specific questions.</p>
        </div>
      </header>
      <section className="ha-card" role="alert">
        <h2>Assistant unavailable</h2>
        <p className="ha-muted">{catalogError}</p>
      </section>
    </div>
  }

  return <div className={`ha-page ha-page--${view}`}>
    <nav className="ha-crumb" aria-label="Breadcrumb"><span aria-hidden="true">›</span><span aria-current="page">Healthcare Assistant</span></nav>
    <header className={`ha-card ha-hero${view === 'landing' ? '' : ' ha-hero--compact'}`}>
      <Glyph name="sparkles" size={64} className="ha-hero-spark" />
      <div className="ha-hero-text">
        <h1>Healthcare Assistant</h1>
        <p>Your source-grounded clinical companion for medical knowledge and patient-specific questions.</p>
      </div>
      {view === 'landing' && <img className="ha-hero-art" src={heroNurse} alt="" width={246} height={137} />}
      {view === 'patient' && <section className="ha-patient" aria-label="Selected patient context">
        {patient?.avatarUrl
          ? <img className="ha-patient-portrait" src={patient.avatarUrl} alt="" width={62} height={62} />
          : <span className="ha-patient-portrait ha-patient-portrait--empty" aria-hidden="true" />}
        <div>
          <h2>{patient?.displayName ?? 'Selected patient'}</h2>
          <p>
            <span>ID: {patient?.patientNumber ?? patientContextId ?? 'Not selected'}</span>
            {patient && <span>{patient.age} years</span>}
            {patient && <span>{patient.gender}</span>}
          </p>
          {!patientContextId && <p role="alert">Open the assistant from a patient record to load patient context.</p>}
        </div>
        {patient && <span className="ha-status">{patient.status.replace('_', ' ')}</span>}
        <Link className="ha-secondary" to="/dashboard/patients">Change Patient</Link>
      </section>}
      {view !== 'landing' && <ModeSwitch catalog={catalog} mode={mode} onSwitch={switchMode} />}
    </header>

    {view === 'landing' ? <div className="ha-layout">
      <div className="ha-main">
        <ModeSwitch catalog={catalog} mode={mode} onSwitch={switchMode} />
        <section className="ha-card" aria-labelledby="ha-live-topics-title">
          <div className="ha-card-head"><h2 id="ha-live-topics-title" className="ha-section-title">Try asking about:</h2></div>
          <ul className="ha-topics">{catalog.topics.map(topic => <li key={topic.title}>
            <button type="button" className="ha-topic" onClick={() => void openExample(topic.exchangeId, topic.example)}>
              <span className="ha-round-icon"><Glyph name={GROUP_GLYPHS[topic.title] ?? 'document'} size={18} /></span>
              <span className="ha-topic-title">{topic.title}</span><span className="ha-topic-example">“{topic.example}”</span>
            </button>
          </li>)}</ul>
        </section>
        <section className="ha-card ha-welcome-card" aria-labelledby="ha-live-suggested-title">
          <div className="ha-welcome"><span className="ha-welcome-spark"><Glyph name="sparkles" size={26} /></span>
            <div className="ha-welcome-bubble"><p>Welcome to BUNDA's Healthcare Assistant.</p>
              <p>Ask about approved medical knowledge, clinical guidance, hospital procedures, or this patient's records.</p></div>
          </div>
          <h2 id="ha-live-suggested-title" className="ha-subtitle">Suggested questions</h2>
          <ul className="ha-suggestions">{catalog.landingSuggestions.map(item => <li key={item.label}>
            <button type="button" className="ha-suggestion" onClick={() => void openExample(item.exchangeId, item.label)}>
              <span className="ha-arrow-tile"><Glyph name="arrow" size={14} /></span>
              <span className="ha-suggestion-label">{item.label}</span><Glyph name="chevron" size={16} />
            </button>
          </li>)}</ul>
          {composer}
        </section>
      </div>
      <div className="ha-side">
        <section className="ha-card" aria-labelledby="ha-live-knowledge-title">
          <div className="ha-card-head"><h2 id="ha-live-knowledge-title" className="ha-section-title"><Glyph name="kit" /> Knowledge Sources</h2></div>
          <ul className="ha-knowledge">{catalog.knowledgeGroups.map(group => <li key={group.title}>
            <span className="ha-icon-tile ha-knowledge-icon"><Glyph name={GROUP_GLYPHS[group.title] ?? 'document'} /></span>
            <span className="ha-knowledge-title">{group.title}</span><span className="ha-muted">{group.detail}</span>
            <span className="ha-count">{group.countLabel}</span>
          </li>)}</ul>
        </section>
        <section className="ha-card" aria-labelledby="ha-live-recent-title">
          <div className="ha-card-head"><h2 id="ha-live-recent-title" className="ha-section-title"><span className="ha-head-chat"><Glyph name="chat" size={16} /></span> Recent Conversations</h2></div>
          <ul className="ha-recent">{catalog.recentShortcuts.map(item => <li key={item.title}>
            <button type="button" className="ha-recent-item" onClick={() => void openExample(item.exchangeId, item.title)}>
              <Glyph name="chat" className="ha-recent-icon" /><span className="ha-recent-title">{item.title}</span>
              <Glyph name="chevron" size={16} className="ha-recent-chevron" />
            </button>
          </li>)}</ul>
        </section>
        <section className="ha-card ha-grounding"><Glyph name="shield" size={36} /><div>
          <h2>Reliable &amp; Source-Grounded</h2><p>Answers use approved backend evidence and retain their source citations.</p>
        </div></section>
      </div>
    </div> : <div className="ha-layout ha-layout--conversation">
      <section className="ha-card ha-conversation" aria-label={`${mode === 'general' ? 'General' : 'Patient'} Assistant conversation`}>
        {visibleExchange ? <ol className="ha-exchanges"><li className="ha-exchange" key={visibleExchange.exchangeId}>
          <div className="ha-question-row"><div className="ha-question"><span className="sr-only">You asked: </span>{visibleExchange.prompt}
            <span className="ha-time">{timeLabel(visibleExchange.createdAt)}</span></div>
            <img className="ha-avatar" src={doctorAvatar} alt="" width={32} height={32} /></div>
          <article className="ha-answer" aria-label="Assistant response"><Spark /><div className="ha-answer-body">
            <AnswerBlocks blocks={visibleExchange.answer} sources={visibleExchange.citations} onSource={item => setSource(sourceDetail(item))} />
            <ul className="ha-cites">{visibleExchange.citations.map(item => <li key={item.sourceId}><button type="button" className="ha-cite"
              onClick={() => setSource(sourceDetail(item))}>{item.marker} {item.kind}</button></li>)}</ul>
            <span className="ha-time">{timeLabel(visibleExchange.createdAt)}</span>
          </div></article>
        </li></ol> : <div className="ha-keypoints" role="status">
          <h2>No conversation open</h2>
          <p>{mode === 'patient' && !patientContextId
            ? 'Open the assistant from a patient record to load patient context.'
            : 'Ask a question below, or pick a suggested question from the landing page.'}</p>
        </div>}
        {answer?.outcome === 'unsupported' && <div className="ha-keypoints" role="status"><h2>Unsupported question</h2>
          <p>{answer.reason} No answer was generated.</p></div>}
        <div className="ha-prompts" role="group" aria-label="Suggested prompts">
          <span className="ha-prompts-label">Suggested prompts:</span>
          {catalog.landingSuggestions.map(item =>
            <button key={item.label} type="button" className="ha-chip" onClick={() => setDraft(item.label)}>{item.label}</button>)}
        </div>
        {composer}
      </section>
      <SourceRail sources={railSources} related={visibleExchange?.prompt}
        onSource={item => setSource(sourceDetail(item))} />
    </div>}
    <SourceDialog source={source} onClose={() => setSource(null)} />
  </div>
}
