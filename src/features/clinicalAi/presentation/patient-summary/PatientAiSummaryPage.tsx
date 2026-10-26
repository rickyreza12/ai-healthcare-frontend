import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { clinicalAiHttpRepository as repository } from '../../infrastructure/clinicalAiApi.ts'
import { usePatientSummary } from './usePatientSummary.ts'
import { SourceDialog, type CitationDetail } from '../SourceDialog.tsx'
import { SummaryOverview, SummaryEvidence, SummaryQuality } from './SummarySections.tsx'
import '../clinicalAi.css'

const sections = [
  { key: 'summary', label: 'Summary' },
  { key: 'evidence', label: 'Sources & Evidence' },
  { key: 'data-quality', label: 'Data Quality' },
] as const

function exportSummary(content: object, patientId: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `clinical-summary-${patientId}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function PatientAiSummaryPage() {
  const { patientId = '' } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const selected = sections.find(section => section.key === params.get('section'))?.key ?? 'summary'
  const { summary, state, action, error, announcement, load, ingest, refresh, review, cancel } = usePatientSummary(patientId)
  const [source, setSource] = useState<CitationDetail | null>(null)
  const [sourcePatients, setSourcePatients] = useState<string[]>([])
  const [sourceError, setSourceError] = useState('')
  const [lookupId, setLookupId] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    repository.sourcePatients(controller.signal).then(setSourcePatients).catch(reason => {
      if (!controller.signal.aborted) setSourceError(reason instanceof Error ? reason.message : 'Source unavailable.')
    })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const animation = gsap.matchMedia()
    animation.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.clinical-header', { y: 10, autoAlpha: 0, duration: 0.3, ease: 'power1.out' })
    })
    return () => animation.revert()
  }, [])

  const busy = action !== 'idle'
  return <div className="clinical-page">
    <header className="clinical-header">
      <div>
        <Link to="/dashboard/patients" className="clinical-back">Patients</Link>
        <p className="clinical-overline">Clinical intelligence / Patient summary</p>
        <h1>Patient AI Summary</h1>
        <p className="clinical-muted">CAS patient ID: <strong>{patientId}</strong></p>
        <p className="clinical-muted">Only explicitly ingested source records are shown. Legacy identifiers are never merged.</p>
      </div>
      <div className="clinical-header-actions">
        {summary && <>
          <button type="button" disabled={busy} onClick={() => void refresh()}>Refresh summary</button>
          <button type="button" disabled={busy} onClick={() => void review(!summary.review.reviewed)}>
            {summary.review.reviewed ? 'Clear review' : 'Mark reviewed'}
          </button>
          <button type="button" onClick={() => exportSummary(summary, patientId)}>Export JSON</button>
          <Link className="clinical-link-button" to={`/dashboard/healthcare-assistant?patientId=${encodeURIComponent(summary.patientContextId)}`}>
            Ask about this patient
          </Link>
        </>}
        {busy && <button type="button" onClick={cancel}>Cancel</button>}
      </div>
    </header>

    <section className="clinical-card clinical-picker" aria-label="Synthetic patient source selection">
      <div><h2>Clinical source records</h2><p className="clinical-muted">Choose an explicit CAS identity. Existing directory IDs are kept separate.</p></div>
      <form onSubmit={event => {
        event.preventDefault()
        if (lookupId.trim()) navigate(`/dashboard/patients/${encodeURIComponent(lookupId.trim())}?tab=ai-summary`)
      }}>
        <input value={lookupId} onChange={event => setLookupId(event.target.value)} list="cas-source-patients"
          placeholder="SYN-BUNDA-P..." aria-label="CAS patient identifier" />
        <datalist id="cas-source-patients">{sourcePatients.map(id => <option key={id} value={id} />)}</datalist>
        <button type="submit" disabled={!lookupId.trim()}>Open source ID</button>
      </form>
      {sourceError && <p className="clinical-muted" role="status">CAS list unavailable: {sourceError}</p>}
    </section>

    {summary && <nav className="clinical-tabs" aria-label="Summary sections">
      {sections.map(section => <Link key={section.key}
        to={`/dashboard/patients/${encodeURIComponent(patientId)}?tab=ai-summary&section=${section.key}`}
        className={section.key === selected ? 'clinical-tab clinical-tab-active' : 'clinical-tab'}
        aria-current={section.key === selected ? 'page' : undefined}>{section.label}</Link>)}
    </nav>}

    <div role="status" aria-live="polite" className="clinical-announcement">{announcement}</div>
    {error && <div role="alert" className="clinical-error">{error} <button type="button" disabled={busy} onClick={() => void load()}>Reload</button></div>}
    {busy && <p role="status" className="clinical-pending">{action === 'ingesting' ? 'Importing source records…' :
      action === 'refreshing' ? 'Generating source-cited summary…' : 'Saving review…'}</p>}

    {state === 'loading' && <section className="clinical-card" aria-busy="true"><h2>Loading summary</h2><p>Retrieving a source-backed patient summary…</p></section>}
    {state === 'missing' && <section className="clinical-card clinical-empty">
      <h2>No summary found for this exact patient ID</h2>
      <p>CAS ingestion must finish before a summary can be generated. The source may not contain this patient identifier.</p>
      <button type="button" disabled={busy} onClick={() => void ingest()}>Ingest this CAS patient</button>
    </section>}
    {state === 'error' && <section className="clinical-card" role="alert"><h2>Summary unavailable</h2>
      <p>Check the BUNDA backend connection or your permissions.</p>
      <button type="button" onClick={() => void load()}>Try again</button>
    </section>}
    {state === 'ready' && summary && <>
      <div className="clinical-status-row"><span>Version {summary.dataVersion}</span>
        <span>{summary.status === 'ready' ? 'Summary ready' : summary.status}</span>
        <span>{summary.review.reviewed ? 'Reviewed' : 'Awaiting clinical review'}</span>
        <span>{summary.sourceCount} cited source(s)</span></div>
      {selected === 'summary' && <SummaryOverview summary={summary} onSource={setSource} />}
      {selected === 'evidence' && <SummaryEvidence summary={summary} onSource={setSource} />}
      {selected === 'data-quality' && <SummaryQuality summary={summary} />}
    </>}
    <SourceDialog source={source} onClose={() => setSource(null)} />
  </div>
}
