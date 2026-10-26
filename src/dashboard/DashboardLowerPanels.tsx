import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RECENT_PATIENTS,
  TODAYS_APPOINTMENTS,
  slugify,
  type Appointment,
  type RecentPatient,
} from './dashboardData.ts'
import { AVATARS } from './dashboardAssets.ts'
import { PanelHeader, PANEL_GLYPH, StatusBadge, TypeBadge } from './DashboardPrimitives.tsx'
import { QuickViewDialog, type QuickView } from './DashboardQuickView.tsx'

function PatientRow({ patient, onSelect }: { patient: RecentPatient; onSelect: () => void }) {
  return (
    <tr>
      <td>
        <button type="button" className="db-row-button" aria-label={`Quick view ${patient.name}`} onClick={onSelect}>
          <img src={AVATARS[patient.avatar]} alt="" width={34} height={34} className="db-avatar" />
          <span className="db-patient-names">
            <strong>{patient.name}</strong>
            <span className="db-patient-id">{patient.id}</span>
          </span>
        </button>
      </td>
      <td><TypeBadge category={patient.category} /></td>
      <td className="db-table-reason">{patient.reason}</td>
      <td className="db-table-time">{patient.time}</td>
      <td><StatusBadge status={patient.status} /></td>
    </tr>
  )
}

export function RecentPatientsPanel({ patients = RECENT_PATIENTS }: { patients?: readonly RecentPatient[] }) {
  const [selected, setSelected] = useState<QuickView | null>(null)

  return (
    <section className="db-panel db-patients" aria-labelledby="db-patients-title">
      <PanelHeader
        id="db-patients-title"
        title="Recent Patients"
        icon={PANEL_GLYPH.patients}
        action={<Link to="/dashboard/patients" className="db-panel-link">View All</Link>}
      />
      <div className="db-table-wrap">
        <table className="db-table">
          <caption className="sr-only">Most recent patients with type, reason for visit, time, and status</caption>
          <thead>
            <tr>
              <th scope="col">Patient</th>
              <th scope="col">Type</th>
              <th scope="col">Reason for Visit</th>
              <th scope="col">Time</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onSelect={() => setSelected({ kind: 'patient', record: patient })}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ul className="db-patient-cards" role="list">
        {patients.map((patient) => (
          <li key={patient.id} className="db-patient-card">
            <div className="db-patient-card-row">
              <button
                type="button"
                className="db-row-button"
                aria-label={`Quick view ${patient.name}`}
                onClick={() => setSelected({ kind: 'patient', record: patient })}
              >
                <img src={AVATARS[patient.avatar]} alt="" width={38} height={38} className="db-avatar" />
                <span className="db-patient-names">
                  <strong>{patient.name}</strong>
                  <span className="db-patient-id">{patient.id}</span>
                </span>
              </button>
              <StatusBadge status={patient.status} />
            </div>
            <dl className="db-patient-card-facts">
              <div><dt>Type</dt><dd><TypeBadge category={patient.category} /></dd></div>
              <div><dt>Reason</dt><dd>{patient.reason}</dd></div>
              <div><dt>Time</dt><dd>{patient.time}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      <QuickViewDialog view={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

export function AppointmentsPanel({ appointments = TODAYS_APPOINTMENTS }: { appointments?: readonly Appointment[] }) {
  const [selected, setSelected] = useState<QuickView | null>(null)

  return (
    <section className="db-panel db-appointments" aria-labelledby="db-appointments-title">
      <PanelHeader
        id="db-appointments-title"
        title="Today's Appointments"
        icon={PANEL_GLYPH.calendar}
        action={<Link to="/dashboard/appointments" className="db-panel-link">View All</Link>}
      />
      <ol className="db-timeline" role="list">
        {appointments.map((appointment, index) => (
          <li key={`${appointment.time}-${index}`} className={`db-timeline-item db-timeline-item--${slugify(appointment.status)}`}>
            <span className="db-timeline-time">{appointment.time}</span>
            <span className="db-timeline-marker" aria-hidden="true" />
            <button
              type="button"
              className="db-timeline-body db-row-button"
              aria-label={`Quick view ${appointment.time} appointment for ${appointment.name}`}
              onClick={() => setSelected({ kind: 'appointment', record: appointment })}
            >
              <img src={AVATARS[appointment.avatar]} alt="" width={30} height={30} className="db-avatar" />
              <span className="db-timeline-text">
                <strong>{appointment.name}</strong>
                <span className="db-timeline-visit">{appointment.visit}</span>
              </span>
            </button>
            <StatusBadge status={appointment.status} />
          </li>
        ))}
      </ol>
      <QuickViewDialog view={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
