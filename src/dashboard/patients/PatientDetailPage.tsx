import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, ApiError, type PatientDetail as ApiPatientDetail } from '../../api.ts'
import { PatientAvatar } from './PatientDirectoryPage.tsx'
import { QUICK_ACTION_LABELS, SUMMARY_SECTIONS, DETAIL_TABS, type Claim, type DataDomain, type EvidenceRecord, type Overview, type OverviewTab, type QualityMetricTone, type SourceId } from './patientDetailData.ts'
import { buildIdentity, buildOverview, buildSummaryView, statusLabel, type SummaryView } from './patientDetailView.ts'
import { usePatientSummary } from '../../features/clinicalAi/presentation/patient-summary/usePatientSummary.ts'
import {
  ALL_SOURCES,
  availabilitySplit,
  detailHref,
  domainStatusLabel,
  domainStatusTone,
  evidenceForClaim,
  filterClaims,
  filterEvidenceBySource,
  parseDetailTab,
  parseSummarySection,
  resolveActiveClaim,
  reviewedLabel,
  sectionHref,
  type DomainTone,
} from './patientDetailLogic.ts'

type IconName =
  | 'home'
  | 'chevron'
  | 'id'
  | 'calendar'
  | 'phone'
  | 'location'
  | 'emergency'
  | 'pencil'
  | 'ellipsis'
  | 'heart'
  | 'pulse'
  | 'thermometer'
  | 'weight'
  | 'checkCircle'
  | 'alert'
  | 'xCircle'
  | 'diamond'
  | 'history'
  | 'person'
  | 'gender'
  | 'list'
  | 'stethoscope'
  | 'grid'
  | 'download'
  | 'check'
  | 'monitor'
  | 'info'
  | 'plus'
  | 'x'
  | 'refresh'
  | 'bars'
  | 'sparkle'
  | 'flask'
  | 'image'

const ICON_PATHS: Record<IconName, ReactNode> = {
  home: <path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4.2v-6H9.2v6H5a1 1 0 0 1-1-1z" />,
  chevron: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  id: <><rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.4" /><path d="M7 10h4M7 13.6h6.4M16 10h1.2" /></>,
  calendar: <><rect x="3.3" y="5.4" width="17.4" height="15.2" rx="2.6" /><path d="M3.3 10.2h17.4M8.2 3.4v4M15.8 3.4v4" /></>,
  phone: <path d="M6.6 3.6h3l1.4 3.9-2 1.4a11 11 0 0 0 5.1 5.1l1.4-2 3.9 1.4v3a2 2 0 0 1-2 2A15.2 15.2 0 0 1 4.6 5.6a2 2 0 0 1 2-2z" />,
  location: <><path d="M12 21s6.2-5.4 6.2-10.2a6.2 6.2 0 1 0-12.4 0C5.8 15.6 12 21 12 21z" /><circle cx="12" cy="10.6" r="2.3" /></>,
  emergency: <><path d="M9 11.4a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2z" /><path d="M3.4 20.4c.5-3.2 2.8-5 5.6-5 1 0 2 .2 2.8.7" /><path d="M17.6 13.6v6.4M14.4 16.8h6.4" /></>,
  pencil: <><path d="M4.4 19.6h3.9L19.6 8.3l-3.9-3.9L4.4 15.7z" /><path d="M14.4 5.7l3.9 3.9" /></>,
  ellipsis: <><circle cx="5.4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="18.6" cy="12" r="1.5" fill="currentColor" stroke="none" /></>,
  heart: <path d="M12 20.2s-7.2-4.6-9-9.2a5.1 5.1 0 0 1 9-3 5.1 5.1 0 0 1 9 3c-1.8 4.6-9 9.2-9 9.2z" />,
  pulse: <path d="M2.6 12h4.2l2.1-6.4 3.5 12.8 2.1-6.4h6.9" />,
  thermometer: <path d="M12 4a2 2 0 0 1 2 2v7.3a4.1 4.1 0 1 1-4 0V6a2 2 0 0 1 2-2z" />,
  weight: <><path d="M6.2 8h11.6l1.5 11H4.7z" /><path d="M9.5 8a2.5 2.5 0 1 1 5 0" /></>,
  checkCircle: <><circle cx="12" cy="12" r="8.4" /><path d="M8.2 12.4l2.6 2.6 5-5.4" /></>,
  alert: <><path d="M12 4.2 2.8 20.4h18.4z" /><path d="M12 10v4.2" /><circle cx="12" cy="17.4" r="1" fill="currentColor" stroke="none" /></>,
  xCircle: <><circle cx="12" cy="12" r="7.6" /><path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2" /></>,
  diamond: <path d="M12 3.4 20.6 12 12 20.6 3.4 12z" />,
  history: <><path d="M4.2 12a7.8 7.8 0 1 1 2.3 5.6" /><path d="M4.2 12V7.6M4.2 12h4.4" /><path d="M12 8.6V12l2.6 1.6" /></>,
  person: <><circle cx="12" cy="8" r="3.4" /><path d="M4.8 20.4c.6-3.6 3.2-5.6 7.2-5.6s6.6 2 7.2 5.6" /></>,
  gender: <><circle cx="12" cy="9" r="4.6" /><path d="M12 13.6V21M9 17.8h6M15.2 5.8l3-3M15.8 2.8h2.4v2.4" /></>,
  list: <path d="M5 7h14M5 12h14M5 17h9" />,
  stethoscope: <><path d="M7 4.2v5.2a4 4 0 0 0 8 0V4.2" /><path d="M11 15.6v1.2a3.2 3.2 0 0 0 6.4 0v-1.4" /><circle cx="17.4" cy="13" r="2" /></>,
  grid: <><rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2.4" /><path d="M3.6 9.4h16.8M3.6 14.4h16.8M9 4.6v14.8" /></>,
  download: <><path d="M12 4v10.4M7.8 10.6 12 14.8l4.2-4.2" /><path d="M5 19.4h14" /></>,
  check: <path d="M5 12.6 9.8 17.4 19 7.2" />,
  monitor: <><rect x="3.4" y="5.2" width="17.2" height="12.4" rx="2.4" /><path d="M8.6 20.6h6.8M12 17.6v3" /><path d="M6.8 11.6h2.6l1.4-3 2 5.4 1.4-2.4h2.6" /></>,
  info: <><circle cx="12" cy="12" r="8.4" /><path d="M12 11v5.4" /><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" /></>,
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  x: <path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6" />,
  refresh: <><path d="M4.6 5.6v4.8h4.8" /><path d="M5.8 14.4a6.8 6.8 0 1 0 1-6.6L4.6 10.4" /></>,
  bars: <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
  sparkle: <path d="M12 4v16M4.9 8l14.2 8M19.1 8 4.9 16" />,
  flask: <><path d="M9.4 3.6h5.2M10.6 3.6v6.2l-5.2 8.4a2 2 0 0 0 1.7 3h9.8a2 2 0 0 0 1.7-3l-5.2-8.4V3.6" /><path d="M7.4 15.4h9.2" /></>,
  image: <><rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.4" /><circle cx="8.6" cy="9.4" r="1.5" /><path d="M4.4 17.2 9.8 12l3.2 3 2.3-2.1 4.3 4.3" /></>,
}

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

