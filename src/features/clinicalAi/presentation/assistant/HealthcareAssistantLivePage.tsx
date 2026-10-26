import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../../api.ts'
import type {
  AnswerBlock,
  AssistantAnswer,
  AssistantCatalog,
  AssistantExchange,
  AssistantMode,
  AssistantSource,
} from '../../domain/assistant.ts'
import { answerAssistant } from '../../application/operations.ts'
import { clinicalAiHttpRepository as repository } from '../../infrastructure/clinicalAiApi.ts'
import { SourceDialog, type CitationDetail } from '../SourceDialog.tsx'
import { Glyph, type GlyphKey } from '../../../../dashboard/healthcareAssistant/assistantIcons.tsx'
import {
  ASSISTANT_MODES,
  ASSISTANT_PATIENT,
  EXCHANGES,
  GENERAL_SOURCES,
  KNOWLEDGE_GROUPS,
  LANDING_SUGGESTIONS,
  PATIENT_SOURCES,
  RECENT_CONVERSATIONS,
  TOPICS,
} from '../../../../dashboard/healthcareAssistant/assistantData.ts'
import heroNurse from '../../../../assets/dashboard/healthcare-assistant/assistant_hero_nurse.webp'
import patientPortrait from '../../../../assets/dashboard/healthcare-assistant/assistant_patient_siti_aisyah.png'
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

const toSource = (item: typeof GENERAL_SOURCES[number]): AssistantSource => ({
  sourceId: item.id,
  marker: item.marker,
  title: item.title,
  kind: item.kind,
  dateLabel: item.date,
  publisher: item.publisher,
  summary: item.summary,
})

const LOCAL_GENERAL_SOURCES = GENERAL_SOURCES.map(toSource)
const LOCAL_PATIENT_SOURCES = PATIENT_SOURCES.map(toSource)
const LOCAL_SOURCES = [...LOCAL_GENERAL_SOURCES, ...LOCAL_PATIENT_SOURCES]

const toBlock = (block: typeof EXCHANGES[number]['answer'][number]): AnswerBlock => {
  switch (block.type) {
    case 'text': return { ...block }
    case 'keyPoints': return { ...block, items: block.items.map(item => ({ ...item })) }
    case 'soap': return { ...block, rows: block.rows.map(row => ({ ...row })) }
    case 'excerpts': return {
      ...block,
      rows: block.rows.map(row => ({ dateLabel: row.date, title: row.title, value: row.value, sourceId: row.sourceId })),
    }
  }
}

const LOCAL_EXCHANGES: AssistantExchange[] = EXCHANGES.map(item => ({
  exchangeId: item.id,
  mode: item.mode,
  prompt: item.prompt,
  answer: item.answer.map(toBlock),
  citations: item.citations.map(id => LOCAL_SOURCES.find(source => source.sourceId === id)!),
}))

const LOCAL_CATALOG: AssistantCatalog = {
  modes: ASSISTANT_MODES.map(item => ({ ...item })),
  topics: TOPICS.map(item => ({ ...item })),
  landingSuggestions: LANDING_SUGGESTIONS.map(item => ({ ...item })),
  knowledgeGroups: KNOWLEDGE_GROUPS.map(item => ({
    title: item.title,
    detail: item.detail,
    countLabel: `${item.count} sources`,
  })),
  recentShortcuts: RECENT_CONVERSATIONS.map(item => ({ title: item.title, exchangeId: item.exchangeId })),
  patientContext: null,
  generalSources: LOCAL_GENERAL_SOURCES,
}

