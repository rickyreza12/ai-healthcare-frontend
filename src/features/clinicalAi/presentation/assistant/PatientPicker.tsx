import { useEffect, useId, useRef, useState } from 'react'
import { api, type Patient } from '../../../../api.ts'
import { PatientAvatar } from '../../../../dashboard/patients/PatientDirectoryPage.tsx'

export function PatientPicker({ open, currentId, onSelect, onClose }: {
  open: boolean
  currentId: string | null
  onSelect: (patient: Patient) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Patient[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const abort = new AbortController()
    setState('loading')
    const timer = setTimeout(() => {
      api.patients.list({ q: query.trim() || undefined, pageSize: 20 }).then((page) => {
        if (!abort.signal.aborted) { setItems(page.items); setState('ready') }
      }).catch(() => {
        if (!abort.signal.aborted) setState('error')
      })
    }, query ? 250 : 0)
    return () => { abort.abort(); clearTimeout(timer) }
  }, [open, query])

  return (
    <dialog ref={dialog} className="db-dialog ha-picker" aria-labelledby={titleId} onClose={onClose}
      onClick={(event) => { if (event.target === dialog.current) onClose() }}>
      <div className="db-dialog-body ha-picker-body">
        <button type="button" className="db-dialog-close" onClick={onClose}>
          <span aria-hidden="true">×</span><span className="sr-only">Close</span>
        </button>
        <h2 id={titleId}>Select patient</h2>
        <p className="db-dialog-sub">Patient questions use only the selected patient's records.</p>
        <label className="sr-only" htmlFor="ha-picker-search">Search patients</label>
        <input id="ha-picker-search" className="ha-picker-search" type="search" value={query} autoComplete="off"
          placeholder="Search by name, patient ID or phone" onChange={event => setQuery(event.target.value)} />
        <div className="ha-picker-list" aria-live="polite">
          {state === 'loading' && <p className="ha-muted">Loading patients…</p>}
          {state === 'error' && <p role="alert">Patients could not be loaded. Try again.</p>}
          {state === 'ready' && items.length === 0 && <p className="ha-muted">No patients match your search.</p>}
          {state === 'ready' && <ul>{items.map(patient => (
            <li key={patient.patientId}>
              <button type="button" className={`ha-picker-item${patient.patientId === currentId ? ' ha-picker-item--active' : ''}`}
                aria-current={patient.patientId === currentId ? 'true' : undefined} onClick={() => onSelect(patient)}>
                <PatientAvatar src={patient.avatarUrl} name={patient.displayName} size={44} />
                <span className="ha-picker-text">
                  <strong>{patient.displayName}</strong>
                  <span className="ha-muted">{patient.patientNumber} · {patient.age} years · {patient.gender}</span>
                </span>
                <span className="ha-status">{patient.status.replace('_', ' ')}</span>
              </button>
            </li>
          ))}</ul>}
        </div>
      </div>
    </dialog>
  )
}
