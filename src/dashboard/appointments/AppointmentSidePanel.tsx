import { useId } from 'react'
import { AVATARS } from '../dashboardAssets.ts'
import type { AvatarKey } from '../dashboardData.ts'
import type { AppointmentDetail, ScheduleAppointment, UpcomingAppointment } from './appointmentScheduleData.ts'
import { appointmentRange, dayDateLabel } from './appointmentScheduleLogic.ts'

const CHEVRON_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
)

const PENCIL_GLYPH = (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M13.5 5.5 18.5 10.5" />
  </svg>
)

/** Existing portraits are reused only where the identity matches; every other name uses initials. */
export function ScheduleAvatar({ name, avatar, size }: { name: string; avatar: AvatarKey | null; size: number }) {
  if (avatar) {
    return <img src={AVATARS[avatar]} alt="" width={size} height={size} className="db-avatar" />
  }
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="db-avatar db-avatar--initials"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

export function UpcomingPanel({ rows, selectedId, onSelect, onViewAll }: {
  rows: readonly UpcomingAppointment[]
  selectedId: string | null
  onSelect: (id: string) => void
  onViewAll: () => void
}) {
  const titleId = useId()
  return (
    <section className="db-sched-panel" aria-labelledby={titleId}>
      <div className="db-sched-panel-head">
        <h2 id={titleId}>Upcoming Appointments</h2>
        <button type="button" className="db-sched-link" onClick={onViewAll}>View All</button>
      </div>
      {rows.length === 0 ? (
        <p className="db-sched-empty">No upcoming appointments match these filters.</p>
      ) : (
        <ul className="db-sched-upcoming" role="list">
          {rows.map((row) => (
            <li key={row.scheduleId}>
              <button
                type="button"
                className={`db-sched-upcoming-row${selectedId === row.scheduleId ? ' db-sched-upcoming-row--selected' : ''}`}
                aria-pressed={selectedId === row.scheduleId}
                aria-label={`Open appointment for ${row.patient} at ${row.time}`}
                onClick={() => onSelect(row.scheduleId)}
              >
                <span className="db-sched-upcoming-time">{row.time}</span>
                <ScheduleAvatar name={row.patient} avatar={row.avatar} size={38} />
                <span className="db-sched-upcoming-text">
                  <strong>{row.patient}</strong>
                  <span>{row.visit}</span>
                  <span>{row.room}</span>
                </span>
                <span className="db-sched-chip">{row.relative}</span>
                <span className="db-sched-chevron" aria-hidden="true">{CHEVRON_GLYPH}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function PatientDetailPanel({ appointment, detail, onEdit, onReschedule, onViewProfile }: {
  appointment: ScheduleAppointment | undefined
  detail: AppointmentDetail
  onEdit: () => void
  onReschedule: () => void
  onViewProfile: () => void
}) {
  const titleId = useId()
  const extended = appointment && appointment.id === detail.scheduleId ? detail : undefined

  return (
    <section className="db-sched-panel" aria-labelledby={titleId}>
      <div className="db-sched-panel-head">
        <h2 id={titleId}>Patient Details</h2>
        <button type="button" className="db-sched-link" onClick={onEdit}>
          {PENCIL_GLYPH} Edit
        </button>
      </div>

      {!appointment ? (
        <p className="db-sched-empty">Select an appointment to view its details.</p>
      ) : extended ? (
        <>
          <div className="db-sched-patient">
            <ScheduleAvatar name={extended.name} avatar={null} size={72} />
            <div className="db-sched-patient-id">
              <h3>{extended.name}</h3>
              <p className="db-sched-tags">
                {extended.tags.map((tag) => <span key={tag} className="db-sched-tag">{tag}</span>)}
              </p>
              <p className="db-sched-summary">{extended.summary}</p>
            </div>
          </div>

          <dl className="db-sched-facts">
            {extended.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}{fact.unit && <small>{fact.unit}</small>}</dd>
              </div>
            ))}
          </dl>

          <dl className="db-sched-rows">
            {extended.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <>
          <div className="db-sched-patient">
            <ScheduleAvatar name={appointment.patient} avatar={appointment.avatar} size={72} />
            <div className="db-sched-patient-id">
              <h3>{appointment.patient}</h3>
              <p className="db-sched-summary">{dayDateLabel(appointment.day)}</p>
            </div>
          </div>

          <dl className="db-sched-rows">
            <div><dt>Time</dt><dd>{appointmentRange(appointment)}</dd></div>
            <div><dt>Appointment</dt><dd>{appointment.visit}</dd></div>
            <div><dt>Location</dt><dd>{appointment.room} - {appointment.clinic}</dd></div>
            <div><dt>Clinician</dt><dd>{appointment.doctor}</dd></div>
          </dl>

          <p className="db-sched-note">Extended patient details are not included in this reference fixture.</p>
        </>
      )}

      {appointment && (
        <div className="db-sched-actions">
          <button type="button" className="db-sched-secondary" onClick={onReschedule}>Reschedule</button>
          <button type="button" className="db-btn-primary db-sched-primary" onClick={onViewProfile}>View Full Profile</button>
        </div>
      )}
    </section>
  )
}
