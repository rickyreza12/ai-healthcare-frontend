import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Appointment, RecentPatient } from './dashboardData.ts'
import { appointmentKey } from './dashboardLogic.ts'
import { AVATARS } from './dashboardAssets.ts'
import { StatusBadge, TypeBadge } from './DashboardPrimitives.tsx'

export type QuickView =
  | { kind: 'patient'; record: RecentPatient }
  | { kind: 'appointment'; record: Appointment }

function patientHref(record: RecentPatient): string {
  return `/dashboard/patients/${encodeURIComponent(record.id)}`
}

/** Native modal quick view; closes on Escape, backdrop press, the close control, or navigation. */
export function QuickViewDialog({ view, onClose }: { view: QuickView | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const factsId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (view && !dialog.open) dialog.showModal()
    if (!view && dialog.open) dialog.close()
  }, [view])

  useEffect(() => {
    if (!view) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [view])

  return (
    <dialog
      ref={dialogRef}
      className="db-dialog"
      aria-labelledby={titleId}
      aria-describedby={factsId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {view && (
        <div className="db-dialog-body">
          <button type="button" className="db-dialog-close" onClick={onClose}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close quick view</span>
          </button>
          <p className="db-dialog-kicker">{view.kind === 'patient' ? 'Patient quick view' : 'Appointment quick view'}</p>
          <div className="db-dialog-person">
            <img src={AVATARS[view.record.avatar]} alt="" width={48} height={48} className="db-avatar" />
            <div className="db-dialog-identity">
              <h2 id={titleId}>{view.record.name}</h2>
              <p className="db-dialog-sub">{view.kind === 'patient' ? view.record.id : `Appointment at ${view.record.time}`}</p>
            </div>
            <StatusBadge status={view.record.status} />
          </div>
          <dl className="db-dialog-facts" id={factsId}>
            {view.kind === 'patient' ? (
              <>
                <div><dt>Type</dt><dd><TypeBadge category={view.record.category} /></dd></div>
                <div><dt>Reason for visit</dt><dd>{view.record.reason}</dd></div>
                <div><dt>Visit time</dt><dd>{view.record.time}</dd></div>
                <div><dt>Status</dt><dd>{view.record.status}</dd></div>
              </>
            ) : (
              <>
                <div><dt>Time</dt><dd>{view.record.time}</dd></div>
                <div><dt>Visit type</dt><dd>{view.record.visit}</dd></div>
                <div><dt>Status</dt><dd>{view.record.status}</dd></div>
              </>
            )}
          </dl>
          <div className="db-dialog-actions">
            <button type="button" className="db-dialog-secondary" onClick={onClose}>Close</button>
            <Link
              to={view.kind === 'patient' ? patientHref(view.record) : `/dashboard/appointments/${appointmentKey(view.record)}`}
              className="db-back-link db-dialog-primary"
              onClick={onClose}
            >
              {view.kind === 'patient' ? 'View Patient Details' : 'View Appointment Details'}
            </Link>
          </div>
        </div>
      )}
    </dialog>
  )
}