const CONTEXT_ICONS: Record<string, IconName> = {
  age: 'person',
  gender: 'gender',
  codes: 'list',
  specialist: 'stethoscope',
  dates: 'grid',
  medication: 'diamond',
  notes: 'list',
}

const SOURCE_ICONS: Record<string, IconName> = {
  emr: 'list',
  diagnosis: 'grid',
  medication: 'diamond',
  soap: 'list',
  laboratory: 'flask',
  procedure: 'stethoscope',
}

const CLAIM_ICONS: Record<string, IconName> = {
  heart: 'heart',
  monitor: 'monitor',
  diamond: 'diamond',
  notes: 'list',
  check: 'check',
}

const VITAL_ICONS: Record<string, IconName> = {
  heart: 'heart',
  pulse: 'pulse',
  temperature: 'thermometer',
  weight: 'weight',
}

const QUICK_ICONS: Record<string, IconName> = {
  'view-sources': 'list',
  'export-summary': 'download',
  'mark-reviewed': 'check',
  'open-assistant': 'monitor',
}

const METRIC_ICONS: Record<QualityMetricTone, IconName> = {
  coverage: 'bars',
  freshness: 'history',
  consistency: 'sparkle',
  identity: 'person',
}

const FRESHNESS_ICONS: Record<string, IconName> = {
  grid: 'grid',
  list: 'list',
  diamond: 'diamond',
  pulse: 'pulse',
}

type Notice = { title: string; text: string }

function NoticeDialog({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (notice && !dialog.open) dialog.showModal()
    if (!notice && dialog.open) dialog.close()
  }, [notice])

  return (
    <dialog
      ref={dialogRef}
      className="db-dialog db-dialog--notice"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => { if (event.target === dialogRef.current) onClose() }}
    >
      <div className="db-dialog-body">
        <button type="button" className="db-dialog-close" onClick={onClose}>
          <Icon name="x" size={18} /><span className="sr-only">Close</span>
        </button>
        <h2 id={titleId}>{notice?.title ?? 'Not available'}</h2>
        {notice && <p className="db-dialog-sub">{notice.text}</p>}
        <div className="db-dialog-actions">
          <button type="button" className="db-dialog-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  )
}

type OverviewProps = {
  overview: Overview
  onNotice: (title: string, text: string) => void
}

