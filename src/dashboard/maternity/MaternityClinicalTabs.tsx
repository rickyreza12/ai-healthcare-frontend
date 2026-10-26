import { useState } from 'react'
import { ReadOnlyDialog } from '../ReadOnlyDialog.tsx'
import { slugify } from '../dashboardData.ts'
import { CHECKLIST_ICONS, MATERNITY_GLYPHS } from './maternityGlyphs.tsx'
import {
  DOCTOR_NOTE,
  LATEST_ULTRASOUND,
  MATERNITY_DOCUMENTS,
  MATERNITY_EDUCATION,
  MATERNITY_EDUCATION_DISCLAIMER,
  MATERNITY_MEDICAL_RECORDS,
  MATERNITY_VISIT_HISTORY,
  NEXT_APPOINTMENT,
  PRENATAL_CHECKLIST,
  type MaternityDocument,
  type MaternityEducationResource,
  type MaternityTabKey,
  type PrenatalChecklistItem,
} from './maternityData.ts'
import { checklistCounts, filterChecklist } from './maternityLogic.ts'

import ultrasound from '../../assets/dashboard/maternity/maternity_ultrasound_32w4d.png'

const APPOINTMENT_DATE = `${NEXT_APPOINTMENT.day}, ${NEXT_APPOINTMENT.date} ${NEXT_APPOINTMENT.month}`
const CHECKLIST_FILTERS = ['All', 'Completed', 'Due Soon', 'Pending'] as const

type ChecklistFilter = (typeof CHECKLIST_FILTERS)[number]

function PanelHead({ id, title, support }: { id: string; title: string; support: string }) {
  return (
    <div className="db-mat-panel-head">
      <span className="db-mat-panel-icon" aria-hidden="true">{MATERNITY_GLYPHS.document}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{support}</p>
      </div>
    </div>
  )
}

function SyntheticNotice() {
  return <p className="db-mat-notice" role="note">Synthetic demo data. Not live or clinically validated.</p>
}

