import { useState, type FormEvent } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import { ReadOnlyDialog } from '../ReadOnlyDialog.tsx'
import {
  ASSISTANT_MODES,
  ASSISTANT_PAGE,
  ASSISTANT_PATIENT,
  DEFAULT_VIEW,
  KNOWLEDGE_GROUPS,
  LANDING_SUGGESTIONS,
  PATIENT_RAIL_EXCHANGE_ID,
  RECENT_CONVERSATIONS,
  TOPICS,
  type AnswerBlock,
  type AssistantMode,
  type AssistantSource,
  type AssistantView,
  type ScriptedExchange,
} from './assistantData.ts'
import { exchangesFor, findExchange, findSource, matchPrompt, sourcesFor } from './assistantLogic.ts'

import doctorAvatar from '../../assets/dashboard/avatars/dashboard_doctor_avatar.png'
import heroNurse from '../../assets/dashboard/healthcare-assistant/assistant_hero_nurse.webp'
import sitiPortrait from '../../assets/dashboard/healthcare-assistant/assistant_patient_siti_aisyah.png'
import { Glyph, type GlyphKey } from './assistantIcons.tsx'

import './healthcareAssistant.css'

const GROUP_GLYPHS: Record<string, GlyphKey> = {
  'Medical Terminology': 'book',
  'Clinical Guidelines': 'document',
  Medications: 'pill',
  'Drug Information': 'pill',
  'Hospital Procedures': 'clipboard',
  'Hospital Protocols': 'clipboard',
  'Medical Education': 'education',
}

const NO_MORE: Notice = { title: 'More examples', body: 'Only the four example topics above are supplied in this demo.' }
const NO_LIBRARY: Notice = { title: 'Knowledge Sources', body: 'Source counts are demonstration figures. No source library is connected in this demo.' }
const NO_HISTORY: Notice = { title: 'Conversation history', body: 'Recent items are fixture shortcuts. Conversations are not saved in this demo.' }

const UNSUPPORTED: Notice = {
  title: 'Not available in this demo',
  body: 'Only the supplied demonstration questions have answers. No AI service is connected, so other questions are not answered.',
}

const sourceDomId = (id: string) => `ha-source-${id}`
const exchangeDomId = (id: string) => `ha-exchange-${id}`

function Spark() {
  return (
    <svg className="ha-spark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
    </svg>
  )
}

