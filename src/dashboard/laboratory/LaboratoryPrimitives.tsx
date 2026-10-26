import type { ReactNode } from 'react'
import type { LabMetric } from './laboratoryData.ts'
import { LabGlyph } from './LaboratoryGlyphs.tsx'

export function MetricGrid({ metrics, label }: { metrics: readonly LabMetric[]; label: string }) {
  return (
    <ul className={`lab-metrics${metrics.length === 4 ? ' lab-metrics--four' : ''}`} aria-label={label} role="list">
      {metrics.map((metric) => (
        <li key={metric.key} className={`lab-metric lab-metric--${metric.tone}`}>
          <span className="lab-metric-icon" aria-hidden="true"><LabGlyph name={metric.glyph} size={22} /></span>
          <span className="lab-metric-copy">
            <strong className="lab-metric-value">{metric.value}</strong>
            <span className="lab-metric-label">{metric.label}</span>
            <span className={`lab-metric-comparison${metric.direction ? ` lab-metric-comparison--${metric.direction}` : ''}`}>
              {metric.direction && (
                <span aria-hidden="true">{metric.direction === 'up' ? '↑' : '↓'}</span>
              )}
              {metric.comparison}
              {metric.direction && <span className="sr-only"> (trend {metric.direction})</span>}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const STATUS_TONE: Record<string, string> = {
  Completed: 'green',
  Processing: 'blue',
  Collected: 'green',
  Pending: 'amber',
  Rejected: 'red',
  Received: 'green',
  'In Transit': 'blue',
  Stored: 'green',
  'Recollect Needed': 'violet',
  Critical: 'red',
  Abnormal: 'amber',
  Normal: 'green',
  Pass: 'green',
  Fail: 'red',
  Operational: 'green',
  'Due Soon': 'amber',
  Scheduled: 'blue',
  'In Progress': 'blue',
  Warning: 'amber',
}

export function StatusChip({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? 'slate'
  return <span className={`lab-status lab-status--${tone}`}>{status}</span>
}

export function LabSearch({ id, value, onChange, placeholder }: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="lab-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <label className="sr-only" htmlFor={id}>Search</label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export function LabEmpty({ children, onReset }: { children: ReactNode; onReset?: () => void }) {
  return (
    <div className="lab-empty">
      <p>{children}</p>
      {onReset && <button type="button" className="lab-button lab-button--secondary" onClick={onReset}>Reset filters</button>}
    </div>
  )
}

export function PanelHeading({ id, children, aside }: { id: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="lab-panel-head">
      <h2 id={id}>{children}</h2>
      {aside}
    </div>
  )
}

export function DirectionMark({ direction }: { direction: 'up' | 'down' }) {
  return <span aria-hidden="true">{direction === 'up' ? '↑' : '↓'}</span>
}
