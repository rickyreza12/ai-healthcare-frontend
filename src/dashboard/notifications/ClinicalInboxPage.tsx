import { useMemo, useRef, useState, type ReactNode } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import { ReadOnlyDialog } from '../ReadOnlyDialog.tsx'
import { AVATARS } from '../dashboardAssets.ts'
import {
  INBOX_FILTERS,
  INBOX_GLOBAL_COUNTS,
  INBOX_PAGE,
  INBOX_SORT_OPTIONS,
  SITI_DETAIL,
  type InboxItem,
  type InboxKind,
  type InboxPortrait,
  type VitalSign,
} from './clinicalInboxData.ts'
import {
  DEFAULT_INBOX_FILTERS,
  filterInbox,
  hasExtendedDetail,
  selectedInboxItem,
  type InboxFilters,
} from './clinicalInboxLogic.ts'

import avatarAhmadFadhil from '../../assets/dashboard/notifications/avatar_ahmad_fadhil.png'
import iconFollowup from '../../assets/dashboard/notifications/icon_followup.png'
import iconLab from '../../assets/dashboard/notifications/icon_lab.png'
import iconAppointment from '../../assets/dashboard/notifications/icon_appointment.png'
import vitalBp from '../../assets/dashboard/notifications/vital_bp.png'
import vitalHr from '../../assets/dashboard/notifications/vital_hr.png'
import vitalTemp from '../../assets/dashboard/notifications/vital_temp.png'
import vitalSpo2 from '../../assets/dashboard/notifications/vital_spo2.png'

import './clinicalInbox.css'

const PORTRAITS: Record<InboxPortrait, string> = {
  sitiAisyah: AVATARS.sitiAisyah,
  muhammadRizki: AVATARS.muhammadRizki,
  budiSantoso: AVATARS.budiSantoso,
  anitaDewi: AVATARS.anitaDewi,
  ahmadFadhil: avatarAhmadFadhil,
  followupIcon: iconFollowup,
  labIcon: iconLab,
  appointmentIcon: iconAppointment,
}

const VITAL_ICONS: Record<VitalSign['key'], string> = {
  bp: vitalBp,
  hr: vitalHr,
  temp: vitalTemp,
  spo2: vitalSpo2,
}

const KIND_TONE: Record<InboxKind, 'urgent' | 'message' | 'follow-up' | 'info'> = {
  Urgent: 'urgent',
  Message: 'message',
  'Follow-up': 'follow-up',
  Info: 'info',
}

const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'inbox-filter-icon' } as const

const FILTER_ICONS: Record<string, ReactNode> = {
  urgent: (
    <svg {...iconProps}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4" /><path d="M12 17.2v.1" /></svg>
  ),
  messages: (
    <svg {...iconProps} fill="currentColor" stroke="none"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9.4L4.8 20.4A.7.7 0 0 1 3.7 19.8V6a1 1 0 0 1 .3-1Z" /></svg>
  ),
  followUps: (
    <svg {...iconProps}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4M16 3v4" /></svg>
  ),
}

function rowAccessibleName(item: InboxItem): string {
  return `${item.sourceName}, ${item.referenceLabel}, ${item.subject}, ${item.kind}, ${item.timeLabel}. ${item.preview}`
}

