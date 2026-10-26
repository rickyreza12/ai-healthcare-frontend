import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, type Appointment, type AppointmentPage, type Patient } from '../../api.ts'
import { AppointmentFields, type AppointmentOptions } from './AppointmentFields.tsx'
import { DATA_INPUT_BASE, recordPath } from './DataInputParts.tsx'
import {
  appointmentError,
  appointmentWhen,
  emptyAppointmentForm,
  hasErrors,
  statusLabel,
  toCreateInput,
  validateAppointmentForm,
  type AppointmentFormValues,
  type FormErrors,
} from './appointmentInputLogic.ts'
import './dataInput.css'

const PAGE_SIZE = 8

export function AppointmentInputPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<AppointmentPage | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api.appointments.list({ page, pageSize: PAGE_SIZE }))
    } catch (caught) {
      setError(appointmentError(caught))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load, refresh])

  useEffect(() => {
    let live = true
    api.patients
      .list({ pageSize: 100 })
      .then((directory) => {
        if (live) setPatients(directory.items)
      })
      .catch(() => {
        // The list still renders; the form explains that no patient can be chosen.
      })
    return () => {
      live = false
    }
  }, [])

  const options: AppointmentOptions = {
    patients,
    clinicians: data?.filterOptions.doctors ?? [],
    clinics: data?.filterOptions.clinics ?? [],
    visitTypes: data?.filterOptions.visitTypes ?? [],
  }

  return (
    <div className="di-page">
      <Link to={DATA_INPUT_BASE} className="di-back">â† Data Input</Link>

      <header className="di-head">
        <div className="di-heading">
          <h1>Appointments</h1>
          <p className="di-sub">
            Scheduled appointments stored by the appointments feature API. Times are clinic-local
            ({data?.timeZone ?? 'Asia/Jakarta'}).
          </p>
        </div>
        <span className="di-chip" data-status="implemented">Server-backed</span>
      </header>

      <p className="di-notice" role="note">
        Creating, rescheduling, and cancelling here writes to the server. Every change is recorded in
        the audit trail. Cancelling keeps the appointment and marks it cancelled.
      </p>

      <div className="di-toolbar">
        <button type="button" className="di-page-button" onClick={() => setCreating(true)}>
          New appointment
        </button>
        <p className="di-range" role="status">
          {data
            ? data.total === 0
              ? 'No appointments'
              : `Showing ${(data.page - 1) * data.pageSize + 1}\u2013${Math.min(data.page * data.pageSize, data.total)} of ${data.total} appointments`
            : loading
              ? 'Loading appointmentsâ€¦'
              : ''}
        </p>
      </div>

      {error && (
        <div className="di-alert" role="alert">
          <p>{error}</p>
          <button type="button" className="di-link-button" onClick={() => setRefresh((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {loading && !data && <p className="di-note" role="status">Loading appointmentsâ€¦</p>}

      {!loading && !error && data && data.total === 0 && (
        <div className="di-empty" role="status">
          <p className="di-empty-title">No appointments are scheduled yet.</p>
          <p className="di-note">Use New appointment to book the first one.</p>
        </div>
      )}

      {data && data.total > 0 && (
        <>
          <div className="di-table-wrap di-table-wrap--always">
            <table className="di-table">
              <caption className="sr-only">Appointments stored on the server</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Visit</th>
                  <th scope="col">Clinician</th>
                  <th scope="col">Clinic</th>
                  <th scope="col">Room</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <th scope="row">
                      <Link to={recordPath('appointments', appointment.appointmentId)} className="di-row-link">
                        {appointmentWhen(appointment)}
                      </Link>
                    </th>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.visitType}</td>
                    <td>{appointment.clinician}</td>
                    <td>{appointment.clinic}</td>
                    <td>{appointment.room}</td>
                    <td>
                      <span className="di-chip" data-status={appointment.status === 'cancelled' ? 'out-of-scope' : 'implemented'}>
                        {statusLabel(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="di-pagination" aria-label="Appointment pages">
            <button
              type="button"
              className="di-page-button"
              disabled={data.page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <span className="di-page-status">
              Page {data.page} of {Math.max(1, data.totalPages)}
            </span>
            <button
              type="button"
              className="di-page-button"
              disabled={data.page >= data.totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
            <span className="di-page-size">{PAGE_SIZE} appointments per page</span>
          </nav>
        </>
      )}

      {creating && (
        <CreateAppointmentDialog
          options={options}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            setPage(1)
            setRefresh((value) => value + 1)
          }}
        />
      )}
    </div>
  )
}

function CreateAppointmentDialog({
  options,
  onClose,
  onCreated,
}: {
  options: AppointmentOptions
  onClose: () => void
  onCreated: (appointment: Appointment) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const idempotencyKey = useRef<string | null>(null)
  const [values, setValues] = useState<AppointmentFormValues>(emptyAppointmentForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  function change(key: keyof AppointmentFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    idempotencyKey.current = null
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const found = validateAppointmentForm(values)
    setErrors(found)
    if (hasErrors(found)) return
    setPending(true)
    setMessage('')
    idempotencyKey.current ??= crypto.randomUUID()
    try {
      const created = await api.appointments.create(toCreateInput(values), idempotencyKey.current)
      onCreated(created)
    } catch (caught) {
      setMessage(appointmentError(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <dialog ref={dialog} className="di-dialog" aria-labelledby="di-create-appointment" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2 id="di-create-appointment">New appointment</h2>
        <p className="di-panel-lead">
          The server checks patient, clinician, room, and time conflicts before saving.
        </p>

        <AppointmentFields
          idPrefix="di-create"
          values={values}
          errors={errors}
          options={options}
          disabled={pending}
          onChange={change}
        />

        {message && <p className="di-field-error" role="alert">{message}</p>}

        <div className="di-actions">
          <button type="button" className="di-page-button" onClick={() => dialog.current?.close()} disabled={pending}>
            Cancel
          </button>
          <button type="submit" className="di-page-button di-page-button--primary" disabled={pending}>
            {pending ? 'Savingâ€¦' : 'Create appointment'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