function OverviewPanel({ overview, onNotice }: OverviewProps) {
  return (
    <div className="db-pd-overview">
      <section className="db-pd-card db-pd-vitals" aria-labelledby="pd-vitals">
        <div className="db-pd-card-head">
          <span className="db-pd-card-icon" aria-hidden="true"><Icon name="pulse" size={20} /></span>
          <div className="db-pd-card-heading">
            <h2 id="pd-vitals">Vital Signs</h2>
            <p>{overview.vitalsChecked}</p>
          </div>
          <button type="button" className="db-pd-ghost" onClick={() => onNotice('Vital trends are not available in this demo.', 'This reference renders a single supplied check-up. Trend charts are not part of the supplied demo data.')}>
            View Trends
          </button>
        </div>
        <ul className="db-pd-vital-grid" role="list">
          {overview.vitals.map((vital) => (
            <li key={vital.label} className={`db-pd-vital db-pd-vital--${vital.tone}`}>
              <span className="db-pd-vital-top">
                <span className="db-pd-vital-icon" aria-hidden="true"><Icon name={VITAL_ICONS[vital.tone]} size={20} /></span>
                <span className="db-pd-vital-reading">
                  <strong>{vital.value}</strong>
                  <span className="db-pd-vital-unit">{vital.unit}</span>
                </span>
              </span>
              <span className="db-pd-vital-label">{vital.label}</span>
              <span className="db-pd-vital-status">{vital.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="db-pd-card db-pd-condition-card" aria-labelledby="pd-condition">
        <div className="db-pd-card-head">
          <span className="db-pd-card-icon" aria-hidden="true"><Icon name="monitor" size={20} /></span>
          <div className="db-pd-card-heading"><h2 id="pd-condition">Current Condition</h2></div>
          <button type="button" className="db-pd-ghost" onClick={() => onNotice('Updating the condition is not available.', 'The patient record service does not expose a clinical condition update endpoint.')}>Update</button>
        </div>
        <div className="db-pd-condition">
          <span className="db-pd-condition-icon" aria-hidden="true"><Icon name="checkCircle" size={24} /></span>
          <div>
            <p className="db-pd-condition-title">{overview.condition.title}</p>
            <p className="db-pd-condition-text">{overview.condition.description}</p>
          </div>
        </div>
        <dl className="db-pd-mini">
          <div>
            <dt><span className="db-pd-mini-icon" aria-hidden="true"><Icon name="calendar" size={16} /></span>Last Visit Reason</dt>
            <dd>{overview.condition.lastVisitReason}<span className="db-pd-mini-note">{overview.condition.lastVisitDate}</span></dd>
          </div>
          <div>
            <dt><span className="db-pd-mini-icon" aria-hidden="true"><Icon name="person" size={16} /></span>Care Context</dt>
            <dd className="db-pd-mini-value">{overview.condition.careContext}<span className="db-pd-mini-note">{overview.condition.careContextNote}</span></dd>
          </div>
        </dl>
      </section>

      <div className="db-pd-overview-split">
        <section className="db-pd-card" aria-labelledby="pd-allergies">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon db-pd-card-icon--alert" aria-hidden="true"><Icon name="alert" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-allergies">Allergies</h2></div>
            <button type="button" className="db-pd-ghost" onClick={() => onNotice('Editing allergies is not available in this demo.', 'This reference renders supplied synthetic content. Changing allergies needs an approved record workflow and backend.')}>Edit</button>
          </div>
          <ul className="db-pd-list" role="list">
            {overview.allergies.map((allergy) => (
              <li key={allergy.name} className={`db-pd-row db-pd-row--${allergy.severity}`}>
                <span aria-hidden="true"><Icon name="xCircle" size={18} /></span>
                <span className="db-pd-row-body"><strong>{allergy.name}</strong><span>{allergy.kind}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-pd-card" aria-labelledby="pd-meds">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="diamond" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-meds">Current Medications</h2></div>
            <button type="button" className="db-pd-ghost" onClick={() => onNotice('Editing medications is not available in this demo.', 'This reference renders supplied synthetic content. Changing medication needs an approved record workflow and backend.')}>Edit</button>
          </div>
          <ul className="db-pd-list" role="list">
            {overview.medications.map((medication) => (
              <li key={medication.name} className="db-pd-row">
                <span className="db-pd-row-glyph" aria-hidden="true"><Icon name="diamond" size={16} /></span>
                <span className="db-pd-row-body"><strong>{medication.name}</strong><span>{medication.dose}</span></span>
                <span className="db-pd-chip">{medication.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="db-pd-card db-pd-history-card" aria-labelledby="pd-history">
        <div className="db-pd-card-head">
          <span className="db-pd-card-icon" aria-hidden="true"><Icon name="history" size={20} /></span>
          <div className="db-pd-card-heading"><h2 id="pd-history">Medical History</h2></div>
          <button type="button" className="db-pd-ghost" onClick={() => onNotice('Full record list is not available.', 'The patient record service does not expose a complete history list endpoint.')}>View All Records</button>
        </div>
        <ul className="db-pd-history" role="list">
          {overview.history.map((entry) => (
            <li key={`${entry.date}-${entry.title}`}>
              <span className="db-pd-history-date">{entry.date}</span>
              <span className="db-pd-history-title"><strong>{entry.title}</strong><span>{entry.note}</span></span>
              <span className="db-pd-history-clinician">{entry.clinician}<span>{entry.role}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SummaryPanel({ patientId, view, claim, onNotice, onExport, reviewed, onReview, onRefresh, onOpenEvidence, busy }: {
  patientId: string
  view: OverviewTab
  claim: Claim | undefined
  onNotice: (title: string, text: string) => void
  onExport: () => void
  reviewed: boolean
  onReview: () => void
  onRefresh: () => void
  onOpenEvidence: () => void
  busy: boolean
}) {
  const availability = availabilitySplit(view.availability)

  return (
    <div className="db-pd-summary">
      <div className="db-pd-summary-main">
        <section className="db-pd-card db-pd-aicard" aria-labelledby="pd-ai">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="refresh" size={20} /></span>
            <div className="db-pd-card-heading">
              <div className="db-pd-ai-title">
                <h2 id="pd-ai">{view.summary.heading}</h2>
                <span className="db-pd-chip db-pd-chip--ok">{view.summary.status}</span>
              </div>
              <p>{view.summary.generated} • {view.summary.sourceNote}</p>
            </div>
            <div className="db-pd-ai-actions">
              <button type="button" className="db-pd-ghost" disabled={busy} onClick={onRefresh}>
                <Icon name="refresh" size={16} /> Refresh Summary
              </button>
              <Link to={`/dashboard/healthcare-assistant?patientId=${encodeURIComponent(patientId)}`} className="db-pd-ai-assistant">
                <Icon name="sparkle" size={16} /> Open in Healthcare Assistant
              </Link>
            </div>
          </div>
          <div className="db-pd-ai-box">
            <p className="db-pd-ai-body">{view.summary.body}</p>
            <button type="button" className="db-pd-ai-sources" onClick={onOpenEvidence}>
              <Icon name="list" size={16} /> {view.summary.sourceCount} sources
            </button>
          </div>
        </section>

        <section className="db-pd-card" aria-labelledby="pd-context">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="list" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-context">Known Clinical Context</h2></div>
          </div>
          <ul className="db-pd-context-grid" role="list">
            {view.context.map((card) => (
              <li key={card.label}>
                <span className="db-pd-context-icon" aria-hidden="true"><Icon name={CONTEXT_ICONS[card.icon]} size={18} /></span>
                <span className="db-pd-context-body">
                  <span className="db-pd-context-label">{card.label}</span>
                  <strong>{card.value}</strong>
                  {card.detail && <span className="db-pd-context-detail">{card.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-pd-card" aria-labelledby="pd-soap">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="plus" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-soap">SOAP Highlights</h2></div>
          </div>
          <ul className="db-pd-soap" role="list">
            {view.soap.map((note) => (
              <li key={note.label} className={`db-pd-soap-item db-pd-soap-item--${note.tone}`}>
                <span className="db-pd-soap-initial" aria-hidden="true">{note.initial}</span>
                <span className="db-pd-soap-body"><strong>{note.label}</strong><span>{note.body}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-pd-card" aria-labelledby="pd-timeline">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="history" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-timeline">Patient Timeline</h2></div>
            <Link to={detailHref(patientId, 'appointments')} className="db-pd-ghost">View All Visits</Link>
          </div>
          <ul className="db-pd-timeline" role="list">
            {view.timeline.map((entry) => (
              <li key={`${entry.date}-${entry.source}`} className="db-pd-timeline-row">
                <button type="button" className="db-pd-timeline-main" onClick={() => onNotice(`${entry.title} on ${entry.date}`, `${entry.note} Clinician: ${entry.clinician}. Source ${entry.source}.`)}>
                  <span className="db-pd-timeline-date">{entry.date}</span>
                  <span className="db-pd-timeline-body"><strong>{entry.title}</strong><span>{entry.clinician}</span></span>
                  <span className="db-pd-timeline-note">{entry.note}</span>
                </button>
                <Link
                  to={sectionHref(patientId, 'evidence')}
                  className="db-pd-marker"
                  aria-label={`Open sources and evidence for ${entry.title}`}
                >
                  <Icon name="list" size={14} /> {entry.source}
                </Link>
                <Icon name="chevron" size={16} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="db-pd-summary-rail" aria-label="Clinical alerts and sources">
        <section className="db-pd-card" aria-labelledby="pd-alerts">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon db-pd-card-icon--alert" aria-hidden="true"><Icon name="alert" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-alerts">Clinical Alerts / Review Needed</h2></div>
            <span className="db-pd-badge-count">{view.alerts.length}</span>
          </div>
          <ul className="db-pd-alerts" role="list">
            {view.alerts.map((alert) => (
              <li key={alert.title}>
                <button type="button" className={`db-pd-alert db-pd-alert--${alert.level}`} onClick={() => onNotice(alert.title, alert.description)}>
                  <span className="db-pd-alert-icon" aria-hidden="true">
                    <Icon name={alert.level === 'high' ? 'alert' : alert.level === 'medium' ? 'alert' : 'info'} size={18} />
                  </span>
                  <span className="db-pd-alert-body"><strong>{alert.title}</strong><span>{alert.description}</span></span>
                  <Icon name="chevron" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-pd-card" aria-labelledby="pd-sources">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="list" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-sources">Sources &amp; Evidence</h2></div>
          </div>
          <p className="db-pd-rail-note">Each item is linked to source records and can be viewed with citations.</p>
          <ul className="db-pd-source-list" role="list">
            {view.sourceGroups.map((group) => (
              <li key={group.label}>
                <Link to={sectionHref(patientId, 'evidence')} className="db-pd-source-row">
                  <span className="db-pd-source-icon" aria-hidden="true"><Icon name={SOURCE_ICONS[group.icon]} size={18} /></span>
                  <span className="db-pd-source-label">{group.label}</span>
                  <span className="db-pd-source-count">{group.count}</span>
                  <span className="db-pd-markers" aria-hidden="true">
                    {group.markers.map((marker) => <span key={marker} className="db-pd-marker-chip">{marker}</span>)}
                  </span>
                  <Icon name="chevron" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-pd-card" aria-labelledby="pd-actions">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="refresh" size={20} /></span>
            <div className="db-pd-card-heading"><h2 id="pd-actions">Quick Actions</h2></div>
          </div>
          <div className="db-pd-quick">
            <button type="button" className="db-pd-quick-btn" onClick={onOpenEvidence}>
              <Icon name={QUICK_ICONS['view-sources']} size={18} /> {QUICK_ACTION_LABELS['view-sources']}
              <Icon name="chevron" size={16} />
            </button>
            <button type="button" className="db-pd-quick-btn" onClick={onExport}>
              <Icon name={QUICK_ICONS['export-summary']} size={18} /> {QUICK_ACTION_LABELS['export-summary']}
              <Icon name="chevron" size={16} />
            </button>
            <button type="button" className="db-pd-quick-btn db-pd-quick-btn--primary" aria-pressed={reviewed} onClick={onReview}>
              <Icon name={QUICK_ICONS['mark-reviewed']} size={18} /> {reviewedLabel(reviewed)}
            </button>
            <Link to={`/dashboard/healthcare-assistant?patientId=${encodeURIComponent(patientId)}`} className="db-pd-quick-btn">
              <Icon name={QUICK_ICONS['open-assistant']} size={18} /> {QUICK_ACTION_LABELS['open-assistant']}
              <Icon name="chevron" size={16} />
            </Link>
          </div>
        </section>
      </aside>

      <section className="db-pd-availability" aria-labelledby="pd-availability">
        <span className="db-pd-availability-title" id="pd-availability">Data Availability</span>
        <ul className="db-pd-availability-list" role="list">
          {availability.available.map((label) => (
            <li key={label} className="db-pd-availability-item db-pd-availability-item--ok">
              <Icon name="check" size={15} /> {label}
            </li>
          ))}
          {availability.unavailable.map((label) => (
            <li key={label} className="db-pd-availability-item db-pd-availability-item--no">
              <Icon name="x" size={15} /> {label}
            </li>
          ))}
        </ul>
      </section>

      <p className="sr-only">
        Selected claim: {claim ? claim.title : 'none'}. Summary content is generated from the cited source records.
      </p>
    </div>
  )
}

function EvidencePanel({ patientId, claims, records }: {
  patientId: string
  claims: readonly Claim[]
  records: readonly EvidenceRecord[]
}) {
  const [sourceFilter, setSourceFilter] = useState<SourceId | typeof ALL_SOURCES>(ALL_SOURCES)
  const [activeId, setActiveId] = useState<string>(claims[0]?.id ?? '')

  const visibleClaims = filterClaims(claims, sourceFilter)
  const active = resolveActiveClaim(visibleClaims, activeId)
  const activeEvidence = filterEvidenceBySource(evidenceForClaim(active, records), sourceFilter)

  return (
    <div className="db-pd-evidence">
      <section className="db-pd-card" aria-labelledby="pd-claims">
        <div className="db-pd-card-head">
          <span className="db-pd-card-icon" aria-hidden="true"><Icon name="refresh" size={20} /></span>
          <div className="db-pd-card-heading">
            <h2 id="pd-claims">AI-Generated Claims</h2>
            <p>Key clinical statements from the AI summary with supporting evidence.</p>
          </div>
          <div className="db-pd-filter">
            <label className="sr-only" htmlFor="pd-source-filter">Filter by Source</label>
            <select id="pd-source-filter" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceId | typeof ALL_SOURCES)}>
              <option value={ALL_SOURCES}>Filter by Source</option>
              {records.map((record) => (
                <option key={record.source} value={record.source}>{record.source} – {record.title}</option>
              ))}
            </select>
          </div>
        </div>
        <ul className="db-pd-claims" role="list">
          {visibleClaims.map((claim) => {
            const isActive = active?.id === claim.id
            return (
              <li key={claim.id}>
                <button
                  type="button"
                  className={`db-pd-claim${isActive ? ' db-pd-claim--active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => setActiveId(claim.id)}
                >
                  <span className="db-pd-claim-number" aria-hidden="true">{claim.number}</span>
                  <span className={`db-pd-claim-icon db-pd-claim-icon--${claim.icon}`} aria-hidden="true"><Icon name={CLAIM_ICONS[claim.icon]} size={20} /></span>
                  <span className="db-pd-claim-body">
                    <strong>{claim.title}</strong>
                    <span>{claim.description}</span>
                    <span className="db-pd-claim-sources">Supported by:
                      {claim.sources.map((marker) => <span key={marker} className="db-pd-marker-chip">{marker}</span>)}
                    </span>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="db-pd-card" aria-labelledby="pd-evidence">
        {active && (
          <div className="db-pd-claim-summary">
            <span className="db-pd-claim-number" aria-hidden="true">{active.number}</span>
            <span className={`db-pd-claim-icon db-pd-claim-icon--${active.icon}`} aria-hidden="true"><Icon name={CLAIM_ICONS[active.icon]} size={20} /></span>
            <span className="db-pd-claim-body">
              <strong>{active.title}</strong>
              <span>{active.description}</span>
            </span>
            <span className="db-pd-claim-support">
              <span className="db-pd-support-label">Supporting Sources</span>
              <span className="db-pd-markers">
                {active.sources.map((marker) => <span key={marker} className="db-pd-marker-chip">{marker}</span>)}
              </span>
            </span>
          </div>
        )}

        <div className="db-pd-card-head">
          <span className="db-pd-card-icon" aria-hidden="true"><Icon name="list" size={20} /></span>
          <div className="db-pd-card-heading">
            <h2 id="pd-evidence">Evidence from Source Records</h2>
            <p>These records support the claim. Click on each source to view full details.</p>
          </div>
          <button type="button" className="db-pd-ghost" disabled={sourceFilter === ALL_SOURCES} onClick={() => setSourceFilter(ALL_SOURCES)}>
            <Icon name="list" size={16} /> View All Sources
          </button>
        </div>

        <ul className="db-pd-records" role="list">
          {activeEvidence.map((record: EvidenceRecord) => (
            <li key={record.source}>
              <details className="db-pd-record" open>
                <summary>
                  <span className="db-pd-record-marker" aria-hidden="true">{record.source}</span>
                  <span className="db-pd-record-icon" aria-hidden="true"><Icon name={SOURCE_ICONS[record.icon]} size={18} /></span>
                  <span className="db-pd-record-title">{record.title}</span>
                  <span className="db-pd-record-date">{record.date}</span>
                  <Icon name="chevron" size={16} />
                </summary>
                <dl className="db-pd-record-fields">
                  {record.fields.map((field) => (
                    <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>
                  ))}
                </dl>
              </details>
            </li>
          ))}
        </ul>
        <p className="sr-only">Records are cited directly from the patient's source records.</p>
      </section>
      <p className="sr-only">Opened from patient {patientId}.</p>
    </div>
  )
}

function DataQualityPanel({ view, onRefresh, busy }: {
  view: SummaryView
  onRefresh: () => void
  busy: boolean
}) {
  const domains = view.domains
  const reliability = view.reliability
  const ringRotation = -81

  return (
    <div className="db-pd-quality">
      <div className="db-pd-quality-col">
        <section className="db-pd-card db-pd-quality-overview" aria-labelledby="pd-quality-overview">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="grid" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2 id="pd-quality-overview">Data Quality Overview</h2>
              <p>Assesses the completeness, recency, consistency, and reliability of patient data used in the AI summary.</p>
            </div>
          </div>

          <div className="db-pd-reliability">
            <div className="db-pd-ring-wrap">
              <svg className="db-pd-ring" viewBox="0 0 116 116" width={116} height={116} aria-hidden="true">
                <circle cx="58" cy="58" r="52.5" fill="none" stroke="#d5dfed" strokeWidth="11" />
                <circle
                  cx="58"
                  cy="58"
                  r="52.5"
                  fill="none"
                  stroke="var(--dashboard-teal)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${reliability.score} ${reliability.scale - reliability.score}`}
                  transform={`rotate(${ringRotation} 58 58)`}
                />
              </svg>
              <span className="db-pd-ring-value">
                <strong>{reliability.score}</strong>
                <span>/{reliability.scale}</span>
              </span>
              <span className="sr-only">
                {reliability.label}: {reliability.score} out of {reliability.scale}, {reliability.status}.
              </span>
            </div>

            <div className="db-pd-reliability-main">
              <div className="db-pd-reliability-head">
                <span className="db-pd-reliability-badge" aria-hidden="true"><Icon name="checkCircle" size={20} /></span>
                <h3 className="db-pd-reliability-title">{reliability.label}</h3>
                <span className="db-pd-info" aria-hidden="true"><Icon name="info" size={15} /></span>
                <span className="sr-only">These quality values come from the stored data quality assessment.</span>
                <span className="db-pd-chip db-pd-chip--ok"><Icon name="diamond" size={11} /> {reliability.status}</span>
              </div>
              <p className="db-pd-reliability-copy">{reliability.copy}</p>
            </div>
          </div>

          <ul className="db-pd-metrics" role="list">
            {view.metrics.map((metric) => (
              <li key={metric.id} className={`db-pd-metric db-pd-metric--${metric.tone}`}>
                <span className="db-pd-metric-head">
                  <span className="db-pd-metric-icon" aria-hidden="true"><Icon name={METRIC_ICONS[metric.tone]} size={19} /></span>
                  <span className="db-pd-metric-label">{metric.label}</span>
                </span>
                <span className="db-pd-metric-value">{metric.value}</span>
                <span className="db-pd-metric-copy">{metric.copy}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-pd-card db-pd-domain-panel" aria-labelledby="pd-domains">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="list" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2 id="pd-domains">Data Domain Availability</h2>
            </div>
            <span className="db-pd-domain-legend">
              <span className="db-pd-legend-item"><span className="db-pd-legend-dot db-pd-legend-dot--ok" aria-hidden="true" /> Available</span>
              <span className="db-pd-legend-item"><span className="db-pd-legend-dot db-pd-legend-dot--warn" aria-hidden="true" /> Partial</span>
              <span className="db-pd-legend-item"><span className="db-pd-legend-dot db-pd-legend-dot--no" aria-hidden="true" /> Not Available</span>
            </span>
          </div>
          <p className="db-pd-card-sub">Shows which types of patient data are available and integrated in the AI summary.</p>
          <ul className="db-pd-domain-grid" role="list">
            {domains.map((domain: DataDomain) => {
              const tone: DomainTone = domainStatusTone(domain.status)
              return (
                <li key={domain.id} className={`db-pd-domain db-pd-domain--${tone}`}>
                  <span className="db-pd-domain-icon" aria-hidden="true"><Icon name={CONTEXT_ICONS[domain.icon]} size={18} /></span>
                  <span className="db-pd-domain-body">
                    <strong>{domain.label}</strong>
                    <span className={`db-pd-domain-status db-pd-domain-status--${tone}`}>
                      <Icon name={tone === 'ok' ? 'check' : 'x'} size={14} /> {domainStatusLabel(domain.status)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="sr-only">
            Availability reflects the stored data quality assessment. Not Yet Integrated means a domain may exist elsewhere
            but is not part of this patient's summary. Not Available means the record provides no data for that domain.
          </p>
        </section>
      </div>

      <div className="db-pd-quality-col">
        <section className="db-pd-card db-pd-quality-freshness" aria-labelledby="pd-freshness">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="history" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2 id="pd-freshness">Data Freshness</h2>
            </div>
            <button
              type="button"
              className="db-pd-ghost db-pd-refresh"
              disabled={busy}
              onClick={onRefresh}
            >
              <Icon name="refresh" size={16} /> Refresh Data Quality
            </button>
          </div>
          <ul className="db-pd-freshness" role="list">
            {view.freshness.map((record) => (
              <li key={record.id}>
                <span className="db-pd-freshness-icon" aria-hidden="true"><Icon name={FRESHNESS_ICONS[record.icon] ?? 'list'} size={20} /></span>
                <span className="db-pd-freshness-label">{record.label}</span>
                <span className="db-pd-freshness-value">{record.value}</span>
              </li>
            ))}
          </ul>
          <p className="sr-only">Freshness values are reported by the stored data quality assessment.</p>
        </section>

        <section className="db-pd-card db-pd-quality-gaps" aria-labelledby="pd-gaps">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon db-pd-card-icon--alert" aria-hidden="true"><Icon name="alert" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2 id="pd-gaps">Gaps &amp; Conflicts</h2>
              <p>Data issues that may affect completeness or accuracy of the AI summary.</p>
            </div>
            <span className="db-pd-count">{view.issues.length} items</span>
          </div>
          <div className="db-pd-table-scroll" role="region" aria-label="Data quality issues" tabIndex={0}>
            <table className="db-pd-gaps">
              <caption className="sr-only">Data quality issues with their type and impact.</caption>
              <colgroup>
                <col className="db-pd-gaps-num-col" />
                <col />
                <col className="db-pd-gaps-type-col" />
                <col className="db-pd-gaps-impact-col" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Issue</th>
                  <th scope="col">Type</th>
                  <th scope="col">Impact</th>
                </tr>
              </thead>
              <tbody>
                {view.issues.map((issue, index) => (
                  <tr key={issue.id}>
                    <td className="db-pd-gaps-num">{index + 1}</td>
                    <th scope="row" className="db-pd-gaps-issue">
                      <span className="db-pd-gaps-title">{issue.issue}</span>
                      <span className="db-pd-gaps-detail">{issue.detail}</span>
                    </th>
                    <td><span className={`db-pd-chip db-pd-chip--${issue.type === 'Missing Data' ? 'danger' : 'warn'}`}>{issue.type}</span></td>
                    <td><span className={`db-pd-chip db-pd-chip--${issue.impact === 'High' ? 'danger' : 'warn'}`}>{issue.impact}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="db-pd-quality-note">
        Reliability scores, supporting metrics, freshness dates, and issue rows are reported by the backend data quality
        assessment for this patient.
      </p>
    </div>
  )
}

function TabUnavailable({ title }: { title: string }) {
  const id = `pd-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section className="db-pd-card" aria-labelledby={id}>
      <div className="db-pd-card-head">
        <span className="db-pd-card-icon" aria-hidden="true"><Icon name="info" size={20} /></span>
        <div className="db-pd-card-heading">
          <h2 id={id}>{title}</h2>
          <p>This record type is not available from the patient record service.</p>
        </div>
      </div>
      <p className="db-pd-rail-note">
        The service exposes patient identity, overview, AI summary, and data quality. It does not expose a
        {' '}{title.toLowerCase()} endpoint, so no records are shown.
      </p>
    </section>
  )
}
function PatientDetailPage() {
  const params = useParams()
  const patientId = params.patientId ?? ''
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [patient, setPatient] = useState<ApiPatientDetail | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const ai = usePatientSummary(patientId)

  useEffect(() => {
    if (!patientId) { setLoadState('missing'); return }
    const abort = new AbortController()
    setLoadState('loading')
    setLoadError('')
    api.patients.get(patientId).then((next) => {
      if (!abort.signal.aborted) { setPatient(next); setLoadState('ready') }
    }).catch((reason) => {
      if (abort.signal.aborted) return
      setPatient(null)
      if (reason instanceof ApiError && reason.status === 404) setLoadState('missing')
      else {
        setLoadError(
          reason instanceof ApiError && reason.status === 401
            ? 'Your session expired. Sign in again to continue.'
            : reason instanceof ApiError && reason.status === 403
              ? 'You do not have permission to view this patient record.'
              : reason instanceof Error ? reason.message : 'The patient record could not be loaded.',
        )
        setLoadState('error')
      }
    })
    return () => abort.abort()
  }, [patientId, reloadToken])

  const tab = parseDetailTab(searchParams.get('tab'))
  const section = parseSummarySection(searchParams.get('section'))
  const openNotice = (title: string, text: string) => setNotice({ title, text })
  const busy = ai.action !== 'idle'

  if (loadState === 'loading') {
    return (
      <div className="db-pd">
        <section className="db-pd-card" aria-busy="true">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="person" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2>Loading patient record</h2>
              <p>Retrieving the stored patient identity and overview.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (loadState === 'missing') {
    return (
      <div className="db-pd">
        <section className="db-pd-card">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="info" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2>Patient not found</h2>
              <p>No stored patient matches {patientId || 'this identifier'}.</p>
            </div>
          </div>
          <div className="db-detail-actions">
            <Link to="/dashboard/patients" className="db-back-link">Back to Patient Directory</Link>
          </div>
        </section>
      </div>
    )
  }

  if (loadState === 'error' || !patient) {
    return (
      <div className="db-pd">
        <section className="db-pd-card" role="alert">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon db-pd-card-icon--alert" aria-hidden="true"><Icon name="alert" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2>Patient record unavailable</h2>
              <p>{loadError}</p>
            </div>
          </div>
          <div className="db-detail-actions">
            <button type="button" className="db-back-link" onClick={() => setReloadToken(token => token + 1)}>Try again</button>
            <Link to="/dashboard/patients" className="db-panel-link">Back to Patient Directory</Link>
          </div>
        </section>
      </div>
    )
  }

  const identity = buildIdentity(patient)
  const overview = buildOverview(patient)
  const aiView = ai.summary ? buildSummaryView(ai.summary) : null
  const meta = `${identity.age} years � ${identity.gender} � ${identity.religion}`

  const facts = [
    { icon: 'id' as IconName, label: 'Patient ID', value: identity.patientNumber },
    { icon: 'calendar' as IconName, label: 'Date of Birth', value: identity.dateOfBirth, note: `(${identity.age} years)` },
    { icon: 'phone' as IconName, label: 'Phone', value: identity.phone },
    { icon: 'location' as IconName, label: 'Address', value: identity.address },
  ]

  const exportSummary = () => {
    if (!ai.summary) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(ai.summary, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ai-summary-${patientId}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="db-pd">
      <div className="db-pd-crumb">
        <Link to="/dashboard/patients" className="db-pd-crumb-link"><Icon name="home" size={16} /> Patients</Link>
        <Icon name="chevron" size={14} />
        <span className="db-pd-crumb-current" aria-current="page">Patient Detail</span>
        <span className="db-pd-crumb-actions">
          <button type="button" className="db-pd-action" onClick={() => openNotice('Editing patient details is not available.', 'The patient record service does not expose an update endpoint for identity details.')}>
            <Icon name="pencil" size={16} /> Edit Patient
          </button>
          <button type="button" className="db-pd-action db-pd-action--icon" aria-label="More patient actions" onClick={() => openNotice('More patient actions are not available.', 'The patient record service does not expose additional record actions.')}>
            <Icon name="ellipsis" size={18} />
          </button>
        </span>
      </div>

      <div className="db-pd-headcard">
        <section className="db-pd-ident" aria-label="Patient identity">
          <div className="db-pd-ident-photo">
            <PatientAvatar src={patient.avatarUrl} name={patient.displayName} size={124} />
          </div>
          <div className="db-pd-ident-main">
            <div className="db-pd-ident-title">
              <h1>{patient.displayName}</h1>
              <span className="db-pd-status-pill">{statusLabel(patient.status)}</span>
            </div>
            <p className="db-pd-meta">{meta}</p>
            <ul className="db-pd-facts" role="list">
              {facts.map((fact) => (
                <li key={fact.label} className="db-pd-fact">
                  <span className="db-pd-fact-icon" aria-hidden="true"><Icon name={fact.icon} size={19} /></span>
                  <span className="db-pd-fact-body">
                    <span className="db-pd-fact-label">{fact.label}</span>
                    <span className="db-pd-fact-value">{fact.value}</span>
                    {fact.note && <span className="db-pd-fact-note">{fact.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {identity.emergencyContact && (
            <div className="db-pd-emergency">
              <p className="db-pd-emergency-label"><Icon name="emergency" size={18} /> Emergency Contact</p>
              <p className="db-pd-emergency-name">{identity.emergencyContact.name} ({identity.emergencyContact.relation})</p>
              <p className="db-pd-emergency-phone">{identity.emergencyContact.phone}</p>
            </div>
          )}
        </section>

        <nav className="db-pd-tabs" aria-label="Patient detail sections">
          {DETAIL_TABS.map((entry) => (
            <Link
              key={entry.key}
              to={detailHref(patientId, entry.key)}
              className={`db-pd-tab${tab === entry.key ? ' db-pd-tab--active' : ''}`}
              aria-current={tab === entry.key ? 'page' : undefined}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
      </div>

      {tab === 'ai-summary' && (
        <nav className="db-pd-subtabs" aria-label="AI summary sections">
          {SUMMARY_SECTIONS.map((entry) => (
            <Link
              key={entry.key}
              to={sectionHref(patientId, entry.key)}
              className={`db-pd-subtab${section === entry.key ? ' db-pd-subtab--active' : ''}`}
              aria-current={section === entry.key ? 'page' : undefined}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
      )}

      <div role="status" aria-live="polite" className="sr-only">{ai.announcement}</div>

      {tab === 'overview' && <OverviewPanel overview={overview} onNotice={openNotice} />}

      {tab === 'ai-summary' && ai.error && (
        <div className="db-pd-card" role="alert">
          <p className="db-pd-rail-note">{ai.error}</p>
          <div className="db-detail-actions">
            <button type="button" className="db-back-link" disabled={busy} onClick={() => void ai.load()}>Reload summary</button>
          </div>
        </div>
      )}

      {tab === 'ai-summary' && ai.state === 'loading' && (
        <section className="db-pd-card" aria-busy="true">
          <p className="db-pd-rail-note">Loading the stored AI summary�</p>
        </section>
      )}

      {tab === 'ai-summary' && ai.state === 'missing' && !ai.error && (
        <section className="db-pd-card">
          <div className="db-pd-card-head">
            <span className="db-pd-card-icon" aria-hidden="true"><Icon name="sparkle" size={20} /></span>
            <div className="db-pd-card-heading">
              <h2>No AI summary yet</h2>
              <p>Generate a summary from this patient's stored source records.</p>
            </div>
          </div>
          <div className="db-detail-actions">
            <button type="button" className="db-pd-quick-btn db-pd-quick-btn--primary" disabled={busy} onClick={() => void ai.generate(null)}>
              <Icon name="sparkle" size={18} /> {ai.action === 'generating' ? 'Generating�' : 'Generate Summary'}
            </button>
          </div>
        </section>
      )}

      {tab === 'ai-summary' && ai.state === 'ready' && ai.summary && aiView && section === 'summary' && (
        <SummaryPanel
          patientId={patientId}
          view={aiView.tab}
          claim={resolveActiveClaim(aiView.claims, null)}
          onNotice={openNotice}
          onExport={exportSummary}
          reviewed={ai.summary.review.reviewed}
          onReview={() => void ai.review(!ai.summary?.review.reviewed)}
          onRefresh={() => void ai.generate(ai.summary?.dataVersion ?? 0)}
          onOpenEvidence={() => { navigate(sectionHref(patientId, 'evidence')) }}
          busy={busy}
        />
      )}
      {tab === 'ai-summary' && ai.state === 'ready' && ai.summary && aiView && section === 'evidence' && (
        <EvidencePanel patientId={patientId} claims={aiView.claims} records={aiView.evidence} />
      )}
      {tab === 'ai-summary' && ai.state === 'ready' && ai.summary && aiView && section === 'data-quality' && (
        <DataQualityPanel view={aiView} onRefresh={() => void ai.refreshQuality()} busy={busy} />
      )}

      {tab === 'medical-record' && <TabUnavailable title="Medical Record" />}
      {tab === 'appointments' && <TabUnavailable title="Appointments" />}
      {tab === 'lab-results' && <TabUnavailable title="Lab Results" />}

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
    </div>
  )
}

export { PatientDetailPage }