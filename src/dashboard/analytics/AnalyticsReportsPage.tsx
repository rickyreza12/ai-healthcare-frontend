import { useState } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import {
  ANALYTICS_PAGE,
  DEPARTMENTS,
  METRICS,
  PATIENT_TYPES_TOTAL,
  PERIOD_CHOICES,
  REPORT_SUMMARY,
  SUPPLIED_PERIOD,
  VISIT_TRENDS,
} from './analyticsData.ts'
import {
  ChartBoundary,
  PatientTypesDonut,
  PatientTypesLegend,
  VisitTrendsChart,
  VisitTrendsTable,
} from './AnalyticsCharts.tsx'

import './analytics.css'

export function AnalyticsReportsPage() {
  const [notice, setNotice] = useState<Notice | null>(null)

  const onPeriodChange = (value: string) => {
    if (value === SUPPLIED_PERIOD) return
    setNotice({
      title: 'Report period',
      body: `Only the supplied ${SUPPLIED_PERIOD} report is part of this reference demo. The current report stays on screen.`,
    })
  }

  return (
    <div className="ana-page">
      <header className="ana-header">
        <div>
          <h1>{ANALYTICS_PAGE.heading}</h1>
          <p>{ANALYTICS_PAGE.supporting}</p>
        </div>
        <div className="ana-period">
          <label htmlFor="ana-period-select">Report period</label>
          <select id="ana-period-select" value={SUPPLIED_PERIOD} onChange={(event) => onPeriodChange(event.target.value)}>
            {PERIOD_CHOICES.map((choice) => (
              <option key={choice} value={choice}>{choice}</option>
            ))}
          </select>
        </div>
      </header>

      <ul className="ana-metrics" role="list">
        {METRICS.map((metric) => (
          <li key={metric.key} className={`ana-metric ana-metric--${metric.tone}`}>
            <span aria-hidden="true" className="ana-metric-swatch" />
            <div>
              <strong className="ana-metric-value">{metric.value}</strong>
              <span className="ana-metric-label">{metric.label}</span>
            </div>
            <span className={`ana-trend ana-trend--${metric.trendDirection.toLowerCase()}`}>
              <span aria-hidden="true">{metric.trendDirection === 'Up' ? '↑' : '↓'}</span>
              {metric.trendPercent}
              <span className="sr-only"> {metric.trendDirection}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="ana-row">
        <section className="ana-panel" aria-labelledby="ana-trends">
          <div className="ana-panel-head">
            <h2 id="ana-trends">Patient Visit Trends</h2>
            <span className="ana-period-pill">{VISIT_TRENDS.period}</span>
          </div>
          <ChartBoundary fallback={<VisitTrendsTable />}>
            <VisitTrendsChart />
          </ChartBoundary>
          <p className="ana-chart-note">{VISIT_TRENDS.note}</p>
        </section>

        <section className="ana-panel" aria-labelledby="ana-types">
          <div className="ana-panel-head">
            <h2 id="ana-types">Patient Types</h2>
          </div>
          <ChartBoundary fallback={<PatientTypesLegend />}>
            <PatientTypesDonut />
          </ChartBoundary>
        </section>
      </div>

      <div className="ana-row">
        <section className="ana-panel" aria-labelledby="ana-departments">
          <div className="ana-panel-head">
            <h2 id="ana-departments">Department Overview</h2>
          </div>
          <ul className="ana-departments" role="list">
            {DEPARTMENTS.map((department) => (
              <li key={department.label} className="ana-dept">
                <span className="ana-dept-label">{department.label}</span>
                <div
                  className="ana-dept-track"
                  role="progressbar"
                  aria-label={`${department.label}: ${department.count} patients, ${department.share} percent`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={department.share}
                >
                  <span
                    className="ana-dept-fill"
                    style={{ width: `${department.share}%`, background: department.color }}
                  />
                </div>
                <span className="ana-dept-count">{department.count}</span>
                <span className="ana-dept-share">{department.share}%</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ana-panel" aria-labelledby="ana-summary">
          <div className="ana-panel-head">
            <h2 id="ana-summary">Report Summary</h2>
          </div>
          <dl className="ana-summary">
            {REPORT_SUMMARY.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing the supplied {SUPPLIED_PERIOD} report. Patient types total {PATIENT_TYPES_TOTAL}.
      </p>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
    </div>
  )
}
