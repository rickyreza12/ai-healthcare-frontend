import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import { ReadOnlyDialog } from '../ReadOnlyDialog.tsx'
import { MaternityOverviewCards, MATERNITY_ART, type MaternityHandlers } from './MaternityOverviewCards.tsx'
import { MaternityTabPanel } from './MaternityClinicalTabs.tsx'
import { MATERNITY_GLYPHS } from './maternityGlyphs.tsx'
import {
  DOCTOR_NOTE,
  LATEST_ULTRASOUND,
  MATERNITY_BREADCRUMB,
  MATERNITY_PATIENT,
  MATERNITY_TAB_KEYS,
  NEXT_APPOINTMENT,
  type PrenatalChecklistItem,
} from './maternityData.ts'
import { maternityTabHref, parseMaternityTab, unavailableNotice } from './maternityLogic.ts'

import bannerScene from '../../assets/dashboard/maternity/maternity_banner_care_scene.png'
import patientAvatar from '../../assets/dashboard/maternity/maternity_avatar_siti_nurhaliza.png'

const APPOINTMENT_DATE = `${NEXT_APPOINTMENT.day}, ${NEXT_APPOINTMENT.date} ${NEXT_APPOINTMENT.month}`

export function MaternityOverviewPage() {
  const [searchParams] = useSearchParams()
  const activeTab = parseMaternityTab(searchParams.get('tab'))
  const tabsRef = useRef<HTMLUListElement>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const [checklistItem, setChecklistItem] = useState<PrenatalChecklistItem | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)

  const handlers: MaternityHandlers = {
    onUnavailable: (title, body) => setNotice({ title, body: body ?? unavailableNotice(title).body }),
    onOpenAppointment: () => setAppointmentOpen(true),
    onOpenChecklistItem: setChecklistItem,
    onOpenUltrasound: () => setViewerOpen(true),
    onOpenNotes: () => setNotesOpen(true),
  }

  // Keep the selected tab visible when the strip overflows; never scroll the page.
  useEffect(() => {
    const strip = tabsRef.current
    const active = strip?.querySelector<HTMLElement>('.db-mat-tab--active')
    if (!strip || !active) return
    strip.scrollLeft = Math.max(0, active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2)
  }, [activeTab])

  return (
    <div className="db-mat">
      <nav className="db-mat-crumb" aria-label="Breadcrumb">
        <ol>
          <li>{MATERNITY_BREADCRUMB[0]}</li>
          <li aria-current="page">{MATERNITY_BREADCRUMB[1]}</li>
        </ol>
      </nav>

      <section className="db-mat-banner" aria-labelledby="mat-patient">
        <img src={patientAvatar} alt="" width={92} height={92} className="db-mat-avatar" />
        <div className="db-mat-identity">
          <div className="db-mat-name-row">
            <h1 id="mat-patient" className="db-mat-name">{MATERNITY_PATIENT.name}</h1>
            <p className="db-mat-ongoing">
              <span aria-hidden="true">{MATERNITY_GLYPHS.heartPulse}</span>
              {MATERNITY_PATIENT.status}
            </p>
          </div>
          <p className="db-mat-summary">
            {MATERNITY_PATIENT.summary.map((part) => <span key={part}>{part}</span>)}
          </p>
          <p className="db-mat-ids">
            ID: {MATERNITY_PATIENT.id}
            <span aria-hidden="true">|</span>
            {MATERNITY_PATIENT.gravida}
            <span aria-hidden="true">|</span>
            {MATERNITY_PATIENT.gestationalAge}
          </p>
          <div className="db-mat-actions">
            <button
              type="button"
              className="db-mat-action"
              onClick={() => setNotice({
                title: 'Call',
                body: 'This reference demo has no calling feature. No contact details are supplied for this patient fixture.',
              })}
            >
              <span aria-hidden="true">{MATERNITY_GLYPHS.phone}</span>
              Call
            </button>
            <button
              type="button"
              className="db-mat-action"
              onClick={() => setNotice({
                title: 'Message',
                body: 'This reference demo has no messaging feature. No conversation history is supplied for this patient fixture.',
              })}
            >
              <span aria-hidden="true">{MATERNITY_GLYPHS.chat}</span>
              Message
            </button>
            <button
              type="button"
              className="db-mat-action"
              onClick={() => setNotice(unavailableNotice('More patient actions'))}
            >
              More
              <span aria-hidden="true">{MATERNITY_GLYPHS.chevronDown}</span>
            </button>
          </div>
        </div>
        <img src={bannerScene} alt="" width={600} height={284} className="db-mat-banner-art" />
      </section>

      <ul className="db-mat-tabs" role="list" ref={tabsRef}>
        {MATERNITY_TAB_KEYS.map((tab) => {
          const active = tab.key === activeTab
          return (
            <li key={tab.key}>
              <Link
                to={maternityTabHref(tab.key)}
                className={`db-mat-tab${active ? ' db-mat-tab--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {activeTab === 'overview'
        ? <MaternityOverviewCards handlers={handlers} />
        : <MaternityTabPanel
            tab={activeTab}
            onOpenChecklistItem={setChecklistItem}
            onOpenAppointment={handlers.onOpenAppointment}
            onOpenUltrasound={handlers.onOpenUltrasound}
          />}

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />

      <ReadOnlyDialog open={appointmentOpen} title="Appointment details" onClose={() => setAppointmentOpen(false)}>
        <dl className="db-dialog-facts">
          <div><dt>Date</dt><dd>{APPOINTMENT_DATE}</dd></div>
          <div><dt>Time</dt><dd>{NEXT_APPOINTMENT.time}</dd></div>
          <div><dt>Type</dt><dd>{NEXT_APPOINTMENT.type}</dd></div>
          <div><dt>Gestational age</dt><dd>{NEXT_APPOINTMENT.gestationalAge}</dd></div>
          <div><dt>Clinician</dt><dd>{NEXT_APPOINTMENT.clinician}</dd></div>
          <div><dt>Location</dt><dd>{NEXT_APPOINTMENT.location}, {NEXT_APPOINTMENT.room}</dd></div>
        </dl>
        <p className="db-readonly-note">
          Read-only reference fixture. Rescheduling, cancelling, and creating appointments are not part of this demo.
        </p>
      </ReadOnlyDialog>

      <ReadOnlyDialog
        open={checklistItem !== null}
        title={checklistItem?.label ?? 'Checklist item'}
        onClose={() => setChecklistItem(null)}
      >
        {checklistItem && (
          <dl className="db-dialog-facts">
            <div><dt>Status</dt><dd>{checklistItem.status}</dd></div>
            <div><dt>Date</dt><dd>{checklistItem.date}</dd></div>
          </dl>
        )}
        <p className="db-readonly-note">
          Read-only reference fixture. Checklist items cannot be completed, edited, or rescheduled in this demo.
        </p>
      </ReadOnlyDialog>

      <ReadOnlyDialog
        open={viewerOpen}
        title={`Ultrasound · ${LATEST_ULTRASOUND.takenOn}`}
        onClose={() => setViewerOpen(false)}
      >
        <img
          src={MATERNITY_ART.ultrasound}
          alt={`Ultrasound scan from ${LATEST_ULTRASOUND.takenOn} at 32 weeks 4 days`}
          width={364}
          height={175}
          className="db-mat-viewer-image"
        />
        <p className="db-readonly-note">{LATEST_ULTRASOUND.caption.join(' ')}</p>
      </ReadOnlyDialog>

      <ReadOnlyDialog open={notesOpen} title="Doctor's notes" onClose={() => setNotesOpen(false)}>
        <div className="db-mat-note-person">
          <img src={MATERNITY_ART.doctorAvatar} alt="" width={44} height={44} className="db-mat-note-avatar" />
          <span className="db-mat-note-who">
            <strong>{DOCTOR_NOTE.clinician}</strong>
            <span>{DOCTOR_NOTE.recorded} • {DOCTOR_NOTE.time}</span>
          </span>
        </div>
        <p className="db-mat-note-body">{DOCTOR_NOTE.body}</p>
        <p className="db-readonly-note">One reference note is available. No other maternity notes are part of this fixture.</p>
      </ReadOnlyDialog>
    </div>
  )
}
