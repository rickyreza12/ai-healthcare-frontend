import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AVATARS } from '../dashboardAssets.ts'
import { slugify } from '../dashboardData.ts'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import xrayAp from '../../assets/dashboard/medical-records/chest-xray-ap.png'
import xrayLateral from '../../assets/dashboard/medical-records/chest-xray-lateral.png'
import {
  CHEST_XRAY_DETAIL,
  MEDICAL_RECORDS,
  RECORD_CATEGORIES,
  RECORD_TOTAL,
  type MedicalRecord,
  type MedicalRecordType,
  type RecordIconKey,
  type RecordImage,
} from './medicalRecordData.ts'
import {
  ALL_MONTHS,
  ALL_STATUSES,
  ALL_TYPES,
  DEFAULT_RECORD_FILTERS,
  filterRecords,
  findRecord,
  groupRecords,
  isDefaultRecordFilters,
  recordMonths,
  recordStatuses,
  recordTypes,
  resolveRecordSelection,
  type RecordFilters,
} from './medicalRecordLogic.ts'

const TYPES = recordTypes(MEDICAL_RECORDS)
const MONTHS = recordMonths(MEDICAL_RECORDS)
const STATUSES = recordStatuses(MEDICAL_RECORDS)

const XRAY_SOURCES: Record<RecordImage['key'], string> = { ap: xrayAp, lateral: xrayLateral }

const glyph = {
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const RECORD_ICONS: Record<RecordIconKey, ReactNode> = {
  records: <svg {...glyph}><path d="M7 3.5h7.5L19 8v12.5H7z" /><path d="M14 3.5V8h5" /><path d="M9.5 12h7M9.5 16h5" /></svg>,
  stethoscope: <svg {...glyph}><path d="M6 3.5v5a4 4 0 0 0 8 0v-5" /><path d="M10 12.5v2a6 6 0 0 0 12 0v-2" /><circle cx="22" cy="10.5" r="1.6" /></svg>,
  flask: <svg {...glyph}><path d="M9 3.5h6" /><path d="M10.5 3.5v5L6.4 18a2 2 0 0 0 1.8 3h7.6a2 2 0 0 0 1.8-3l-4.1-9.5v-5" /><path d="M8.2 14.5h7.6" /></svg>,
  pill: <svg {...glyph}><rect x="2.8" y="8.6" width="18.4" height="6.8" rx="3.4" transform="rotate(-45 12 12)" /><path d="M9.1 7.2 16.8 14.9" /></svg>,
  image: <svg {...glyph}><rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.6" /><circle cx="9" cy="10" r="1.6" /><path d="M4 17.6 9.6 12l4 4 2.6-2.4 3.8 3.6" /></svg>,
  document: <svg {...glyph}><path d="M7 3.5h7.5L19 8v12.5H7z" /><path d="M14 3.5V8h5" /></svg>,
}

const SEARCH_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="6.4" />
    <path d="M15.6 15.6 20.5 20.5" />
  </svg>
)

const CHEVRON_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
)

const ZOOM_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.2" />
    <path d="M15.4 15.4 20 20M8.2 10.8h5.2M10.8 8.2v5.2" />
  </svg>
)

const DOWNLOAD_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
  </svg>
)

const MORE_GLYPH = (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
    <circle cx="5.6" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="18.4" cy="12" r="1.7" />
  </svg>
)

const PERSON_GLYPH = <svg {...glyph} width={17} height={17}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.6-3.6 3.2-5.6 7-5.6s6.4 2 7 5.6" /></svg>
const PIN_GLYPH = <svg {...glyph} width={17} height={17}><path d="M12 21s6.4-6 6.4-10.6A6.4 6.4 0 0 0 5.6 10.4C5.6 15 12 21 12 21z" /><circle cx="12" cy="10.2" r="2.4" /></svg>
const DOC_GLYPH = <svg {...glyph} width={17} height={17}><path d="M7 3.5h7.5L19 8v12.5H7z" /><path d="M14 3.5V8h5" /><path d="M9.5 13h7M9.5 16.5h5" /></svg>

const RESET_GLYPH = (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 5.5v5h5" />
    <path d="M5.8 14.6a7 7 0 1 0 1.1-6.9L4.5 10.5" />
  </svg>
)

function iconForType(type: MedicalRecordType): RecordIconKey {
  if (type === 'Consultation') return 'stethoscope'
  if (type === 'Lab Result') return 'flask'
  if (type === 'Prescription') return 'pill'
  if (type === 'Imaging') return 'image'
  return 'document'
}

