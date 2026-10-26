import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RECENT_PATIENTS, TODAYS_APPOINTMENTS } from './dashboardData.ts'
import { findAppointment, findPatient } from './dashboardLogic.ts'
import { AVATARS } from './dashboardAssets.ts'
import { StatusBadge } from './DashboardPrimitives.tsx'

function DetailShell({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="db-detail">
      <p className="db-detail-kicker">{kicker}</p>
      {children}
    </div>
  )
}

function NotFound({ message, backTo, backLabel }: { message: string; backTo: string; backLabel: string }) {
  return (
    <section className="db-feature-empty" aria-label="Record not found">
      <p className="db-feature-empty-title">Record not found</p>
      <p className="db-feature-empty-text">{message}</p>
      <div className="db-detail-actions">
        <Link to={backTo} className="db-back-link">{backLabel}</Link>
        <Link to="/dashboard" className="db-panel-link">Back to Dashboard</Link>
      </div>
    </section>
  )
}

export function AppointmentDetailPage() {
  const params = useParams()
  const record = params.appointmentKey ? findAppointment(TODAYS_APPOINTMENTS, params.appointmentKey) : undefined

  if (!record) {
    return (
      <DetailShell kicker="Appointment record">
        <h1>Appointment</h1>
        <NotFound
          message={`No appointment matches ${params.appointmentKey ?? 'this address'}.`}
          backTo="/dashboard/appointments"
          backLabel="All Appointments"
        />
      </DetailShell>
    )
  }

  const patient = findPatient(RECENT_PATIENTS, record.patientId)

  return (
    <DetailShell kicker="Appointment record">
      <div className="db-detail-head">
        <img src={AVATARS[record.avatar]} alt="" width={64} height={64} className="db-avatar" />
        <div className="db-detail-identity">
          <h1>{record.name}</h1>
          <p className="db-detail-sub">Appointment at {record.time}</p>
        </div>
        <StatusBadge status={record.status} />
      </div>
      <dl className="db-detail-facts">
        <div><dt>Time</dt><dd>{record.time}</dd></div>
        <div><dt>Visit type</dt><dd>{record.visit}</dd></div>
        <div><dt>Status</dt><dd>{record.status}</dd></div>
      </dl>
      <div className="db-detail-actions">
        <Link to="/dashboard" className="db-back-link">Back to Dashboard</Link>
        <Link to="/dashboard/appointments" className="db-panel-link">All Appointments</Link>
        {patient && <Link to={`/dashboard/patients/${encodeURIComponent(patient.id)}`} className="db-panel-link">View Patient</Link>}
      </div>
    </DetailShell>
  )
}
