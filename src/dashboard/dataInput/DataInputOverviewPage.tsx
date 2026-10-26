import { Link } from 'react-router-dom'
import {
  DATA_INPUT_COPY,
  RESOURCE_REGISTRY,
  UNREGISTERED_FIXTURES,
  isMutable,
} from './dataInputRegistry.ts'
import { resourcePath, StatusChip } from './DataInputParts.tsx'
import './dataInput.css'

export function DataInputOverviewPage() {
  const mutableCount = RESOURCE_REGISTRY.filter(isMutable).length
  const recordCount = RESOURCE_REGISTRY.filter((resource) => !resource.serverBacked).reduce(
    (total, resource) => total + resource.records.length,
    0,
  )

  return (
    <div className="di-page">
      <header className="di-head">
        <div className="di-heading">
          <h1>{DATA_INPUT_COPY.heading}</h1>
          <p className="di-sub">{DATA_INPUT_COPY.supporting}</p>
        </div>
        <span className="di-chip di-chip--static">Server-backed + fixtures</span>
      </header>

      <p className="di-notice" role="note">{DATA_INPUT_COPY.localOnly}</p>

      <section aria-labelledby="di-registered">
        <div className="di-section-head">
          <h2 id="di-registered">Registered resources</h2>
          <p className="di-section-count">
            {RESOURCE_REGISTRY.length} resources · {recordCount.toLocaleString('en-US')} local rows ·{' '}
            {mutableCount} accepting edits
          </p>
        </div>
        <p className="di-note">{DATA_INPUT_COPY.countNote}</p>

        <ul className="di-resources" role="list">
          {RESOURCE_REGISTRY.map((resource) => (
            <li key={resource.key}>
              <article className="di-resource" aria-labelledby={`di-resource-${resource.key}`}>
                <div className="di-resource-head">
                  <h3 id={`di-resource-${resource.key}`}>
                    <Link to={resourcePath(resource.key)}>{resource.label}</Link>
                  </h3>
                  <span className="di-count-badge">
                    {resource.serverBacked ? 'Server API' : `${resource.records.length.toLocaleString('en-US')} rows`}
                  </span>
                </div>
                <p className="di-resource-meta">{resource.workspace}</p>
                <ul className="di-ops" role="list">
                  {(['read', 'create', 'update', 'delete'] as const).map((operation) => (
                    <li key={operation} className="di-op">
                      <span className="di-op-name" aria-hidden="true">{operation}</span>
                      <span className="sr-only">{operation} operation: </span>
                      <StatusChip operation={resource.operations[operation]} />
                    </li>
                  ))}
                </ul>
                <p className="di-reason">{resource.readOnlyReason}</p>
                <Link to={resourcePath(resource.key)} className="di-resource-link">
                  View records<span aria-hidden="true"> →</span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="di-panel" aria-labelledby="di-blocked">
        <h2 id="di-blocked">{DATA_INPUT_COPY.blockedHeading}</h2>
        <p className="di-panel-lead">{DATA_INPUT_COPY.blockedLead}</p>
        <ul className="di-bullets" role="list">
          {DATA_INPUT_COPY.blockedPoints.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <p className="di-panel-note">{DATA_INPUT_COPY.nextStep}</p>
      </section>

      <details className="di-panel di-details">
        <summary>Fixture collections reviewed but not registered ({UNREGISTERED_FIXTURES.length})</summary>
        <ul className="di-unregistered" role="list">
          {UNREGISTERED_FIXTURES.map((entry) => (
            <li key={entry.resource}>
              <p className="di-unregistered-name">
                {entry.resource} <span className="di-chip" data-status={entry.decision}>{entry.decision}</span>
              </p>
              <p className="di-unregistered-reason">{entry.reason}</p>
              <code>{entry.source}</code>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