export function ClinicalInboxPage() {
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_INBOX_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Mobile starts on the queue; on desktop the detail rail ignores this flag.
  const [detailOpen, setDetailOpen] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [conversationOpen, setConversationOpen] = useState(false)
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())
  const detailRef = useRef<HTMLElement>(null)

  const rows = useMemo(() => filterInbox(filters), [filters])
  const selected = selectedInboxItem(selectedId)
  const extended = hasExtendedDetail(selected)

  const selectRow = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
    // Tablet stacks the detail below the queue; bring it into view without animation.
    if (window.matchMedia('(min-width: 768px) and (max-width: 1180px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: 'start' }))
    }
  }

  const closeDetail = () => {
    const openerId = selected.id
    setDetailOpen(false)
    requestAnimationFrame(() => rowRefs.current.get(openerId)?.focus())
  }

  return (
    <div className={`inbox-page${detailOpen ? ' inbox-page--detail-open' : ''}`}>
      <div className="inbox-main">
      <header className="inbox-header">
        <div>
          <h1>{INBOX_PAGE.heading}</h1>
          <p>{INBOX_PAGE.supporting}</p>
        </div>
        <div className="inbox-sort">
          <label className="sr-only" htmlFor="inbox-sort-select">Sort</label>
          <select
            id="inbox-sort-select"
            value={filters.sort}
            onChange={(event) => setFilters({ ...filters, sort: event.target.value as InboxFilters['sort'] })}
          >
            {INBOX_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="inbox-filters" role="group" aria-label="Inbox filters">
        {INBOX_FILTERS.map((option) => {
          const active = filters.filter === option.key
          return (
            <button
              key={option.key}
              type="button"
              className={`inbox-filter inbox-filter--${option.key}${active ? ' inbox-filter--active' : ''}`}
              aria-pressed={active}
              onClick={() => setFilters({ ...filters, filter: option.key })}
            >
              {FILTER_ICONS[option.key]}
              {option.label}
            </button>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {rows.length} of {INBOX_GLOBAL_COUNTS.all} supplied inbox items shown.
      </p>

        {rows.length > 0 ? (
          <ul className="inbox-list">
            {rows.map((item) => {
              const active = item.id === selected.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) rowRefs.current.set(item.id, node)
                      else rowRefs.current.delete(item.id)
                    }}
                    className={`inbox-row inbox-row--${KIND_TONE[item.kind]}${active ? ' inbox-row--active' : ''}`}
                    aria-current={active ? 'true' : undefined}
                    aria-label={rowAccessibleName(item)}
                    onClick={() => selectRow(item.id)}
                  >
                    {item.unread && (
                      <span
                        aria-hidden="true"
                        className={`inbox-dot inbox-dot--${item.kind === 'Urgent' ? 'urgent' : 'message'}`}
                      />
                    )}
                    <img src={PORTRAITS[item.portrait]} alt="" aria-hidden="true" className="inbox-row-portrait" />
                    <span className="inbox-row-source">
                      <strong>{item.sourceName}</strong>
                      <small>{item.referenceLabel}</small>
                    </span>
                    <span className="inbox-row-body">
                      <span className="inbox-row-subject">
                        <strong>{item.subject}</strong>
                        <span className={`inbox-kind inbox-kind--${KIND_TONE[item.kind]}`}>{item.kind}</span>
                      </span>
                      <span className="inbox-row-preview">{item.preview}</span>
                    </span>
                    <span className="inbox-row-time">{item.timeLabel}</span>
                    <span aria-hidden="true" className="inbox-row-chevron">›</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="inbox-empty">
            <p>No inbox items match this filter.</p>
            <button type="button" onClick={() => setFilters(DEFAULT_INBOX_FILTERS)}>Reset filters</button>
          </div>
        )}
      </div>

        <aside ref={detailRef} className={`inbox-detail${detailOpen ? '' : ' inbox-detail--closed'}`} aria-label="Selected inbox detail">
          <button
            type="button"
            className="inbox-detail-close"
            onClick={closeDetail}
          >
            <span aria-hidden="true">←</span>
            Back to inbox
          </button>

          <div className="inbox-detail-card inbox-detail-identity">
            <img src={PORTRAITS[selected.portrait]} alt="" aria-hidden="true" />
            <div>
              <h2>{extended ? SITI_DETAIL.name : selected.sourceName}</h2>
              <p>
                {extended
                  ? `${SITI_DETAIL.gender} • ${SITI_DETAIL.age} • Patient ID: ${SITI_DETAIL.patientId}`
                  : selected.referenceLabel}
              </p>
              {extended && <p className="inbox-phone"><svg className="inbox-phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.6 3h3l1.5 4.5-2 1.4a12 12 0 0 0 6 6l1.4-2L21 14.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z" /></svg>{SITI_DETAIL.phone}</p>}
            </div>
            <span aria-hidden="true" className="inbox-detail-chevron">›</span>
          </div>

          {extended ? (
            <div className="inbox-detail-card inbox-alert">
              <span aria-hidden="true" className="inbox-alert-icon">!</span>
              <div>
                <div className="inbox-alert-head">
                  <h3>{SITI_DETAIL.alertTitle}</h3>
                  <span className="inbox-kind inbox-kind--urgent">{SITI_DETAIL.status}</span>
                </div>
                <p>{SITI_DETAIL.alertCopy}</p>
              </div>
            </div>
          ) : (
            <div className="inbox-detail-card inbox-subject">
              <div className="inbox-alert-head">
                <h3>{selected.subject}</h3>
                <span className={`inbox-kind inbox-kind--${KIND_TONE[selected.kind]}`}>{selected.kind}</span>
              </div>
              <p>{selected.preview}</p>
              <p className="inbox-subject-time">{selected.timeLabel}</p>
            </div>
          )}

          {extended && (
            <section className="inbox-detail-card" aria-labelledby="inbox-vitals">
              <div className="inbox-card-head">
                <h3 id="inbox-vitals">Latest Vital Signs</h3>
                <span>{SITI_DETAIL.vitalsRecordedAt}</span>
              </div>
              <ul className="inbox-vitals">
                {SITI_DETAIL.vitals.map((vital) => (
                  <li key={vital.key} className={`inbox-vital inbox-vital--${vital.status === 'High' ? 'high' : 'normal'}`}>
                    <img src={VITAL_ICONS[vital.key]} alt="" aria-hidden="true" />
                    <strong>{vital.value}</strong>
                    <span className="inbox-vital-unit">{vital.unit}{vital.status === 'High' && <span aria-hidden="true" className="inbox-vital-arrow">↑</span>}</span>
                    <span className={`inbox-kind inbox-kind--${vital.status === 'High' ? 'urgent' : 'info'}`}>{vital.status}</span>
                    <span className="inbox-vital-range">{vital.range}</span>
                    <span className="sr-only">{vital.metric}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {extended ? (
            <section className="inbox-detail-card" aria-labelledby="inbox-message">
              <div className="inbox-card-head">
                <h3 id="inbox-message">Message / Notes</h3>
              </div>
              <div className="inbox-message-from">
                <img src={AVATARS.sitiAisyah} alt="" aria-hidden="true" />
                <strong>{SITI_DETAIL.messageSender}</strong>
                <span>{SITI_DETAIL.messageTime}</span>
              </div>
              <p className="inbox-message-body">{SITI_DETAIL.messageBody}</p>
              <button type="button" className="inbox-conversation" onClick={() => setConversationOpen(true)}>
                <svg className="inbox-conversation-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9.4L4.8 20.4A.7.7 0 0 1 3.7 19.8V6a1 1 0 0 1 .3-1Z" /></svg>
                {SITI_DETAIL.conversationLabel}
                <span aria-hidden="true">›</span>
              </button>
            </section>
          ) : (
            <p className="inbox-detail-note">
              Extended detail (vital signs and message content) was supplied only for the Siti Aisyah reference item.
            </p>
          )}

          <section className="inbox-detail-card" aria-labelledby="inbox-actions">
            <div className="inbox-card-head">
              <h3 id="inbox-actions">Recommended Actions</h3>
            </div>
            <div className="inbox-actions">
              <button
                type="button"
                className="inbox-action inbox-action--primary"
                onClick={() =>
                  setNotice({
                    title: 'Contact Patient',
                    body: 'Calling and messaging patients are not available in this reference demo.',
                  })
                }
              >
                Contact Patient
              </button>
              <button
                type="button"
                className="inbox-action"
                onClick={() =>
                  setNotice({
                    title: 'Add Clinical Note',
                    body: 'Clinical note creation is not available in this reference demo.',
                  })
                }
              >
                Add Clinical Note
              </button>
              <button
                type="button"
                className="inbox-action"
                onClick={() =>
                  setNotice({
                    title: 'More Actions',
                    body: 'Alert acknowledgement and vital-sign updates are not available in this reference demo.',
                  })
                }
              >
                More Actions
              </button>
            </div>
          </section>
        </aside>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />

      <ReadOnlyDialog
        open={conversationOpen}
        title="Full conversation"
        onClose={() => setConversationOpen(false)}
      >
        <div className="inbox-message-from">
          <img src={AVATARS.sitiAisyah} alt="" aria-hidden="true" />
          <strong>{SITI_DETAIL.messageSender}</strong>
          <span>{SITI_DETAIL.messageTime}</span>
        </div>
        <p className="inbox-message-body">{SITI_DETAIL.messageBody}</p>
        <p className="db-readonly-note">
          Two additional reference messages were part of the supplied conversation label but were not supplied for this demo.
        </p>
      </ReadOnlyDialog>
    </div>
  )
}