function RecordRow({ record, active, onSelect }: { record: MedicalRecord; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={`db-mr-row${active ? ' db-mr-row--active' : ''}`}
      aria-pressed={active}
      data-record-id={record.id}
      aria-label={`Open ${record.title} record from ${record.date}, ${record.status.toLowerCase()}`}
      onClick={onSelect}
    >
      <span className={`db-mr-icon db-mr-icon--${record.tone}`}>{RECORD_ICONS[iconForType(record.type)]}</span>
      <span className="db-mr-row-main">
        <strong>{record.title}</strong>
        <span className="db-mr-row-meta">{record.type} • {record.clinician}</span>
      </span>
      <span className="db-mr-row-when">
        <span>{record.date}</span>
        <span>{record.time}</span>
      </span>
      <span className={`db-mr-status db-mr-status--${slugify(record.status)}`}>{record.status}</span>
      <span className="db-mr-chevron" aria-hidden="true">{CHEVRON_GLYPH}</span>
    </button>
  )
}

function DetailFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="db-mr-fact">
      <span className="db-mr-fact-icon" aria-hidden="true">{icon}</span>
      <span className="db-mr-fact-text">
        <strong>{value}</strong>
        <span>{label}</span>
      </span>
    </div>
  )
}

function RecordDetailPanel({ record, onClose, onOpenImage, onUnavailable, panelRef }: {
  record: MedicalRecord | undefined
  onClose: () => void
  onOpenImage: (image: RecordImage) => void
  onUnavailable: (title: string) => void
  panelRef: RefObject<HTMLElement | null>
}) {
  const titleId = useId()

  if (!record) {
    return (
      <aside className="db-mr-detail" aria-labelledby={titleId} ref={panelRef}>
        <h2 id={titleId} className="db-mr-detail-title">Record details</h2>
        <p className="db-mr-empty">Select a medical record to view its details.</p>
      </aside>
    )
  }

  const extended = record.id === CHEST_XRAY_DETAIL.recordId
  const detail = CHEST_XRAY_DETAIL

  return (
    <aside className="db-mr-detail" aria-labelledby={titleId} ref={panelRef}>
      <div className="db-mr-detail-head">
        <span className={`db-mr-icon db-mr-icon--${record.tone}`}>{RECORD_ICONS[iconForType(record.type)]}</span>
        <div className="db-mr-detail-heading">
          <div className="db-mr-detail-titlerow">
            <h2 id={titleId} className="db-mr-detail-title">{record.title}</h2>
            <span className={`db-mr-status db-mr-status--${slugify(record.status)}`}>{record.status}</span>
          </div>
          <p className="db-mr-detail-sub">{record.type} • {record.date}, {record.time}</p>
        </div>
        <button type="button" className="db-mr-detail-close" onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close record details</span>
        </button>
      </div>

      {!extended ? (
        <>
          <dl className="db-mr-detail-rows">
            <div><dt>Clinician</dt><dd>{record.clinician}</dd></div>
            <div><dt>Recorded</dt><dd>{record.date} at {record.time}</dd></div>
            <div><dt>Type</dt><dd>{record.type}</dd></div>
            <div><dt>Status</dt><dd>{record.status}</dd></div>
          </dl>
          <p className="db-mr-note">Extended record content is not included in this reference fixture.</p>
        </>
      ) : (
        <>
          <div className="db-mr-patient">
            <img src={AVATARS[detail.patientAvatar]} alt="" width={81} height={81} className="db-avatar" />
            <div className="db-mr-patient-text">
              <h3>{detail.patientName}</h3>
              <p>{detail.patientAge} years • {detail.patientGender} • Medical record ID: {detail.patientRecordLabel}</p>
            </div>
          </div>

          <div className="db-mr-facts">
            <DetailFact icon={PERSON_GLYPH} label={detail.specialty} value={record.clinician} />
            <DetailFact icon={PIN_GLYPH} label="Radiology Department" value={detail.department} />
            <DetailFact icon={DOC_GLYPH} label={detail.reason} value={detail.examination} />
          </div>

          <section className="db-mr-findings" aria-labelledby={`${titleId}-findings`}>
            <h3 id={`${titleId}-findings`}>Findings</h3>
            <p>{detail.findings}</p>
          </section>

          <div className="db-mr-section-head">
            <h3>Images ({detail.images.length})</h3>
            <button type="button" className="db-mr-link" onClick={() => onUnavailable('The reference report file is not available for download.')}>
              {DOWNLOAD_GLYPH} Download All
            </button>
          </div>

          <div className="db-mr-images">
            {detail.images.map((image) => (
              <figure className="db-mr-shot" key={image.key}>
                <img src={XRAY_SOURCES[image.key]} alt={image.alt} width={image.width} height={image.height} />
                <button
                  type="button"
                  className="db-mr-zoom"
                  aria-label={`Open ${image.label} full size`}
                  onClick={() => onOpenImage(image)}
                >
                  {ZOOM_GLYPH}
                </button>
                <figcaption className="db-mr-shot-label">{image.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="db-mr-section-head">
            <h3>Related Documents (1)</h3>
            <button type="button" className="db-mr-link" onClick={() => onUnavailable('The reference report file is not available for download.')}>
              {DOWNLOAD_GLYPH} Download
            </button>
          </div>

          <div className="db-mr-doc">
            <span className="db-mr-doc-icon" aria-hidden="true">{RECORD_ICONS.document}</span>
            <span className="db-mr-doc-text">
              <strong>{detail.documentTitle}</strong>
              <span>{detail.documentMeta}</span>
            </span>
            <button
              type="button"
              className="db-mr-doc-action"
              aria-label={`Download ${detail.documentTitle}`}
              onClick={() => onUnavailable('The reference report file is not available for download.')}
            >
              {DOWNLOAD_GLYPH}
            </button>
            <button
              type="button"
              className="db-mr-doc-action"
              aria-label={`More actions for ${detail.documentTitle}`}
              onClick={() => onUnavailable('The reference report file is not available for download.')}
            >
              {MORE_GLYPH}
            </button>
          </div>
        </>
      )}
    </aside>
  )
}

export function MedicalRecordsPage() {
  const [searchParams] = useSearchParams()
  const [selection, setSelection] = useState(() => resolveRecordSelection(MEDICAL_RECORDS, searchParams.get('record')))
  const [filters, setFilters] = useState<RecordFilters>(DEFAULT_RECORD_FILTERS)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [viewer, setViewer] = useState<RecordImage | null>(null)
  const detailRef = useRef<HTMLElement>(null)
  const viewerRef = useRef<HTMLDialogElement>(null)
  const viewerTrigger = useRef<HTMLElement | null>(null)
  const scrollOnSelect = useRef(false)
  const viewerTitleId = useId()

  const visible = filterRecords(MEDICAL_RECORDS, filters)
  const groups = groupRecords(visible)
  const selected = selection.selectedId ? findRecord(MEDICAL_RECORDS, selection.selectedId) : undefined
  // Filtering hides a selection whose record dropped out of the visible set.
  const visibleSelection = selected && visible.some((record) => record.id === selected.id) ? selected : undefined
  const isDefault = isDefaultRecordFilters(filters)

  useEffect(() => {
    if (!scrollOnSelect.current) return
    scrollOnSelect.current = false
    if (window.matchMedia('(max-width: 1023px)').matches) detailRef.current?.scrollIntoView({ block: 'start' })
  }, [selection.selectedId])

  useEffect(() => {
    const dialog = viewerRef.current
    if (!dialog) return
    if (viewer && !dialog.open) {
      viewerTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      dialog.showModal()
    }
    if (!viewer && dialog.open) dialog.close()
  }, [viewer])

  useEffect(() => {
    if (!viewer) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [viewer])

  function selectRecord(id: string) {
    scrollOnSelect.current = true
    setSelection({ selectedId: id, unknown: null })
  }

  function clearSelection() {
    const openId = selection.selectedId
    setSelection({ selectedId: null, unknown: null })
    if (openId) (document.querySelector(`[data-record-id="${openId}"]`) as HTMLElement | null)?.focus()
  }

  function applyFilters(patch: Partial<RecordFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  function unavailable(title: string) {
    setNotice({
      title,
      body: 'This workspace renders supplied reference records. The referenced report file is not part of the project, so nothing is downloaded.',
    })
  }

  return (
    <div className="db-mr">
      <div className="db-mr-body">
        <div className="db-mr-index">
          <div className="db-mr-head">
            <h1 className="db-mr-title">Medical Records</h1>
            <p className="db-mr-sub">Complete and organized patient medical records</p>
          </div>

          {selection.unknown && (
            <p className="db-mr-alert" role="status">
              No medical record matches “{selection.unknown}”. Showing all records instead.
            </p>
          )}

          <div className="db-mr-categories" role="group" aria-label="Record categories">
            {RECORD_CATEGORIES.map((category) => {
              const active = filters.category === category.key
              return (
                <button
                  key={category.key}
                  type="button"
                  className={`db-mr-cat${active ? ' db-mr-cat--active' : ''}`}
                  aria-pressed={active}
                  onClick={() => applyFilters({ category: category.key })}
                >
                  <span className="db-mr-cat-icon" aria-hidden="true">{RECORD_ICONS[category.icon]}</span>
                  <span className="db-mr-cat-label">{category.label}</span>
                  <span className="db-mr-cat-count">{category.count}</span>
                </button>
              )
            })}
          </div>

          <div className="db-mr-filters">
            <label className="db-field db-mr-search">
              <span className="db-field-label sr-only">Search</span>
              <span className="db-mr-search-icon" aria-hidden="true">{SEARCH_GLYPH}</span>
              <input
                type="search"
                className="db-mr-input"
                placeholder="Search by record title, doctor, or keyword"
                value={filters.query}
                onChange={(event) => applyFilters({ query: event.target.value })}
              />
            </label>

            <label className="db-field">
              <span className="db-field-label sr-only">Type</span>
              <select className="db-select" value={filters.type} onChange={(event) => applyFilters({ type: event.target.value as MedicalRecordType | typeof ALL_TYPES })}>
                <option value={ALL_TYPES}>All Types</option>
                {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label className="db-field">
              <span className="db-field-label sr-only">Date</span>
              <select className="db-select" value={filters.month} onChange={(event) => applyFilters({ month: event.target.value })}>
                <option value={ALL_MONTHS}>All Dates</option>
                {MONTHS.map((month) => <option key={month} value={month}>{month}</option>)}
              </select>
            </label>

            <label className="db-field">
              <span className="db-field-label sr-only">Status</span>
              <select className="db-select" value={filters.status} onChange={(event) => applyFilters({ status: event.target.value as typeof ALL_STATUSES })}>
                <option value={ALL_STATUSES}>All Statuses</option>
                {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>

            {!isDefault && (
              <button type="button" className="db-clear-filters" onClick={() => setFilters(DEFAULT_RECORD_FILTERS)}>
                {RESET_GLYPH}
                Clear Filters
              </button>
            )}
          </div>

          <section className="db-mr-list" aria-label="Medical record index">
            {groups.length === 0 ? (
              <div className="db-mr-empty-panel">
                <p className="db-mr-empty-title">No medical records match these filters.</p>
                <p className="db-mr-empty-text">
                  This view shows {MEDICAL_RECORDS.length} sample records from {RECORD_TOTAL} reference records. Adjust the
                  filters or clear them to see every sample record.
                </p>
                <button type="button" className="db-clear-filters" onClick={() => setFilters(DEFAULT_RECORD_FILTERS)}>
                  {RESET_GLYPH}
                  Clear filters
                </button>
              </div>
            ) : (
              groups.map((group) => (
                <div className="db-mr-group" key={group.month}>
                  <div className="db-mr-group-head">
                    <h2>{group.month}</h2>
                    <p>{group.records.length} {group.records.length === 1 ? 'record' : 'records'}</p>
                  </div>
                  <ul className="db-mr-rows" role="list">
                    {group.records.map((record) => (
                      <li key={record.id}>
                        <RecordRow
                          record={record}
                          active={visibleSelection?.id === record.id}
                          onSelect={() => selectRecord(record.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}

            {!isDefault && (
              <p className="db-mr-count">
                Showing {visible.length} of {MEDICAL_RECORDS.length} sample records
              </p>
            )}
          </section>
        </div>

        <RecordDetailPanel
          record={visibleSelection}
          onClose={clearSelection}
          onOpenImage={setViewer}
          onUnavailable={unavailable}
          panelRef={detailRef}
        />
      </div>

      <p className="db-mr-foot">
        Reference demo: these {MEDICAL_RECORDS.length} records, findings, images, and document details are supplied sample
        data. They are not live, synchronized, or medically validated.
      </p>

      <dialog
        ref={viewerRef}
        className="db-dialog db-dialog--viewer"
        aria-labelledby={viewerTitleId}
        onClose={() => {
          setViewer(null)
          viewerTrigger.current?.focus()
        }}
        onClick={(event) => { if (event.target === viewerRef.current) setViewer(null) }}
      >
        {viewer && (
          <div className="db-dialog-body">
            <button type="button" className="db-dialog-close" onClick={() => setViewer(null)}>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Close image viewer</span>
            </button>
            <h2 id={viewerTitleId} className="db-mr-viewer-title">Chest X-Ray • {viewer.label}</h2>
            <img className="db-mr-viewer-image" src={XRAY_SOURCES[viewer.key]} alt={viewer.alt} width={viewer.width} height={viewer.height} />
          </div>
        )}
      </dialog>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
    </div>
  )
}
