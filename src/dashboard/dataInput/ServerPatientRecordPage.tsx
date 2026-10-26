import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError, type PatientDetail } from '../../api.ts'
import { RecordNotFound, resourcePath } from './DataInputParts.tsx'
import './dataInput.css'

export function ServerPatientRecordPage() {
  const { recordId } = useParams()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    setLoading(true)
    api.patients
      .get(recordId ?? '')
      .then((detail) => {
        if (live) setPatient(detail)
      })
      .catch((caught: unknown) => {
        if (!live) return
        if (caught instanceof ApiError && caught.status === 404) setMissing(true)
        else setError(caught instanceof ApiError ? caught.message : 'The patient could not be loaded.')
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
  }, [recordId])

  if (missing) {
    return (
      <RecordNotFound
        title="Patient not found"
        body="No patient matches this identifier."
        backTo={resourcePath('patients')}
        backLabel="Back to Patients"
      />
    )
  }

  return (
    <div className="di-page">
      <Link to={resourcePath('patients')} className="di-back">← Patients</Link>

      {loading && !patient && <p className="di-note" role="status">Loading patient…</p>}
      {error && <p className="di-field-error" role="alert">{error}</p>}

      {patient && (
        <>
          <header className="di-head">
            <div className="di-heading">
              <h1>{patient.displayName}</h1>
              <p className="di-sub">
                {patient.patientId} · {patient.unit} · {patient.room}
              </p>
            </div>
            <span className="di-chip" data-status="implemented">Server-backed</span>
          </header>

          <p className="di-notice" role="note">
            Read-only patient identity. No edit, merge, archive, or delete operation is available.
          </p>

          <section className="di-panel" aria-labelledby="di-patient-facts">
            <h2 id="di-patient-facts">Patient</h2>
            <dl className="di-facts">
              <div><dt>Patient ID</dt><dd>{patient.patientId}</dd></div>
              <div><dt>Medical record number</dt><dd>{patient.patientNumber ?? 'Not assigned'}</dd></div>
              <div><dt>Age</dt><dd>{patient.age}</dd></div>
              <div><dt>Gender</dt><dd>{patient.gender}</dd></div>
              <div><dt>Unit</dt><dd>{patient.unit}</dd></div>
              <div><dt>Room</dt><dd>{patient.room}</dd></div>
              <div><dt>Last visit</dt><dd>{patient.lastVisit}</dd></div>
              <div><dt>Status</dt><dd>{patient.status}</dd></div>
              <div><dt>Doctor</dt><dd>{patient.doctor.displayName} ({patient.doctor.specialty})</dd></div>
              <div><dt>Version</dt><dd>{patient.version}</dd></div>
            </dl>
          </section>
        </>
      )}
    </div>
  )
}