function AnswerBody({ blocks, mode, onCite }: { blocks: readonly AnswerBlock[]; mode: AssistantMode; onCite: (id: string) => void }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'text':
            return <p key={index}>{block.text}</p>
          case 'keyPoints':
            return (
              <div key={index} className="ha-keypoints">
                <h4>{block.heading}</h4>
                <ul>
                  {block.items.map((item) => (
                    <li key={item.label}><strong>{item.label}:</strong> {item.value}</li>
                  ))}
                </ul>
              </div>
            )
          case 'soap':
            return (
              <dl key={index} className="ha-soap">
                {block.rows.map((row) => (
                  <div key={row.letter} className={`ha-soap-row ha-soap-row--${row.letter.toLowerCase()}`}>
                    <dt><span className="ha-soap-letter" aria-hidden="true">{row.letter}</span>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            )
          case 'excerpts':
            return (
              <ul key={index} className="ha-excerpts">
                {block.rows.map((row) => {
                  const source = findSource(row.sourceId, mode)
                  return (
                    <li key={row.date}>
                      <span className="ha-excerpt-date">{row.date}</span>
                      <span className="ha-excerpt-title">{row.title}</span>
                      <span className="ha-excerpt-value">{row.value}</span>
                      {source && (
                        <button type="button" className="ha-cite ha-cite--small" onClick={() => onCite(source.id)}>
                          {source.marker}
                          <span className="sr-only"> {source.title}</span>
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )
        }
      })}
    </>
  )
}

function Exchange({ exchange, mode, selected, onSelect, onCite }: {
  exchange: ScriptedExchange
  mode: AssistantMode
  selected: boolean
  onSelect: () => void
  onCite: (id: string) => void
}) {
  const questionId = `${exchangeDomId(exchange.id)}-q`
  const citesId = `${exchangeDomId(exchange.id)}-cites`
  return (
    <li className={`ha-exchange${selected ? ' ha-exchange--selected' : ''}`} id={exchangeDomId(exchange.id)} tabIndex={-1}>
      <div className="ha-question-row">
        <p className="ha-question" id={questionId}>
          <span className="sr-only">You asked: </span>
          {exchange.prompt}
        </p>
        <img className="ha-avatar" src={doctorAvatar} alt="" width={32} height={32} />
      </div>
      <article className="ha-answer" aria-labelledby={questionId} aria-describedby={citesId} onClick={onSelect}>
        <Spark />
        <div className="ha-answer-body">
          <span className="sr-only">Supplied reference answer:</span>
          <AnswerBody blocks={exchange.answer} mode={mode} onCite={onCite} />
          <ul className="ha-cites" id={citesId} aria-label="Sources for this answer">
            {exchange.citations.map((id) => {
              const source = findSource(id, mode)
              if (!source) return null
              return (
                <li key={id}>
                  <button type="button" className="ha-cite" onClick={(event) => { event.stopPropagation(); onSelect(); onCite(id) }}>
                    {source.marker} {source.kind}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </article>
    </li>
  )
}

function SourceRail({ sources, heading, onOpen }: { sources: readonly AssistantSource[]; heading: string | null; onOpen: (source: AssistantSource) => void }) {
  return (
    <aside className="ha-card ha-sources" aria-labelledby="ha-sources-title">
      <h2 id="ha-sources-title">Sources &amp; Citations</h2>
      <p className="ha-muted">Supplied reference sources for the demonstration answers. Select an item to view its fixture details.</p>
      {heading && <h3 className="ha-sources-related">Related to: {heading}</h3>}
      <ul className="ha-source-list">
        {sources.map((source) => (
          <li key={source.id}>
            <button type="button" id={sourceDomId(source.id)} className="ha-source" onClick={() => onOpen(source)}>
              <span className="ha-source-marker">{source.marker}</span>
              <span className="ha-source-main">
                <span className="ha-source-title">{source.title}</span>
                <span className="ha-source-meta">{source.date} · {source.publisher}</span>
                <span className="ha-source-summary">{source.summary}</span>
              </span>
              <span className="ha-tag">{source.kind}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export function HealthcareAssistantPage() {
  const [view, setView] = useState<AssistantView>(DEFAULT_VIEW)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [openSource, setOpenSource] = useState<AssistantSource | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const activeMode: AssistantMode = view === 'patient' ? 'patient' : 'general'

  const switchView = (next: AssistantView, exchangeId: string | null = null) => {
    setView(next)
    setSelectedId(exchangeId ?? (next === 'patient' ? PATIENT_RAIL_EXCHANGE_ID : null))
    const label = next === 'landing' ? 'Assistant overview' : ASSISTANT_MODES.find((mode) => mode.key === next)?.label
    const exchange = exchangeId ? findExchange(exchangeId) : null
    setAnnouncement(exchange ? `${label}: showing “${exchange.prompt}”` : `${label} selected`)
    if (exchangeId) requestAnimationFrame(() => document.getElementById(exchangeDomId(exchangeId))?.focus())
  }

  const openExchange = (exchangeId: string | null, label: string) => {
    if (!exchangeId) {
      setNotice({ title: label, body: 'This example has no supplied demonstration answer. Try one of the supplied ICD-10 or SOAP questions.' })
      return
    }
    const exchange = findExchange(exchangeId)
    if (exchange) switchView(exchange.mode, exchange.id)
  }

  const focusSource = (id: string) => {
    const card = document.getElementById(sourceDomId(id))
    card?.scrollIntoView({ block: 'nearest' })
    card?.focus()
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const match = matchPrompt(draft, activeMode)
    if (!match) {
      setNotice(UNSUPPORTED)
      return
    }
    setDraft('')
    switchView(match.mode, match.id)
  }

  const modeSwitch = (
    <div className="ha-modes" role="group" aria-label="Assistant mode">
      {ASSISTANT_MODES.map((mode) => {
        const active = mode.key === activeMode
        return (
          <button
            key={mode.key}
            type="button"
            className={`ha-mode${active ? ' ha-mode--active' : ''}`}
            aria-pressed={active}
            onClick={() => switchView(mode.key)}
          >
            <span className={`ha-icon-tile ha-tone--${mode.key === 'general' ? 'teal' : 'blue'}`}><Glyph name={mode.key === 'general' ? 'hub' : 'person'} size={26} /></span>
            <span className="ha-mode-text">
              <span className="ha-mode-label">{mode.label}</span>
              <span className="ha-mode-desc">{mode.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )

  const composer = (
    <form className="ha-composer" onSubmit={submit}>
      <button
        type="button"
        className="ha-attach"
        onClick={() => setNotice({ title: 'Attachments', body: 'Attachments are not part of this demo. No files are uploaded.' })}
      >
        <Glyph name="clip" />
        <span className="sr-only">Attach a file</span>
      </button>
      <label htmlFor="ha-composer-input" className="sr-only">Ask a supplied demonstration question</label>
      <input
        id="ha-composer-input"
        type="text"
        value={draft}
        autoComplete="off"
        placeholder={view === 'patient' ? 'Ask a question about this patient…' : 'Ask a question about medical knowledge, guidelines, or hospital procedures…'}
        aria-describedby="ha-composer-note"
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="submit" className="ha-send">
        <Glyph name="send" />
        <span className="sr-only">Send</span>
      </button>
      <p id="ha-composer-note" className="ha-composer-note">
        <Glyph name="info" size={14} />
        Only supplied demonstration questions return answers, each shown with its listed sources. {ASSISTANT_PAGE.disclaimer}
      </p>
    </form>
  )

  const exchanges = view === 'landing' ? [] : exchangesFor(view)
  const railSources = view === 'patient'
    ? (findExchange(selectedId ?? PATIENT_RAIL_EXCHANGE_ID)?.citations ?? []).map((id) => findSource(id, 'patient')).filter((source): source is AssistantSource => source !== null)
    : sourcesFor('general')
  const railHeading = view === 'patient' ? findExchange(selectedId ?? PATIENT_RAIL_EXCHANGE_ID)?.prompt ?? null : null

  return (
    <div className={`ha-page ha-page--${view}`}>
      <p className="sr-only" role="status">{announcement}</p>

      <header className="ha-card ha-hero">
        <Glyph name="sparkles" size={64} className="ha-hero-spark" />
        <div className="ha-hero-text">
          <h1>{ASSISTANT_PAGE.heading}</h1>
          <p>{ASSISTANT_PAGE.supporting}</p>
        </div>
        {view === 'landing' && <img className="ha-hero-art" src={heroNurse} alt="" width={246} height={137} />}
        {view === 'patient' && (
          <section className="ha-patient" aria-label="Selected synthetic patient">
            <img className="ha-patient-portrait" src={sitiPortrait} alt="" width={62} height={62} />
            <div>
              <h2>{ASSISTANT_PATIENT.name}</h2>
              <p>
                <span>ID: {ASSISTANT_PATIENT.patientId}</span>
                <span>{ASSISTANT_PATIENT.age}</span>
                <span>{ASSISTANT_PATIENT.gender}</span>
              </p>
            </div>
            <span className="ha-status">{ASSISTANT_PATIENT.status}</span>
            <button
              type="button"
              className="ha-secondary"
              onClick={() => setNotice({ title: 'Change Patient', body: 'Only one synthetic patient fixture is supplied for this demo. Siti Aisyah stays selected.' })}
            >
              Change Patient
            </button>
          </section>
        )}
        {view !== 'landing' && modeSwitch}
      </header>

      {view === 'landing' ? (
        <div className="ha-layout">
          <div className="ha-main">
            {modeSwitch}

            <section className="ha-card" aria-labelledby="ha-topics-title">
              <div className="ha-card-head">
                <h2 id="ha-topics-title" className="ha-section-title">Try asking about:</h2>
                <button type="button" className="ha-link" onClick={() => setNotice(NO_MORE)}>View more examples</button>
              </div>
              <ul className="ha-topics">
                {TOPICS.map((topic) => (
                  <li key={topic.title}>
                    <button type="button" className="ha-topic" onClick={() => openExchange(topic.exchangeId, topic.example)}>
                      <span className="ha-round-icon"><Glyph name={GROUP_GLYPHS[topic.title] ?? 'document'} size={18} /></span>
                      <span className="ha-topic-title">{topic.title}</span>
                      <span className="ha-topic-example">“{topic.example}”</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ha-card ha-welcome-card" aria-labelledby="ha-suggested-title">
              <div className="ha-welcome">
                <span className="ha-welcome-spark"><Glyph name="sparkles" size={26} /></span>
                <div className="ha-welcome-bubble">
                  <p>Hello Dr. Ahmad, <span aria-hidden="true">👋</span></p>
                  <p>I'm BUNDA's Healthcare Assistant demo. I can show supplied answers about medical knowledge, clinical guidelines, hospital procedures, and healthcare documentation.</p>
                  <p>You can also switch to Patient Assistant mode to view supplied questions about a specific patient's medical records.</p>
                  <span className="ha-time">10:24 AM</span>
                </div>
              </div>
              <h2 id="ha-suggested-title" className="ha-subtitle">Suggested questions</h2>
              <ul className="ha-suggestions">
                {LANDING_SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion.label}>
                    <button type="button" className="ha-suggestion" onClick={() => openExchange(suggestion.exchangeId, suggestion.label)}>
                      <span className="ha-arrow-tile"><Glyph name="arrow" size={14} /></span>
                      <span className="ha-suggestion-label">{suggestion.label}</span>
                      {!suggestion.exchangeId && <span className="sr-only"> (no supplied answer)</span>}
                      <Glyph name="chevron" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              {composer}
            </section>
          </div>

          <div className="ha-side">
            <section className="ha-card" aria-labelledby="ha-knowledge-title">
              <div className="ha-card-head">
                <h2 id="ha-knowledge-title" className="ha-section-title"><Glyph name="kit" /> Knowledge Sources</h2>
                <button type="button" className="ha-link" onClick={() => setNotice(NO_LIBRARY)}>See all</button>
              </div>
              <ul className="ha-knowledge">
                {KNOWLEDGE_GROUPS.map((group) => (
                  <li key={group.title}>
                    <span className="ha-icon-tile ha-knowledge-icon"><Glyph name={GROUP_GLYPHS[group.title] ?? 'document'} /></span>
                    <span className="ha-knowledge-title">{group.title}</span>
                    <span className="ha-muted">{group.detail}</span>
                    <span className="ha-count" title="Demonstration count">{group.count} sources<span className="sr-only"> (demonstration count)</span></span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ha-card" aria-labelledby="ha-recent-title">
              <div className="ha-card-head">
                <h2 id="ha-recent-title" className="ha-section-title"><span className="ha-head-chat"><Glyph name="chat" size={16} /></span> Recent Conversations</h2>
                <button type="button" className="ha-link" onClick={() => setNotice(NO_HISTORY)}>View all</button>
              </div>
              <ul className="ha-recent">
                {RECENT_CONVERSATIONS.map((item) => (
                  <li key={item.title}>
                    <button type="button" className="ha-recent-item" onClick={() => openExchange(item.exchangeId, item.title)}>
                      <Glyph name="chat" className="ha-recent-icon" />
                      <span className="ha-recent-title">{item.title}</span>
                      <span className="ha-tag">{item.tag}</span>
                      <span className="ha-recent-time">{item.time}</span>
                      <Glyph name="chevron" size={16} className="ha-recent-chevron" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ha-card ha-grounding" aria-labelledby="ha-grounding-title">
              <Glyph name="shield" size={36} />
              <div>
                <h2 id="ha-grounding-title">Reliable &amp; Source-Grounded</h2>
                <p>Demo answers are supplied reference content shown with clear citations for your review.</p>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="ha-layout ha-layout--conversation">
          <section className="ha-card ha-conversation" aria-label={`${view === 'general' ? 'General' : 'Patient'} Assistant demonstration conversation`}>
            <ol className="ha-exchanges">
              {exchanges.map((exchange) => (
                <Exchange
                  key={exchange.id}
                  exchange={exchange}
                  mode={view}
                  selected={exchange.id === selectedId}
                  onSelect={() => setSelectedId(exchange.id)}
                  onCite={(id) => requestAnimationFrame(() => focusSource(id))}
                />
              ))}
            </ol>
            <div className="ha-prompts" role="group" aria-label="Supplied prompts">
              <span className="ha-prompts-label">Supplied prompts:</span>
              {exchanges.map((exchange) => (
                <button key={exchange.id} type="button" className="ha-chip" onClick={() => switchView(view, exchange.id)}>
                  {exchange.prompt}
                </button>
              ))}
            </div>
            {composer}
          </section>
          <SourceRail sources={railSources} heading={railHeading} onOpen={setOpenSource} />
        </div>
      )}

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
      <ReadOnlyDialog
        open={openSource !== null}
        title={openSource ? `${openSource.marker} ${openSource.title}` : ''}
        onClose={() => {
          const id = openSource?.id
          setOpenSource(null)
          if (id) requestAnimationFrame(() => document.getElementById(sourceDomId(id))?.focus())
        }}
      >
        {openSource && (
          <>
            <dl className="ha-source-detail">
              <div><dt>Type</dt><dd>{openSource.kind}</dd></div>
              <div><dt>Date</dt><dd>{openSource.date}</dd></div>
              <div><dt>Author / publisher</dt><dd>{openSource.publisher}</dd></div>
              <div><dt>Summary</dt><dd>{openSource.summary}</dd></div>
            </dl>
            <p className="ha-muted ha-small">Synthetic fixture details. No external document is linked in this demo.</p>
          </>
        )}
      </ReadOnlyDialog>
    </div>
  )
}