function MedicalRecordsPanel({ onOpenUltrasound }: { onOpenUltrasound: () => void }) {
  return (
    <section className="db-mat-panel" aria-labelledby="mat-records-title">
      <PanelHead id="mat-records-title" title="Medical Records" support="Synthetic maternity records supplied for this patient." />
      <SyntheticNotice />
      <ul className="db-mat-record-list" role="list">
        {MATERNITY_MEDICAL_RECORDS.map((record) => (
          <li key={record.id}>
            <details className="db-mat-record">
              <summary>
                <span className="db-mat-record-icon" aria-hidden="true">{MATERNITY_GLYPHS.document}</span>
                <span className="db-mat-record-main">
                  <strong>{record.title}</strong>
                  <span>{record.type} • {record.clinician}</span>
                </span>
                <span className="db-mat-record-date">{record.date}</span>
                <span className="db-mat-status db-mat-status--completed">{record.status}</span>
                <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
              </summary>
              <div className="db-mat-record-body">
                <p>{record.summary}</p>
                <dl className="db-mat-facts">
                  {record.detail.map((fact) => (
                    <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
                  ))}
                </dl>
                {record.type === 'Ultrasound' && (
                  <button type="button" className="db-mat-btn db-mat-btn--ghost" onClick={onOpenUltrasound}>
                    View ultrasound
                  </button>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AppointmentsPanel({ onOpenAppointment }: { onOpenAppointment: () => void }) {
  const [segment, setSegment] = useState<'upcoming' | 'history'>('upcoming')

  return (
    <section className="db-mat-panel" aria-labelledby="mat-appointments-title">
      <PanelHead id="mat-appointments-title" title="Appointments" support="Upcoming care and supplied visit history for this patient." />
      <SyntheticNotice />
      <div className="db-mat-segments" role="group" aria-label="Appointment segments">
        <button type="button" className="db-mat-segment" aria-pressed={segment === 'upcoming'} onClick={() => setSegment('upcoming')}>Upcoming</button>
        <button type="button" className="db-mat-segment" aria-pressed={segment === 'history'} onClick={() => setSegment('history')}>Visit history</button>
      </div>

      {segment === 'upcoming' ? (
        <ul className="db-mat-record-list" role="list">
          <li>
            <button type="button" className="db-mat-record-row" onClick={onOpenAppointment}>
              <span className="db-mat-record-icon" aria-hidden="true">{MATERNITY_GLYPHS.clock}</span>
              <span className="db-mat-record-main">
                <strong>{NEXT_APPOINTMENT.type}</strong>
                <span>{NEXT_APPOINTMENT.clinician} • {NEXT_APPOINTMENT.location}, {NEXT_APPOINTMENT.room}</span>
              </span>
              <span className="db-mat-record-date">{APPOINTMENT_DATE} • {NEXT_APPOINTMENT.time}</span>
              <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
            </button>
          </li>
        </ul>
      ) : (
        <ul className="db-mat-record-list" role="list">
          {MATERNITY_VISIT_HISTORY.map((visit) => (
            <li key={visit.id}>
              <details className="db-mat-record">
                <summary>
                  <span className="db-mat-record-icon" aria-hidden="true">{MATERNITY_GLYPHS.clock}</span>
                  <span className="db-mat-record-main">
                    <strong>{visit.title}</strong>
                    <span>{visit.clinician}</span>
                  </span>
                  <span className="db-mat-record-date">{visit.date}</span>
                  <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
                </summary>
                <div className="db-mat-record-body">
                  <p>{visit.summary}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
      <p className="db-mat-panel-note">Read-only demo. Scheduling and visit editing are not part of this fixture.</p>
    </section>
  )
}

function ChecklistsPanel({ onOpenChecklistItem }: { onOpenChecklistItem: (item: PrenatalChecklistItem) => void }) {
  const [filter, setFilter] = useState<ChecklistFilter>('All')
  const counts = checklistCounts(PRENATAL_CHECKLIST)
  const visible = filterChecklist(PRENATAL_CHECKLIST, filter)

  return (
    <section className="db-mat-panel" aria-labelledby="mat-checklists-title">
      <PanelHead id="mat-checklists-title" title="Checklists" support="Prenatal checklist items supplied for this pregnancy." />
      <SyntheticNotice />
      <div className="db-mat-segments" role="group" aria-label="Filter checklist items by status">
        {CHECKLIST_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className="db-mat-segment"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {status} ({status === 'All' ? PRENATAL_CHECKLIST.length : counts[status]})
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="db-mat-empty">
          <p>No checklist items match this filter.</p>
          <button type="button" className="db-mat-link" onClick={() => setFilter('All')}>Show all items</button>
        </div>
      ) : (
        <ul className="db-mat-checklist db-mat-checklist--panel" role="list">
          {visible.map((item) => (
            <li key={item.id}>
              <button type="button" className="db-mat-check-row" onClick={() => onOpenChecklistItem(item)}>
                <span className={`db-mat-check-icon db-mat-check-icon--${slugify(item.status)}`} aria-hidden="true">
                  {CHECKLIST_ICONS[item.status]}
                </span>
                <span className="db-mat-check-label">{item.label}</span>
                <span className={`db-mat-status db-mat-status--${slugify(item.status)}`}>{item.status}</span>
                <span className="db-mat-check-date">{item.date}</span>
                <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="db-mat-panel-note">Read-only reference fixture. Items cannot be completed, edited, or rescheduled in this demo.</p>
    </section>
  )
}

function EducationPanel() {
  const [resource, setResource] = useState<MaternityEducationResource | null>(null)

  return (
    <section className="db-mat-panel" aria-labelledby="mat-education-title">
      <PanelHead id="mat-education-title" title="Education" support="Synthetic maternity education previews for this demo." />
      <SyntheticNotice />
      <ul className="db-mat-record-list" role="list">
        {MATERNITY_EDUCATION.map((item) => (
          <li key={item.id}>
            <button type="button" className="db-mat-record-row" onClick={() => setResource(item)}>
              <span className="db-mat-record-icon" aria-hidden="true">{MATERNITY_GLYPHS.document}</span>
              <span className="db-mat-record-main">
                <strong>{item.title}</strong>
                <span>{item.category}</span>
              </span>
              <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
            </button>
          </li>
        ))}
      </ul>
      <ReadOnlyDialog open={resource !== null} title={resource?.title ?? 'Education'} onClose={() => setResource(null)}>
        {resource && <p className="db-mat-dialog-copy">{resource.summary}</p>}
        <p className="db-mat-disclaimer">{MATERNITY_EDUCATION_DISCLAIMER}</p>
      </ReadOnlyDialog>
      <p className="db-mat-panel-note">{MATERNITY_EDUCATION_DISCLAIMER}</p>
    </section>
  )
}

function DocumentsPanel() {
  const [document, setDocument] = useState<MaternityDocument | null>(null)

  return (
    <section className="db-mat-panel" aria-labelledby="mat-documents-title">
      <PanelHead id="mat-documents-title" title="Documents" support="Document metadata supplied for this patient." />
      <SyntheticNotice />
      <ul className="db-mat-record-list" role="list">
        {MATERNITY_DOCUMENTS.map((item) => (
          <li key={item.id}>
            <button type="button" className="db-mat-record-row" onClick={() => setDocument(item)}>
              <span className="db-mat-record-icon" aria-hidden="true">{MATERNITY_GLYPHS.document}</span>
              <span className="db-mat-record-main">
                <strong>{item.title}</strong>
                <span>{item.kind} • {item.date}</span>
              </span>
              <span className="db-mat-availability">{item.availability}</span>
              <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
            </button>
          </li>
        ))}
      </ul>
      <ReadOnlyDialog open={document !== null} title={document?.title ?? 'Document'} onClose={() => setDocument(null)}>
        {document && (
          <dl className="db-dialog-facts">
            <div><dt>Kind</dt><dd>{document.kind}</dd></div>
            <div><dt>Date</dt><dd>{document.date}</dd></div>
            <div><dt>Availability</dt><dd>{document.availability}</dd></div>
          </dl>
        )}
        {document?.id === 'document-ultrasound-summary-2026-10-20' && (
          <img src={ultrasound} alt={`Ultrasound scan from ${LATEST_ULTRASOUND.takenOn} at 32 weeks 4 days`} width={364} height={175} className="db-mat-viewer-image" />
        )}
        {document?.id === 'document-prenatal-visit-note-2026-10-20' && <p className="db-mat-dialog-copy">{DOCTOR_NOTE.body}</p>}
        <p className="db-readonly-note">Metadata only. No document file is supplied in this demo.</p>
      </ReadOnlyDialog>
    </section>
  )
}

export function MaternityTabPanel({ tab, onOpenChecklistItem, onOpenAppointment, onOpenUltrasound }: {
  tab: MaternityTabKey
  onOpenChecklistItem: (item: PrenatalChecklistItem) => void
  onOpenAppointment: () => void
  onOpenUltrasound: () => void
}) {
  if (tab === 'medical-records') return <MedicalRecordsPanel onOpenUltrasound={onOpenUltrasound} />
  if (tab === 'appointments') return <AppointmentsPanel onOpenAppointment={onOpenAppointment} />
  if (tab === 'checklists') return <ChecklistsPanel onOpenChecklistItem={onOpenChecklistItem} />
  if (tab === 'education') return <EducationPanel />
  if (tab === 'documents') return <DocumentsPanel />
  return null
}
