import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SPECIMEN_CHAIN,
  SPECIMEN_DETAIL_TABS,
  SPECIMEN_METRICS,
  SPECIMEN_STATUSES,
  SPECIMENS,
  type Specimen,
  type SpecimenDetailTab,
} from './laboratoryData.ts'
import {
  ALL_STATUS,
  filterSpecimens,
  type SpecimenFilters,
} from './laboratoryLogic.ts'
import { LabAvatar, LabGlyph } from './LaboratoryGlyphs.tsx'
import { LabEmpty, LabSearch, MetricGrid, PanelHeading, StatusChip } from './LaboratoryPrimitives.tsx'

export function LaboratorySpecimens() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<SpecimenFilters['status']>(ALL_STATUS)
  const [selectedId, setSelectedId] = useState(SPECIMENS[0].id)
  const detailRef = useRef<HTMLDivElement>(null)

  const filters: SpecimenFilters = { query, status }
  const rows = useMemo(() => filterSpecimens(filters, SPECIMENS), [filters.query, filters.status])
  const selected = rows.find((specimen) => specimen.id === selectedId) ?? rows[0]

  useEffect(() => {
    if (rows.length > 0 && !rows.some((specimen) => specimen.id === selectedId)) {
      setSelectedId(rows[0].id)
    }
  }, [rows, selectedId])

  const selectSpecimen = (specimen: Specimen) => {
    setSelectedId(specimen.id)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      window.setTimeout(() => detailRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 0)
    }
  }

  const reset = () => {
    setQuery('')
    setStatus(ALL_STATUS)
  }

  return (
    <>
      <MetricGrid metrics={SPECIMEN_METRICS} label="Specimen totals for today" />
      <div className="lab-specimen-layout">
        <section className="lab-panel lab-specimen-list" aria-labelledby="lab-specimen-title">
          <PanelHeading id="lab-specimen-title">
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="specimen" size={18} /></span>
            Specimen Tracking
          </PanelHeading>

          <div className="lab-controls lab-controls--stack">
            <LabSearch
              id="lab-specimen-search"
              value={query}
              onChange={setQuery}
              placeholder="Search specimen ID, patient name, or test group…"
            />
            <div className="lab-control-row">
              <label className="sr-only" htmlFor="lab-specimen-status">Specimen status</label>
              <select
                id="lab-specimen-status"
                className="lab-select"
                value={status}
                onChange={(event) => setStatus(event.target.value as SpecimenFilters['status'])}
              >
                <option value={ALL_STATUS}>All Status</option>
                {SPECIMEN_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <span className="lab-period-chip">Today</span>
              {(query || status !== ALL_STATUS) && (
                <button type="button" className="lab-button lab-button--ghost" onClick={reset}>Clear</button>
              )}
            </div>
          </div>

          {rows.length > 0 ? (
            <table className="lab-table lab-table--specimens">
              <caption className="sr-only">Laboratory specimens. Select a specimen ID to review its chain of custody.</caption>
              <thead>
                <tr>
                  <th scope="col">Specimen ID</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Test Group</th>
                  <th scope="col">Type</th>
                  <th scope="col">Collected</th>
                  <th scope="col">Location</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((specimen) => {
                  const isSelected = selected?.id === specimen.id
                  return (
                    <tr key={specimen.id} className={`lab-row${isSelected ? ' lab-row--selected' : ''}`}>
                      <td data-label="Specimen ID">
                        <button
                          type="button"
                          className="lab-row-link lab-specimen-id"
                          aria-pressed={isSelected}
                          onClick={() => selectSpecimen(specimen)}
                        >
                          {specimen.id}
                        </button>
                      </td>
                      <td data-label="Patient">
                        <span className="lab-person">
                          <LabAvatar name={specimen.patientName} size={28} />
                          <strong>{specimen.patientName}</strong>
                        </span>
                      </td>
                      <td data-label="Test Group">{specimen.testGroup}</td>
                      <td data-label="Type">{specimen.type}</td>
                      <td data-label="Collected">{specimen.collectionTime}</td>
                      <td data-label="Location">{specimen.location}</td>
                      <td data-label="Status"><StatusChip status={specimen.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <LabEmpty onReset={reset}>No specimens match these filters.</LabEmpty>
          )}
          <p className="lab-table-note">Showing {rows.length} of {SPECIMENS.length} supplied specimens · Synthetic demonstration data</p>
        </section>

        <div ref={detailRef} className="lab-specimen-detail-wrap">
          {selected ? (
            <SpecimenDetail specimen={selected} />
          ) : (
            <section className="lab-panel lab-empty" aria-label="Specimen detail">
              <p>Select a specimen to review its supplied tracking record.</p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

const STATUS_EVENT_COUNT: Record<string, number> = {
  Pending: 1,
  'In Transit': 2,
  Rejected: 3,
  Received: 4,
  'Recollect Needed': 4,
  Processing: 5,
  Stored: 5,
}

function chainEntries(specimen: Specimen) {
  if (specimen.id !== 'LB250513001') return derivedChainEntries(specimen)
  const visited = STATUS_EVENT_COUNT[specimen.status] ?? 4
  const entries = SPECIMEN_CHAIN.slice(0, visited).map((entry) => ({ ...entry, state: 'done' as const }))
  if (specimen.status === 'Rejected') {
    return [...entries, { id: 'rejected', label: 'Rejected at Laboratory', time: '11:40 AM', place: specimen.location, state: 'current' as const }]
  }
  if (specimen.status === 'Recollect Needed') {
    return [...entries, { id: 'recollect', label: 'Recollection Requested', time: '11:18 AM', place: specimen.location, state: 'current' as const }]
  }
  if (specimen.status === 'Stored') {
    return [...entries, { id: 'results', label: 'Results Available', time: '11:02 AM', place: specimen.location, state: 'done' as const }]
  }
  return [...entries, { id: 'results', label: 'Results Available', time: 'Pending', place: '—', state: 'pending' as const }]
}

/** Only the first specimen has supplied custody timestamps. Others show stage state without invented times. */
function derivedChainEntries(specimen: Specimen) {
  const depth: Record<Specimen['status'], number> = {
    Pending: 1,
    'In Transit': 2,
    Received: 3,
    Rejected: 3,
    'Recollect Needed': 3,
    Processing: 5,
    Stored: 5,
  }
  const steps = [
    { id: 'collected', label: 'Specimen Collected', place: 'Collection point' },
    { id: 'transit', label: 'In Transit to Laboratory', place: 'Internal Transport' },
    { id: 'received', label: 'Received at Laboratory', place: 'Lab Receiving' },
    { id: 'logged', label: 'Logged In & Verified', place: 'Lab Receiving' },
    { id: 'processing', label: 'In Processing', place: specimen.location },
    { id: 'results', label: 'Results Available', place: '—' },
  ]
  const reached = depth[specimen.status]
  const entries = steps.map((step, index) => {
    const done = index < reached
    const current = index === reached - 1 && specimen.status !== 'Stored' && specimen.status !== 'Rejected' && specimen.status !== 'Recollect Needed'
    return {
      ...step,
      time: step.id === 'collected' ? specimen.collectionTime : done || current ? 'Time not supplied' : 'Pending',
      state: done ? ('done' as const) : current ? ('current' as const) : ('pending' as const),
    }
  })
  if (specimen.status === 'Rejected' || specimen.status === 'Recollect Needed') {
    const rejected = specimen.status === 'Rejected'
    entries.push({
      id: rejected ? 'rejected' : 'recollect',
      label: rejected ? 'Rejected at Laboratory' : 'Recollection Requested',
      time: 'Time not supplied',
      place: specimen.location,
      state: 'current',
    })
  }
  return entries
}

function SpecimenDetail({ specimen }: { specimen: Specimen }) {
  const [tab, setTab] = useState<SpecimenDetailTab>('Chain of Custody')
  const entries = chainEntries(specimen)

  return (
    <section className="lab-panel lab-specimen-detail" aria-labelledby="lab-specimen-detail-title">
      <h2 id="lab-specimen-detail-title" className="sr-only">Specimen detail</h2>
      <div className="lab-specimen-head">
        <div>
          <span className="lab-specimen-kicker">Specimen ID</span>
          <strong>{specimen.id}</strong>
        </div>
        <StatusChip status={specimen.status} />
      </div>

      <div className="lab-result-patient lab-result-patient--compact">
        <LabAvatar name={specimen.patientName} size={52} />
        <div className="lab-result-patient-copy">
          <strong>{specimen.patientName}</strong>
          <span>{specimen.testGroup}</span>
        </div>
      </div>

      <dl className="lab-specimen-facts">
        <div><dt>Test Group</dt><dd>{specimen.testGroup}</dd></div>
        <div><dt>Ordered Tests</dt><dd>{specimen.testGroup}</dd></div>
        <div><dt>Specimen Type</dt><dd>{specimen.type}</dd></div>
        <div><dt>Collection Time</dt><dd>{specimen.collectionTime}</dd></div>
        <div><dt>Collected By</dt><dd>{specimen.collector}</dd></div>
        <div><dt>Current Location</dt><dd>{specimen.location}</dd></div>
        <div><dt>Temperature</dt><dd>{specimen.temperature}</dd></div>
        <div><dt>Status</dt><dd><StatusChip status={specimen.status} /></dd></div>
      </dl>

      <div className="lab-detail-tabs" role="group" aria-label="Specimen detail sections">
        {SPECIMEN_DETAIL_TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={`lab-detail-tab${tab === item ? ' lab-detail-tab--active' : ''}`}
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Chain of Custody' && (
        <ol className="lab-chain" role="list">
          {entries.map((entry) => (
            <li key={entry.id} className={`lab-chain-step lab-chain-step--${entry.state}`}>
              <span className="lab-chain-dot" aria-hidden="true" />
              <div>
                <strong>{entry.label}</strong>
                <span>{entry.time}</span>
              </div>
              <small>{entry.place}</small>
            </li>
          ))}
        </ol>
      )}

      {tab === 'Specimen Details' && (
        <dl className="lab-fact-grid lab-fact-grid--single">
          <div><dt>Specimen ID</dt><dd>{specimen.id}</dd></div>
          <div><dt>Patient</dt><dd>{specimen.patientName}</dd></div>
          <div><dt>Specimen Type</dt><dd>{specimen.type}</dd></div>
          <div><dt>Collection Time</dt><dd>{specimen.collectionTime}</dd></div>
          <div><dt>Collector</dt><dd>{specimen.collector}</dd></div>
          <div><dt>Location</dt><dd>{specimen.location}</dd></div>
          <div><dt>Temperature</dt><dd>{specimen.temperature}</dd></div>
        </dl>
      )}

      {tab === 'Handling Notes' && (
        <div className="lab-handling-note">
          <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="report" size={18} /></span>
          <p>{specimen.handlingNote}</p>
        </div>
      )}

      <p className="lab-readonly-note">Read-only specimen record. No courier telemetry, GPS, analyzer connection, or live temperature feed is included.</p>
    </section>
  )
}
