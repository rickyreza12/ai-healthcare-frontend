import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError, type Appointment } from '../../api.ts'
import { AppointmentFields, type AppointmentOptions } from './AppointmentFields.tsx'
import { DATA_INPUT_BASE, RecordNotFound, resourcePath } from './DataInputParts.tsx'
import {
  appointmentError,
  appointmentFormValues,
  appointmentWhen,
  hasErrors,
  statusLabel,
  validateAppointmentForm,
  type AppointmentFormValues,
  type FormErrors,
} from './appointmentInputLogic.ts'
import './dataInput.css'

type Loaded = {
  appointment: Appointment
  options: AppointmentOptions
}

export function AppointmentInputRecordPage() {
  const { recordId } = useParams()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [rescheduling, setRescheduling] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let live = true
    setLoading(true)
    setError('')
    Promise.all([api.appointments.get(recordId ?? ''), api.appointments.list({ pageSize: 1 })])
      .then(([appointment, page]) => {
        if (!live) return
        setLoaded({
          appointment,
          options: {
            patients: [{ patientId: appointment.patientId, displayName: appointment.patientName }],
            clinicians: page.filterOptions.doctors,
            clinics: page.filterOptions.clinics,
            visitTypes: page.filterOptions.visitTypes,
          },
        })
      })
      .catch((caught: unknown) => {
        if (!live) return
        if (caught instanceof ApiError && caught.status === 404) setMissing(true)
        else setError(appointmentError(caught))
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
  }, [recordId, refresh])

  if (missing) {
    return (
      <RecordNotFound
        title="Appointment not found"
        body="No appointment matches this address. It may have been removed from this server."
        backTo={resourcePath('appointments')}
        backLabel="Back to Appointments"
      />
    )
  }

  if (loading && !loaded) {
    return (
      <div className="di-page">
        <Link to={resourcePath('appointments')} className="di-back">← Appointments</Link>
        <p className="di-note" role="status">Loading appointment…</p>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="di-page">
        <Link to={resourcePath('appointments')} className="di-back">← Appointments</Link>
        <div className="di-alert" role="alert">
          <p>{error || 'The appointment could not be loaded.'}</p>
          <button type="button" className="di-link-button" onClick={() => setRefresh((value) => value + 1)}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { appointment, options } = loaded
  const cancelled = appointment.status === 'cancelled'

  function applyChange(next: Appointment, message: string) {
    setLoaded({ appointment: next, options })
    setSuccess(message)
    setRescheduling(false)
    setCancelling(false)
    setError('')
  }

  return (
    <div className="di-page">
      <Link to={resourcePath('appointments')} className="di-back">← Appointments</Link>

      <header className="di-head">
        <div className="di-heading">
          <h1>{appointment.patientName}</h1>
          <p className="di-sub">
            {appointmentWhen(appointment)} · {appointment.timeZone} · {appointment.appointmentId}
          </p>
        </div>
        <span className="di-chip" data-status={cancelled ? 'out-of-scope' : 'implemented'}>
          {statusLabel(appointment.status)}
        </span>
      </header>

      <p className="di-notice" role="note">
        This appointment is stored by the appointments feature API. Version {appointment.version}
        {' '}guards against overwriting a newer change.
      </p>

      {success && <p className="di-success" role="status">{success}</p>}
      {error && <p className="di-field-error" role="alert">{error}</p>}

      <section className="di-panel" aria-labelledby="di-appointment-facts">
        <h2 id="di-appointment-facts">Appointment</h2>
        <dl className="di-facts">
          <div><dt>Patient</dt><dd>{appointment.patientName} ({appointment.patientId})</dd></div>
          <div><dt>Visit type</dt><dd>{appointment.visitType}</dd></div>
          <div><dt>Clinician</dt><dd>{appointment.clinician}</dd></div>
          <div><dt>Clinic</dt><dd>{appointment.clinic}</dd></div>
          <div><dt>Room</dt><dd>{appointment.room}</dd></div>
          <div><dt>Date</dt><dd>{appointment.date}</dd></div>
          <div><dt>Start</dt><dd>{appointment.startTime}</dd></div>
          <div><dt>End</dt><dd>{appointment.endTime}</dd></div>
          <div><dt>Status</dt><dd>{statusLabel(appointment.status)}</dd></div>
          {appointment.cancellationReason && (
            <div><dt>Cancellation reason</dt><dd>{appointment.cancellationReason}</dd></div>
          )}
          <div><dt>Last updated</dt><dd>{appointment.updatedAt}</dd></div>
        </dl>

        <div className="di-actions">
          <button
            type="button"
            className="di-page-button"
            disabled={cancelled}
            onClick={() => {
              setRescheduling(true)
              setCancelling(false)
              setSuccess('')
            }}
          >
            Reschedule
          </button>
          <button
            type="button"
            className="di-page-button"
            disabled={cancelled}
            onClick={() => {
              setCancelling(true)
              setRescheduling(false)
              setSuccess('')
            }}
          >
            Cancel appointment
          </button>
        </div>
        {cancelled && <p className="di-panel-note">Cancelled appointments stay readable and cannot be rescheduled.</p>}
      </section>

      {rescheduling && (
        <ReschedulePanel
          appointment={appointment}
          options={options}
          onClose={() => setRescheduling(false)}
          onSaved={(next) => applyChange(next, 'Appointment rescheduled.')}
        />
      )}

      {cancelling && (
        <CancelDialog
          appointment={appointment}
          onClose={() => setCancelling(false)}
          onCancelled={(next) => applyChange(next, 'Appointment cancelled. The record is kept.')}
        />
      )}

      <p className="di-panel-note">
        Local fixture context: <code>{DATA_INPUT_BASE}/appointments</code> shows server data. Other
        resources remain local demonstration data.
      </p>
    </div>
  )
}

function ReschedulePanel({
  appointment,
  options,
  onClose,
  onSaved,
}: {
  appointment: Appointment
  options: AppointmentOptions
  onClose: () => void
  onSaved: (next: Appointment) => void
}) {
  const [values, setValues] = useState<AppointmentFormValues>(() => appointmentFormValues(appointment))
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  function change(key: keyof AppointmentFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const found = validateAppointmentForm(values)
    setErrors(found)
    if (hasErrors(found)) return
    setPending(true)
    setMessage('')
    try {
      const next = await api.appointments.reschedule(appointment.appointmentId, {
        version: appointment.version,
        clinician: values.clinician.trim(),
        clinic: values.clinic.trim(),
        visitType: values.visitType.trim(),
        room: values.room.trim(),
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
      })
      onSaved(next)
    } catch (caught) {
      setMessage(appointmentError(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="di-panel" aria-labelledby="di-reschedule-heading">
      <h2 id="di-reschedule-heading">Reschedule appointment</h2>
      <p className="di-panel-lead">
        Only the schedule details change. The patient stays the same and the server rechecks conflicts.
      </p>
      <form onSubmit={submit} noValidate>
        <AppointmentFields
          idPrefix="di-reschedule"
          values={values}
          errors={errors}
          options={options}
          disabled={pending}
          lockPatient
          onChange={change}
        />
        {message && <p className="di-field-error" role="alert">{message}</p>}
        <div className="di-actions">
          <button type="button" className="di-page-button" onClick={onClose} disabled={pending}>Close</button>
          <button type="submit" className="di-page-button di-page-button--primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}

function CancelDialog({
  appointment,
  onClose,
  onCancelled,
}: {
  appointment: Appointment
  onClose: () => void
  onCancelled: (next: Appointment) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (reason.trim().length < 3) {
      setMessage('Give a cancellation reason of at least 3 characters.')
      return
    }
    setPending(true)
    setMessage('')
    try {
      const next = await api.appointments.cancel(appointment.appointmentId, appointment.version, reason.trim())
      onCancelled(next)
    } catch (caught) {
      setMessage(appointmentError(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <dialog ref={dialog} className="di-dialog" aria-labelledby="di-cancel-appointment" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2 id="di-cancel-appointment">Cancel appointment</h2>
        <p className="di-panel-lead">
          {appointment.patientName}, {appointmentWhen(appointment)}. The appointment stays in the
          record and its slot becomes free.
        </p>
        <div className="di-field di-field--wide">
          <label className="di-field-label" htmlFor="di-cancel-reason">Cancellation reason</label>
          <textarea
            id="di-cancel-reason"
            className="di-input di-textarea"
            value={reason}
            rows={3}
            disabled={pending}
            aria-describedby={message ? 'di-cancel-error' : undefined}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        {message && <p className="di-field-error" id="di-cancel-error" role="alert">{message}</p>}
        <div className="di-actions">
          <button type="button" className="di-page-button" onClick={() => dialog.current?.close()} disabled={pending}>
            Keep appointment
          </button>
          <button type="submit" className="di-page-button di-page-button--primary" disabled={pending}>
            {pending ? 'Cancelling…' : 'Cancel appointment'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
