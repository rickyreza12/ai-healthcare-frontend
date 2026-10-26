import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError, type PatientPage } from '../../api.ts'
import { DATA_INPUT_BASE, recordPath } from './DataInputParts.tsx'
import './dataInput.css'

const PAGE_SIZE = 8

export function ServerPatientPage() {
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PatientPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api.patients.list({ q: appliedQuery || undefined, page, pageSize: PAGE_SIZE }))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The patient directory could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [appliedQuery, page])

  useEffect(() => {
    void load()
  }, [load])

  function search(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setAppliedQuery(query.trim())
  }

  return (
    <div className="di-page">
      <Link to={DATA_INPUT_BASE} className="di-back">â† Data Input</Link>

      <header className="di-head">
        <div className="di-heading">
          <h1>Patients</h1>
          <p className="di-sub">Canonical patient identity from the patients feature API.</p>
        </div>
        <span className="di-chip" data-status="implemented">Server-backed</span>
      </header>

      <p className="di-notice" role="note">
        Reads only. Patient creation, editing, merging, and deletion are not available in Version 02.
        The medical record number stays empty until the conflicting fixture values are approved.
      </p>

      <form className="di-toolbar" onSubmit={search} role="search">
        <label className="di-field">
          <span className="di-field-label">Search patients</span>
          <input
            type="search"
            className="di-input"
            value={query}
            placeholder="Name or patient ID"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button type="submit" className="di-page-button">Search</button>
        <p className="di-range" role="status">
          {data
            ? data.total === 0
              ? 'No patients'
              : `Showing ${(data.page - 1) * data.pageSize + 1}\u2013${Math.min(data.page * data.pageSize, data.total)} of ${data.total} patients`
            : ''}
        </p>
      </form>

      {error && (
        <div className="di-alert" role="alert">
          <p>{error}</p>
          <button type="button" className="di-link-button" onClick={() => void load()}>Try again</button>
        </div>
      )}

      {!loading && !error && data && data.total === 0 && (
        <div className="di-empty" role="status">
          <p className="di-empty-title">No patients match â€œ{appliedQuery}â€.</p>
        </div>
      )}

      {data && data.total > 0 && (
        <>
          <div className="di-table-wrap di-table-wrap--always">
            <table className="di-table">
              <caption className="sr-only">Patients stored on the server</caption>
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">Patient ID</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Room</th>
                  <th scope="col">Last visit</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((patient) => (
                  <tr key={patient.patientId}>
                    <th scope="row">
                      <Link to={recordPath('patients', patient.patientId)} className="di-row-link">
                        {patient.displayName}
                      </Link>
                    </th>
                    <td>{patient.patientId}</td>
                    <td>{patient.unit}</td>
                    <td>{patient.room}</td>
                    <td>{patient.lastVisit}</td>
                    <td>{patient.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="di-pagination" aria-label="Patient pages">
            <button
              type="button"
              className="di-page-button"
              disabled={data.page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <span className="di-page-status">Page {data.page} of {Math.max(1, data.totalPages)}</span>
            <button
              type="button"
              className="di-page-button"
              disabled={data.page >= data.totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
            <span className="di-page-size">{PAGE_SIZE} patients per page</span>
          </nav>
        </>
      )}
    </div>
  )
}

