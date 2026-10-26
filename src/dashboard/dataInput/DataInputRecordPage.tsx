import { Link, useParams } from 'react-router-dom'
import { AppointmentInputRecordPage } from './AppointmentInputRecordPage.tsx'
import { DATA_INPUT_BASE, MutationNotes, RecordNotFound, resourcePath } from './DataInputParts.tsx'
import { fieldLabel, fieldValue, recordIdentifier } from './dataInputLogic.ts'
import { getRecord, resourceByKey } from './dataInputRepository.ts'
import { ServerPatientRecordPage } from './ServerPatientRecordPage.tsx'

export function DataInputRecordPage() {
  const { resourceKey, recordId } = useParams()
  if (resourceKey === 'appointments') return <AppointmentInputRecordPage />
  if (resourceKey === 'patients') return <ServerPatientRecordPage />
  const resource = resourceByKey(resourceKey)

  if (!resource) {
    return (
      <RecordNotFound
        title="Resource not found"
        body="This Data Input resource is not registered. Only registered fixture collections are available."
        backTo={DATA_INPUT_BASE}
        backLabel="Back to Data Input"
      />
    )
  }

  const record = getRecord(resource, recordId ?? '')
  if (!record) {
    return (
      <RecordNotFound
        title="Record not found"
        body={`No ${resource.singular} matches this address. The supplied fixture may not contain it.`}
        backTo={resourcePath(resource.key)}
        backLabel={`Back to ${resource.label}`}
      />
    )
  }

  const identifier = recordIdentifier(resource, record)

  return (
    <div className="di-page">
      <Link to={resourcePath(resource.key)} className="di-back">← {resource.label}</Link>

      <header className="di-head">
        <div className="di-heading">
          <h1>{fieldValue(resource, record, resource.displayField)}</h1>
          <p className="di-sub">
            {fieldLabel(resource, resource.identifierField)}: {identifier} · {resource.workspace}
          </p>
        </div>
        <span className="di-chip di-chip--static">Read-only</span>
      </header>

      <p className="di-notice" role="note">
        This record is read directly from the approved fixture. No edit, save, or delete is available.
      </p>

      <section className="di-panel" aria-labelledby="di-record-fields">
        <h2 id="di-record-fields">Record details</h2>
        <dl className="di-facts">
          {resource.fields.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{fieldValue(resource, record, field.key)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <MutationNotes resource={resource} />
    </div>
  )
}
