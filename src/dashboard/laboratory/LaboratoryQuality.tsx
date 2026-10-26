import { useMemo, useState } from 'react'
import {
  QC_ALERTS,
  QC_ANALYZERS,
  QC_CHART,
  QC_EQUIPMENT,
  QC_METRICS,
  QC_RUNS,
  QC_STATUSES,
} from './laboratoryData.ts'
import {
  ALL_ANALYZERS,
  ALL_STATUS,
  DEFAULT_QC_FILTERS,
  filterQcRuns,
  isDefaultQcFilters,
  type QcFilters,
} from './laboratoryLogic.ts'
import { LeveyJenningsChart } from './LaboratoryCharts.tsx'
import { LabGlyph } from './LaboratoryGlyphs.tsx'
import { LabEmpty, LabSearch, MetricGrid, PanelHeading, StatusChip } from './LaboratoryPrimitives.tsx'

type AlertView = 'active' | 'resolved' | 'audit'

export function LaboratoryQuality() {
  const [filters, setFilters] = useState<QcFilters>(DEFAULT_QC_FILTERS)
  const [alertView, setAlertView] = useState<AlertView>('active')
  const rows = useMemo(() => filterQcRuns(filters, QC_RUNS), [filters])

  return (
    <>
      <MetricGrid metrics={QC_METRICS} label="Quality control summary" />
      <div className="lab-qc-top">
        <section className="lab-panel" aria-labelledby="lab-qc-chart-title">
          <PanelHeading id="lab-qc-chart-title" aside={<span className="lab-period-chip">{QC_CHART.period}</span>}>
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="results" size={18} /></span>
            {QC_CHART.title}
          </PanelHeading>
          <p className="lab-panel-subtitle">{QC_CHART.subtitle}</p>
          <p className="lab-panel-measure">{QC_CHART.measureLabel}</p>
          <LeveyJenningsChart />
        </section>

        <section className="lab-panel" aria-labelledby="lab-qc-alerts-title">
          <PanelHeading id="lab-qc-alerts-title">
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="alert" size={18} /></span>
            QC Alerts &amp; Rule Violations
          </PanelHeading>
          <div className="lab-alert-tabs" role="group" aria-label="Quality alert views">
            <button type="button" aria-pressed={alertView === 'active'} onClick={() => setAlertView('active')}>
              Active Alerts (2)
            </button>
            <button type="button" aria-pressed={alertView === 'resolved'} onClick={() => setAlertView('resolved')}>
              Resolved (0)
            </button>
            <button type="button" aria-pressed={alertView === 'audit'} onClick={() => setAlertView('audit')}>
              Audit Log
            </button>
          </div>

          {alertView === 'active' && (
            <ul className="lab-qc-alert-list" role="list">
              {QC_ALERTS.map((alert) => (
                <li key={alert.id} className={`lab-qc-alert lab-qc-alert--${alert.severity.toLowerCase()}`}>
                  <div className="lab-qc-alert-head">
                    <strong><span aria-hidden="true">●</span> {alert.title}</strong>
                    <StatusChip status={alert.severity} />
                  </div>
                  <p>{alert.body}</p>
                  <small>{alert.meta}</small>
                </li>
              ))}
            </ul>
          )}

          {alertView === 'resolved' && (
            <LabEmpty>No resolved quality-control alerts are included in this reference fixture.</LabEmpty>
          )}
          {alertView === 'audit' && (
            <LabEmpty>No quality-control audit-log entries are included in this reference fixture.</LabEmpty>
          )}
        </section>
      </div>

      <div className="lab-qc-bottom">
        <section className="lab-panel" aria-labelledby="lab-qc-runs-title">
          <PanelHeading id="lab-qc-runs-title" aside={<span className="lab-period-chip">Supplied runs</span>}>
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="orders" size={18} /></span>
            Recent QC Runs
          </PanelHeading>

          <div className="lab-controls lab-controls--qc">
            <LabSearch
              id="lab-qc-search"
              value={filters.query}
              onChange={(query) => setFilters({ ...filters, query })}
              placeholder="Search test, analyzer, or rule…"
            />
            <label className="sr-only" htmlFor="lab-qc-analyzer">Analyzer</label>
            <select
              id="lab-qc-analyzer"
              className="lab-select"
              value={filters.analyzer}
              onChange={(event) => setFilters({ ...filters, analyzer: event.target.value })}
            >
              <option value={ALL_ANALYZERS}>All Analyzers</option>
              {QC_ANALYZERS.map((analyzer) => <option key={analyzer} value={analyzer}>{analyzer}</option>)}
            </select>
            <label className="sr-only" htmlFor="lab-qc-status">QC run status</label>
            <select
              id="lab-qc-status"
              className="lab-select"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value as QcFilters['status'] })}
            >
              <option value={ALL_STATUS}>All Status</option>
              {QC_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            {!isDefaultQcFilters(filters) && (
              <button type="button" className="lab-button lab-button--ghost" onClick={() => setFilters(DEFAULT_QC_FILTERS)}>Clear</button>
            )}
          </div>

          {rows.length > 0 ? (
            <table className="lab-table lab-table--qc">
              <caption className="sr-only">Recent quality-control runs</caption>
              <thead>
                <tr>
                  <th scope="col">Run Date</th>
                  <th scope="col">Test / Control</th>
                  <th scope="col">Analyzer</th>
                  <th scope="col">Observed</th>
                  <th scope="col">Range</th>
                  <th scope="col">Rule</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((run) => (
                  <tr key={run.id}>
                    <td data-label="Run Date"><span>{run.date}</span><small className="lab-cell-sub">{run.time}</small></td>
                    <td data-label="Test / Control">{run.test}</td>
                    <td data-label="Analyzer">{run.analyzer}</td>
                    <td data-label="Observed">{run.observed}</td>
                    <td data-label="Range">{run.range}</td>
                    <td data-label="Rule">{run.rule}</td>
                    <td data-label="Status"><StatusChip status={run.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <LabEmpty onReset={() => setFilters(DEFAULT_QC_FILTERS)}>No quality-control runs match these filters.</LabEmpty>
          )}
          <p className="lab-table-note">Showing {rows.length} of {QC_RUNS.length} supplied runs · Synthetic demonstration data</p>
        </section>

        <section className="lab-panel" aria-labelledby="lab-qc-equipment-title">
          <PanelHeading id="lab-qc-equipment-title">
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="flask" size={18} /></span>
            Equipment &amp; Calibration
          </PanelHeading>
          <ul className="lab-equipment" role="list">
            {QC_EQUIPMENT.map((equipment) => (
              <li key={equipment.id}>
                <span className="lab-equipment-icon" aria-hidden="true"><LabGlyph name="flask" size={20} /></span>
                <div>
                  <strong>{equipment.name}</strong>
                  <p>{equipment.detail}</p>
                </div>
                <StatusChip status={equipment.status} />
              </li>
            ))}
          </ul>
          <p className="lab-demo-stamp">ILLUSTRATIVE MOCKUP · Synthetic laboratory quality-control data only</p>
        </section>
      </div>
    </>
  )
}
