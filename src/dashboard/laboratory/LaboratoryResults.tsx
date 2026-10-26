import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CBC_ANALYTES,
  HEMOGLOBIN_TREND,
  LAB_RESULTS,
  RESULT_PATIENT,
  RESULTS_METRICS,
  RESULT_STATUSES,
  type LabResult,
} from './laboratoryData.ts'
import {
  ALL_STATUS,
  filterResults,
  findOrder,
  type ResultFilters,
} from './laboratoryLogic.ts'
import { HemoglobinTrend } from './LaboratoryCharts.tsx'
import { LabAvatar, LabGlyph } from './LaboratoryGlyphs.tsx'
import { LabEmpty, LabSearch, MetricGrid, PanelHeading, StatusChip } from './LaboratoryPrimitives.tsx'

export function LaboratoryResults({ initialStatus }: { initialStatus: ResultFilters['status'] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ResultFilters['status']>(initialStatus)
  const [selectedId, setSelectedId] = useState<string>(LAB_RESULTS[0].id)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const filters: ResultFilters = { query, status }
  const rows = useMemo(() => filterResults(filters, LAB_RESULTS), [filters.query, filters.status])
  const selected = rows.find((result) => result.id === selectedId) ?? rows[0]

  useEffect(() => {
    if (rows.length > 0 && !rows.some((result) => result.id === selectedId)) {
      setSelectedId(rows[0].id)
    }
  }, [rows, selectedId])

  const selectResult = (result: LabResult) => {
    setSelectedId(result.id)
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
      <MetricGrid metrics={RESULTS_METRICS} label="Laboratory result totals" />
      <div className="lab-results-layout">
        <section className="lab-panel lab-results-list" aria-labelledby="lab-results-title">
          <PanelHeading id="lab-results-title">
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="results" size={18} /></span>
            Laboratory Results
          </PanelHeading>

          <div className="lab-controls lab-controls--stack">
            <LabSearch
              id="lab-result-search"
              value={query}
              onChange={setQuery}
              placeholder="Search patient name, test, or order number…"
            />
            <div className="lab-control-row">
              <label className="sr-only" htmlFor="lab-result-status">Result status</label>
              <select
                id="lab-result-status"
                className="lab-select"
                value={status}
                onChange={(event) => setStatus(event.target.value as ResultFilters['status'])}
              >
                <option value={ALL_STATUS}>All Results</option>
                {RESULT_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <span className="lab-period-chip">Last 30 Days</span>
              {(query || status !== ALL_STATUS) && (
                <button type="button" className="lab-button lab-button--ghost" onClick={reset}>Clear</button>
              )}
            </div>
          </div>

          {rows.length > 0 ? (
            <table className="lab-table lab-table--results">
              <caption className="sr-only">Laboratory results. Select a row to open its details.</caption>
              <thead>
                <tr>
                  <th scope="col">Patient / Test</th>
                  <th scope="col">Order No.</th>
                  <th scope="col">Reported</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((result) => {
                  const order = findOrder(result.orderNumber)
                  const isSelected = selected?.id === result.id
                  return (
                    <tr key={result.id} className={`lab-row${isSelected ? ' lab-row--selected' : ''}`}>
                      <td data-label="Patient / Test">
                        <button
                          type="button"
                          className="lab-row-link lab-row-select"
                          aria-pressed={isSelected}
                          onClick={() => selectResult(result)}
                        >
                          <span className="lab-person">
                            <LabAvatar name={result.patientName} size={32} />
                            <span>
                              <strong>{result.patientName}</strong>
                              <small>{result.test}</small>
                            </span>
                          </span>
                        </button>
                      </td>
                      <td data-label="Order No.">{result.orderNumber}</td>
                      <td data-label="Reported">
                        <span>{result.time}</span>
                        <small className="lab-cell-sub">{result.dateGroup}</small>
                      </td>
                      <td data-label="Status"><StatusChip status={result.status} /></td>
                      <td className="lab-order-mobile-only" data-label="Specimen">{order?.specimenType ?? 'Not supplied'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <LabEmpty onReset={reset}>No laboratory results match these filters.</LabEmpty>
          )}
          <p className="lab-table-note">{rows.length} supplied result{rows.length === 1 ? '' : 's'} · Synthetic demonstration data</p>
        </section>

        <div ref={detailRef} className="lab-result-detail-wrap">
          {selected ? (
            <ResultDetail result={selected} />
          ) : (
            <section className="lab-panel lab-empty" aria-label="Result detail">
              <p>Select a result to review its supplied report.</p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

function ResultDetail({ result }: { result: LabResult }) {
  const order = findOrder(result.orderNumber)
  const isCbc = result.orderNumber === 'LB250513001'
  const patient = result.patientName === RESULT_PATIENT.name ? RESULT_PATIENT : null

  return (
    <section className="lab-panel lab-result-detail" aria-labelledby="lab-result-detail-title">
      <h2 id="lab-result-detail-title" className="sr-only">Result detail</h2>
      <div className="lab-result-patient">
        <LabAvatar name={result.patientName} size={64} />
        <div className="lab-result-patient-copy">
          <strong>{result.patientName}</strong>
          <span>
            {patient ? `${patient.patientId} · ${patient.age} · ${patient.gender}` : `${order?.patientId ?? 'Patient ID not supplied'}`}
          </span>
          {patient && <span className="lab-phone">☎ {patient.phone}</span>}
        </div>
        <StatusChip status={result.status} />
      </div>

      <div className="lab-result-test-head">
        <span className="lab-heading-icon lab-heading-icon--red" aria-hidden="true"><LabGlyph name="results" size={20} /></span>
        <div>
          <h3>{result.test}</h3>
          <p>{result.orderNumber}</p>
        </div>
        <StatusChip status={result.status} />
      </div>

      <dl className="lab-result-facts">
        <div><dt>Order No.</dt><dd>{result.orderNumber}</dd></div>
        <div><dt>Specimen</dt><dd>{order?.specimenType ?? 'Not supplied'}</dd></div>
        <div><dt>Requesting Doctor</dt><dd>Dr. Ahmad Rahman</dd></div>
        <div><dt>Completed At</dt><dd>13 May 2025, {result.time.replace('Yesterday, ', '')}</dd></div>
      </dl>

      {result.critical && (
        <div className="lab-critical-callout" role="note">
          <LabGlyph name="alert" size={18} />
          <div>
            <strong>Critical result</strong>
            <p>{result.summary}</p>
          </div>
        </div>
      )}

      {isCbc ? (
        <>
          <h3 className="lab-section-title">Results</h3>
          <table className="lab-table lab-table--analytes">
            <caption className="sr-only">Complete Blood Count analytes for {result.patientName}</caption>
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Result</th>
                <th scope="col">Reference Range</th>
                <th scope="col">Flag</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {CBC_ANALYTES.map((analyte) => (
                <tr key={analyte.id} className={analyte.status === 'Critical' ? 'lab-row--critical' : undefined}>
                  <td data-label="Test">{analyte.test}</td>
                  <td data-label="Result"><strong>{analyte.value}</strong> <span className="lab-unit">{analyte.unit}</span></td>
                  <td data-label="Reference Range">{analyte.referenceRange}</td>
                  <td data-label="Flag">{analyte.flag}</td>
                  <td data-label="Status"><StatusChip status={analyte.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lab-hemoglobin">
            <div className="lab-hemoglobin-head">
              <h3>Hemoglobin (Hgb)</h3>
              <span>Latest <strong>{HEMOGLOBIN_TREND.latest}</strong> <b>{HEMOGLOBIN_TREND.change}</b></span>
            </div>
            <HemoglobinTrend />
          </div>
        </>
      ) : (
        <div className="lab-result-summary">
          <h3 className="lab-section-title">Result summary</h3>
          <p>{result.summary}</p>
          <p className="lab-readonly-note">This supplied reference includes the result status, not analyte-level values, for this test.</p>
        </div>
      )}

      <p className="lab-readonly-note">
        Read-only reference report. Download, approval, clinician comments, and external sharing are not part of this demo.
      </p>
    </section>
  )
}