const sourceDetail = (item: AssistantSource): CitationDetail => ({
  title: item.title,
  subtitle: `${item.kind} · ${item.dateLabel}`,
  description: item.summary,
})

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
  const [view, setView] = useState<AssistantView>(requestedId ? 'patient' : 'landing')
  const [mode, setMode] = useState<AssistantMode>(requestedId ? 'patient' : 'general')
  const [contextId, setContextId] = useState<string | null>(null)
  const [contextError, setContextError] = useState('')
  const [draft, setDraft] = useState('')
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [source, setSource] = useState<CitationDetail | null>(null)
  const controller = useRef<AbortController | null>(null)
  const submitting = useRef(false)

  useEffect(() => () => controller.current?.abort(), [])

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
    setView(next)
    setMessage(`${next === 'general' ? 'General' : 'Patient'} Assistant selected.`)
  }

  const openExample = (exchangeId: string | null, prompt: string) => {
    const exchange = LOCAL_EXCHANGES.find(item => item.exchangeId === exchangeId)
    setMode(exchange?.mode ?? 'general')
    setView(exchange?.mode ?? 'general')
    setAnswer(null)
    setDraft(exchange ? '' : prompt)
    setMessage(exchange ? 'Showing supplied reference conversations.' : 'Question added to the composer.')
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
    setView(mode)
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

  const citations = answer?.outcome === 'answered' ? answer.exchange.citations : []
  const visibleExchanges = answer?.outcome === 'answered'
    ? [answer.exchange]
    : LOCAL_EXCHANGES.filter(exchange => exchange.mode === mode)
  const railSources = citations.length
    ? citations
    : mode === 'general' ? LOCAL_GENERAL_SOURCES : LOCAL_PATIENT_SOURCES
  const composer = <form className="ha-composer" onSubmit={event => void submit(event)}>
    <span className="ha-attach" aria-hidden="true"><Glyph name="clip" /></span>
    <label htmlFor="ha-live-prompt" className="sr-only">Ask the healthcare assistant</label>
    <input id="ha-live-prompt" value={draft} maxLength={500} autoComplete="off"
      onChange={event => setDraft(event.target.value)}
      placeholder={mode === 'patient' ? 'Ask a question about this patient…' : 'Ask about medical knowledge, guidelines, or hospital procedures…'} />
    {busy ? <button type="button" className="ha-send" onClick={stop}><span className="sr-only">Cancel request</span>×</button> :
      <button type="submit" className="ha-send" disabled={!draft.trim() || (mode === 'patient' && !contextId)}>
        <Glyph name="send" /><span className="sr-only">Send</span>
      </button>}
    <p className="ha-composer-note" role="status" aria-live="polite"><Glyph name="info" size={14} />
      {message || 'Answers use approved backend evidence and show supplied citations.'}
    </p>
  </form>

  return <div className={`ha-page ha-page--${view}`}>
    <header className="ha-card ha-hero">
      <Glyph name="sparkles" size={64} className="ha-hero-spark" />
      <div className="ha-hero-text">
        <h1>Healthcare Assistant</h1>
        <p>Your source-grounded clinical companion for medical knowledge and patient-specific questions.</p>
      </div>
      {view === 'landing' && <img className="ha-hero-art" src={heroNurse} alt="" width={246} height={137} />}
      {view === 'patient' && <section className="ha-patient" aria-label="Selected patient context">
        <img className="ha-patient-portrait" src={patientPortrait} alt="" width={62} height={62} />
        <div><h2>{contextId || requestedId ? 'Selected patient' : ASSISTANT_PATIENT.name}</h2>
          <p>{contextId || requestedId ? <span>ID: {contextId ?? requestedId}</span> : <>
            <span>ID: {ASSISTANT_PATIENT.patientId}</span><span>{ASSISTANT_PATIENT.age}</span><span>{ASSISTANT_PATIENT.gender}</span></>}</p>
          {contextError && <p role="alert">{contextError}</p>}</div>
        {!requestedId && <span className="ha-status">{ASSISTANT_PATIENT.status}</span>}
        <Link className="ha-secondary" to="/dashboard/patients">Change Patient</Link>
      </section>}
      {view !== 'landing' && <ModeSwitch catalog={LOCAL_CATALOG} mode={mode} onSwitch={switchMode} />}
    </header>

    {view === 'landing' ? <div className="ha-layout">
      <div className="ha-main">
        <ModeSwitch catalog={LOCAL_CATALOG} mode={mode} onSwitch={switchMode} />
        <section className="ha-card" aria-labelledby="ha-live-topics-title">
          <div className="ha-card-head"><h2 id="ha-live-topics-title" className="ha-section-title">Try asking about:</h2></div>
          <ul className="ha-topics">{LOCAL_CATALOG.topics.map(topic => <li key={topic.title}>
            <button type="button" className="ha-topic" onClick={() => openExample(topic.exchangeId, topic.example)}>
              <span className="ha-round-icon"><Glyph name={GROUP_GLYPHS[topic.title] ?? 'document'} size={18} /></span>
              <span className="ha-topic-title">{topic.title}</span><span className="ha-topic-example">“{topic.example}”</span>
            </button>
          </li>)}</ul>
        </section>
        <section className="ha-card ha-welcome-card" aria-labelledby="ha-live-suggested-title">
          <div className="ha-welcome"><span className="ha-welcome-spark"><Glyph name="sparkles" size={26} /></span>
            <div className="ha-welcome-bubble"><p>Welcome to BUNDA's Healthcare Assistant.</p>
              <p>Ask about approved medical knowledge, clinical guidance, hospital procedures, or an ingested patient's records.</p></div>
          </div>
          <h2 id="ha-live-suggested-title" className="ha-subtitle">Suggested questions</h2>
          <ul className="ha-suggestions">{LOCAL_CATALOG.landingSuggestions.map(item => <li key={item.label}>
            <button type="button" className="ha-suggestion" onClick={() => openExample(item.exchangeId, item.label)}>
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
          <ul className="ha-knowledge">{LOCAL_CATALOG.knowledgeGroups.map(group => <li key={group.title}>
            <span className="ha-icon-tile ha-knowledge-icon"><Glyph name={GROUP_GLYPHS[group.title] ?? 'document'} /></span>
            <span className="ha-knowledge-title">{group.title}</span><span className="ha-muted">{group.detail}</span>
            <span className="ha-count">{group.countLabel}</span>
          </li>)}</ul>
        </section>
        <section className="ha-card" aria-labelledby="ha-live-recent-title">
          <div className="ha-card-head"><h2 id="ha-live-recent-title" className="ha-section-title"><span className="ha-head-chat"><Glyph name="chat" size={16} /></span> Recent Conversations</h2></div>
          <ul className="ha-recent">{LOCAL_CATALOG.recentShortcuts.map(item => <li key={item.title}>
            <button type="button" className="ha-recent-item" onClick={() => openExample(item.exchangeId, item.title)}>
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
        <ol className="ha-exchanges">{visibleExchanges.map((exchange, index) => <li className="ha-exchange" key={exchange.exchangeId}>
          <div className="ha-question-row"><div className="ha-question"><span className="sr-only">You asked: </span>{exchange.prompt}
            <span className="ha-time">{index ? '10:26 AM' : '10:24 AM'}</span></div>
            <img className="ha-avatar" src={doctorAvatar} alt="" width={32} height={32} /></div>
          <article className="ha-answer" aria-label="Assistant response"><Spark /><div className="ha-answer-body">
            <AnswerBlocks blocks={exchange.answer} sources={exchange.citations} onSource={item => setSource(sourceDetail(item))} />
            <ul className="ha-cites">{exchange.citations.map(item => <li key={item.sourceId}><button type="button" className="ha-cite"
              onClick={() => setSource(sourceDetail(item))}>{item.marker} {item.kind}</button></li>)}</ul>
            <span className="ha-time">{index ? '10:26 AM' : '10:24 AM'}</span>
          </div></article>
        </li>)}</ol>
        {answer?.outcome === 'unsupported' && <div className="ha-keypoints" role="status"><h2>Unsupported question</h2>
          <p>This question is not available in the approved evidence collection. No answer was generated.</p></div>}
        <div className="ha-prompts" role="group" aria-label="Suggested prompts">
          <span className="ha-prompts-label">Suggested prompts:</span>
          {(mode === 'general' ? ['Explain a medical condition', 'ICD-10 coding help', 'SOAP documentation', 'Clinical guidelines'] :
            ['Latest lab results', 'Current medications', 'Fetal growth trend', 'Upcoming appointments']).map(prompt =>
            <button key={prompt} type="button" className="ha-chip" onClick={() => setDraft(prompt)}>{prompt}</button>)}
        </div>
        {composer}
      </section>
      <SourceRail sources={railSources} related={mode === 'patient' ? 'Why is hypertension flagged?' : undefined}
        onSource={item => setSource(sourceDetail(item))} />
    </div>}
    <SourceDialog source={source} onClose={() => setSource(null)} />
  </div>
}
