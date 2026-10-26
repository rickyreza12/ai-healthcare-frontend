import { Link } from 'react-router-dom'
import type { ResourceDefinition, ResourceOperation } from './dataInputRegistry.ts'
import { operationLabel } from './dataInputLogic.ts'

export const DATA_INPUT_BASE = '/dashboard/data-input'

export function resourcePath(key: string): string {
  return `${DATA_INPUT_BASE}/${key}`
}

export function recordPath(resourceKey: string, recordId: string): string {
  return `${DATA_INPUT_BASE}/${resourceKey}/${encodeURIComponent(recordId)}`
}

export function StatusChip({ operation }: { operation: ResourceOperation }) {
  return (
    <span className="di-chip" data-status={operation.status}>
      {operationLabel(operation.status)}
    </span>
  )
}

const MUTATIONS = [
  ['Create', 'create'],
  ['Update', 'update'],
  ['Delete', 'delete'],
] as const

export function MutationNotes({ resource }: { resource: ResourceDefinition }) {
  const headingId = `di-mutations-${resource.key}`
  return (
    <section className="di-panel" aria-labelledby={headingId}>
      <h2 id={headingId}>Data entry is unavailable</h2>
      <p className="di-panel-lead">{resource.readOnlyReason}</p>
      <dl className="di-evidence">
        {MUTATIONS.map(([label, operation]) => (
          <div key={operation}>
            <dt>{label}</dt>
            <dd>
              <StatusChip operation={resource.operations[operation]} />
              <span>{resource.operations[operation].evidence}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="di-panel-note">
        Read source: <code>{resource.source}</code>.{' '}
        {resource.apiSpec
          ? <>Generated contract: <code>{resource.apiSpec}</code>.</>
          : 'No generated API specification covers this resource.'}
      </p>
    </section>
  )
}

export function RecordNotFound({
  title,
  body,
  backTo,
  backLabel,
}: {
  title: string
  body: string
  backTo: string
  backLabel: string
}) {
  return (
    <div className="di-page">
      <div className="di-notfound">
        <h1>{title}</h1>
        <p>{body}</p>
        <Link to={backTo} className="di-link-button">{backLabel}</Link>
      </div>
    </div>
  )
}
