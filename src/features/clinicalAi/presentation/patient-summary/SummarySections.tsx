import type { AiSummary } from '../../domain/patientSummary.ts'
import { resolveSource } from '../../domain/patientSummary.ts'
import type { CitationDetail } from '../SourceDialog.tsx'

type Props = { summary: AiSummary; onSource: (detail: CitationDetail) => void }

export function SummaryOverview({ summary, onSource }: Props) {
  return <div className="clinical-grid">
    <article className="clinical-card clinical-main-card">
      <h2>{summary.heading}</h2>
      <p>{summary.body}</p>
      <p className="clinical-muted">{summary.sourceNote}</p>
      <h3>Source-based clinical context</h3>
      <dl className="clinical-context">{summary.contextCards.map(card =>
        <div key={card.label}><dt>{card.label}</dt><dd>{card.value}</dd><small>{card.detail}</small></div>)}</dl>
      <h3>Recorded clinical claims</h3>
      {summary.claims.length === 0 ? <p>No source-backed claims are available.</p> :
        <ul className="clinical-claims">{summary.claims.map(claim =>
          <li key={claim.claimId}>
            <strong>{claim.title}</strong><p>{claim.description}</p>
            <div className="clinical-citations">{claim.sourceIds.map(id => {
              const source = resolveSource(summary.sources, id)
              return source ? <button type="button" key={id} onClick={() => onSource({
                title: source.title, subtitle: `${source.kind.toUpperCase()} · ${source.recordedOn}`,
                description: `CAS source ${source.sourceId}`, fields: source.fields,
              })}>View source {id}</button> : null
            })}</div>
          </li>)}</ul>}
      <h3>SOAP notes</h3>
      {summary.soapNotes.length ? <dl className="clinical-facts">{summary.soapNotes.map(note =>
        <div key={note.initial}><dt>{note.initial} · {note.label}</dt><dd>{note.body}</dd></div>)}</dl> :
        <p className="clinical-muted">No SOAP notes were supplied by this source.</p>}
    </article>
    <aside className="clinical-card">
      <h2>Clinical timeline</h2>
      {summary.timeline.length ? <ol className="clinical-timeline">{summary.timeline.map((entry, index) => {
        const source = resolveSource(summary.sources, entry.sourceId)
        return <li key={`${entry.sourceId}-${index}`}>
          <time>{entry.occurredOn}</time><strong>{entry.title}</strong><p>{entry.note}</p>
          {source && <button type="button" onClick={() => onSource({ title: source.title,
            subtitle: source.recordedOn, description: entry.note, fields: source.fields })}>Source details</button>}
        </li>
      })}</ol> : <p>No dated visits in the source.</p>}
      <h3>Alerts</h3>
      {summary.alerts.length ? summary.alerts.map(alert => <p key={alert.title}>{alert.title}: {alert.description}</p>) :
        <p className="clinical-muted">No source-supported alert rules were activated.</p>}
    </aside>
  </div>
}

export function SummaryEvidence({ summary, onSource }: Props) {
  return <article className="clinical-card">
    <h2>Sources &amp; Evidence</h2>
    <p className="clinical-muted">{summary.sourceCount} source record(s). Each citation opens the associated stored evidence.</p>
    <ul className="clinical-evidence">{summary.sources.map(source => <li key={source.sourceId}>
      <div><strong>{source.title}</strong><p>{source.recordedOn} · {source.kind.toUpperCase()}</p>
        <small>{source.sourceId}</small></div>
      <button type="button" onClick={() => onSource({ title: source.title, subtitle: source.recordedOn,
        description: source.sourceId, fields: source.fields })}>Read source</button>
    </li>)}</ul>
    {!summary.sources.length && <p>No sources were provided.</p>}
  </article>
}

export function SummaryQuality({ summary }: { summary: AiSummary }) {
  const quality = summary.dataQuality
  return <div className="clinical-grid">
    <article className="clinical-card">
      <h2>Data quality &amp; reliability</h2>
      <p><strong>{quality.reliability.status}</strong> · {quality.reliability.label}</p>
      <p className="clinical-muted">{quality.reliability.copy}</p>
      <h3>Data availability</h3>
      <dl className="clinical-facts">{quality.domains.map(domain => <div key={domain.domainId}>
        <dt>{domain.label}</dt><dd>{domain.status}</dd>
      </div>)}</dl>
    </article>
    <aside className="clinical-card">
      <h2>Missing and conflicting data</h2>
      {quality.issues.length ? <ul className="clinical-issues">{quality.issues.map(issue =>
        <li key={issue.issueId}><strong>{issue.issue}</strong><p>{issue.detail}</p><small>{issue.impact} impact</small></li>)}</ul> :
        <p>No documented gaps were returned by the source.</p>}
    </aside>
  </div>
}
