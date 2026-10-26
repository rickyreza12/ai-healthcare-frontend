import type { ReactNode } from 'react'
import { slugify, type PatientCategory, type Status } from './dashboardData.ts'
import type { DirectoryStatus } from './patients/patientDirectoryData.ts'

const glyph = {
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** Decorative panel glyphs sampled from the approved reference. */
export const PANEL_GLYPH = {
  trend: <svg {...glyph}><path d="M3 16.5 9 10.5l4 4 7.5-7.5" /><path d="M15 7h5.5v5.5" /></svg>,
  types: <svg {...glyph}><path d="M12 4.2v7.8" /><path d="M12 12l6.4 4.2" /><path d="M12 12 5.6 16.2" /><circle cx="12" cy="12" r="8.2" /></svg>,
  patients: <svg {...glyph}><circle cx="9" cy="8" r="3.2" /><path d="M2.8 20c.5-3.4 3-5.4 6.2-5.4s5.7 2 6.2 5.4" /><path d="M16.6 5.6a3.2 3.2 0 0 1 0 6.3" /><path d="M17.6 14.9c2 .7 3.3 2.4 3.7 5.1" /></svg>,
  calendar: <svg {...glyph}><rect x="3.2" y="4.8" width="17.6" height="16" rx="2.6" /><path d="M8 3v3.6M16 3v3.6M3.2 10.2h17.6" /></svg>,
}

export function PanelHeader({ id, title, icon, action }: {
  id: string
  title: string
  icon: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="db-panel-head">
      <span className="db-panel-icon" aria-hidden="true">{icon}</span>
      <h2 id={id}>{title}</h2>
      {action && <span className="db-panel-action">{action}</span>}
    </div>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`db-badge db-badge--${slugify(status)}`}>{status}</span>
}

export function TypeBadge({ category }: { category: PatientCategory }) {
  return <span className={`db-badge db-badge--${slugify(category)}`}>{category}</span>
}

/** Directory statuses use the reference pale tints; the label always carries the meaning. */
export function DirectoryStatusBadge({ status }: { status: DirectoryStatus }) {
  return <span className={`db-dir-badge db-dir-badge--${slugify(status)}`}>{status}</span>
}
