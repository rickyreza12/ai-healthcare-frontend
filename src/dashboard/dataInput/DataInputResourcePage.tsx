import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppointmentInputPage } from './AppointmentInputPage.tsx'
import { DATA_INPUT_BASE, MutationNotes, RecordNotFound, recordPath } from './DataInputParts.tsx'
import { DATA_INPUT_PAGE_SIZE, fieldLabel, fieldValue, queryRecords, recordIdentifier } from './dataInputLogic.ts'
import { listRecords, resourceByKey } from './dataInputRepository.ts'
import { ServerPatientPage } from './ServerPatientPage.tsx'

export function DataInputResourcePage() {
  const { resourceKey } = useParams()
  if (resourceKey === 'appointments') return <AppointmentInputPage />
  if (resourceKey === 'patients') return <ServerPatientPage />
  return <ResourceView key={resourceKey ?? 'missing'} resourceKey={resourceKey} />
}

function ResourceView({ resourceKey }: { resourceKey: string | undefined }) {
  const resource = resourceByKey(resourceKey)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [page, setPage] = useState(1)

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

  const records = listRecords(resource)
  const result = queryRecords(resource, { search, sortKey, page })
  const columnKeys = resource.listFields

  return (
    <div className="di-page">
      <Link to={DATA_INPUT_BASE} className="di-back">← Data Input</Link>

      <header className="di-head">
        <div className="di-heading">
          <h1>{resource.label}</h1>
          <p className="di-sub">
            {records.length.toLocaleString('en-US')} supplied {records.length === 1 ? 'row' : 'rows'} from{' '}
            <code>{resource.source}</code>.
          </p>
        </div>
        <span className="di-chip di-chip--static">Read-only</span>
      </header>

      <p className="di-notice" role="note">
        Rows are read from the approved fixture. Nothing on this page changes the fixture or reaches a server.
      </p>

      <div className="di-toolbar">
        <label className="di-field">
          <span className="di-field-label">Search {resource.label.toLowerCase()}</span>
          <input
            type="search"
            className="di-input"
            value={search}
            placeholder={`Search by ${resource.searchFields.slice(0, 2).join(', ')}`}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </label>
        <label className="di-field">
          <span className="di-field-label">Sort by</span>
          <select
            className="di-select"
            value={sortKey}
            onChange={(event) => {
              setSortKey(event.target.value)
              setPage(1)
            }}
          >
            <option value="">Fixture order</option>
            {resource.sortFields.map((field) => (
              <option key={field.key} value={field.key}>{field.label}</option>
            ))}
          </select>
        </label>
        <p className="di-range" role="status">
          {result.total === 0
            ? 'No records'
            : `Showing ${result.start}\u2013${result.end} of ${result.total.toLocaleString('en-US')} records`}
        </p>
      </div>

      {result.total === 0 ? (
        <div className="di-empty" role="status">
          <p className="di-empty-title">
            {search.trim() ? `No ${resource.label.toLowerCase()} match "${search.trim()}".` : `This fixture supplies no ${resource.label.toLowerCase()}.`}
          </p>
          {search.trim() && (
            <button
              type="button"
              className="di-link-button"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="di-table-wrap">
            <table className="di-table">
              <caption className="sr-only">{resource.label} supplied records</caption>
              <thead>
                <tr>
                  {columnKeys.map((key) => (
                    <th key={key} scope="col">{fieldLabel(resource, key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.records.map((record) => {
                  const identifier = recordIdentifier(resource, record)
                  return (
                    <tr key={identifier}>
                      {columnKeys.map((key, index) =>
                        index === 0 ? (
                          <th key={key} scope="row">
                            <Link to={recordPath(resource.key, identifier)} className="di-row-link">
                              {fieldValue(resource, record, key)}
                            </Link>
                          </th>
                        ) : (
                          <td key={key}>{fieldValue(resource, record, key)}</td>
                        ),
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="di-cards" role="list">
            {result.records.map((record) => {
              const identifier = recordIdentifier(resource, record)
              return (
                <li key={identifier}>
                  <article className="di-card">
                    <h2>
                      <Link to={recordPath(resource.key, identifier)}>
                        {fieldValue(resource, record, columnKeys[0])}
                      </Link>
                    </h2>
                    <dl className="di-card-facts">
                      {columnKeys.slice(1).map((key) => (
                        <div key={key}>
                          <dt>{fieldLabel(resource, key)}</dt>
                          <dd>{fieldValue(resource, record, key)}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                </li>
              )
            })}
          </ul>

          <nav className="di-pagination" aria-label={`${resource.label} pages`}>
            <button
              type="button"
              className="di-page-button"
              disabled={result.page <= 1}
              onClick={() => setPage(result.page - 1)}
            >
              Previous
            </button>
            <span className="di-page-status">Page {result.page} of {result.pageCount}</span>
            <button
              type="button"
              className="di-page-button"
              disabled={result.page >= result.pageCount}
              onClick={() => setPage(result.page + 1)}
            >
              Next
            </button>
            <span className="di-page-size">{DATA_INPUT_PAGE_SIZE} rows per page</span>
          </nav>
        </>
      )}

      <MutationNotes resource={resource} />
    </div>
  )
}
