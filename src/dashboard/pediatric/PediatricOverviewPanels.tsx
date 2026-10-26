import type { ReactNode } from 'react'
import { PANEL_GLYPH } from '../DashboardPrimitives.tsx'
import { PEDIATRIC_CHECK, PEDIATRIC_GLYPHS } from './pediatricGlyphs.tsx'
import {
  GROWTH_SUMMARY,
  MILESTONES,
  NEXT_VISIT,
  RECENT_NOTE,
  VACCINATIONS,
  type GrowthMetricId,
} from './pediatricData.ts'

import metricHeight from '../../assets/dashboard/pediatric/pediatric_metric_height.png'
import metricWeight from '../../assets/dashboard/pediatric/pediatric_metric_weight.png'
import metricBmi from '../../assets/dashboard/pediatric/pediatric_metric_bmi.png'
import metricOverall from '../../assets/dashboard/pediatric/pediatric_metric_overall_growth.png'
import nextVisitCalendar from '../../assets/dashboard/pediatric/pediatric_next_visit_calendar.png'
import vaccinationArt from '../../assets/dashboard/pediatric/pediatric_next_vaccination.png'
import vaccinationShield from '../../assets/dashboard/pediatric/pediatric_vaccination_shield.png'

export const GROWTH_METRIC_ART: Record<GrowthMetricId, string> = {
  height: metricHeight,
  weight: metricWeight,
  bmi: metricBmi,
  overall: metricOverall,
}

export const PEDIATRIC_SECTION_ICONS = {
  nextVisit: nextVisitCalendar,
  vaccinationArt,
  vaccinationShield,
}

function CardHead({ id, title, icon, glyph, action }: {
  id: string
  title: string
  icon?: string
  glyph?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="db-ped-head">
      <span className="db-ped-head-icon" aria-hidden="true">
        {icon ? <img src={icon} alt="" width={20} height={20} /> : glyph}
      </span>
      <h2 id={id}>{title}</h2>
      {action}
    </div>
  )
}

export function PediatricMetricRow({ className }: { className?: string }) {
  return (
    <ul className={`db-ped-metrics${className ? ` ${className}` : ''}`} role="list">
      {GROWTH_SUMMARY.map((metric) => (
        <li key={metric.id} className="db-ped-metric">
          <img
            src={GROWTH_METRIC_ART[metric.id]}
            alt=""
            width={56}
            height={56}
            className="db-ped-metric-icon"
          />
          <div className="db-ped-metric-text">
            <p className="db-ped-metric-label">{metric.label}</p>
            <p className="db-ped-metric-value">
              {metric.value}
              {metric.unit && <em> {metric.unit}</em>}
            </p>
            {metric.percentile && (
              <p className="db-ped-metric-percentile">
                {metric.percentile}
                <span aria-hidden="true">{PEDIATRIC_GLYPHS.arrowUp}</span>
              </p>
            )}
            <p className="db-ped-metric-caption">{metric.caption}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function PediatricNextVisitCard({ onUnavailable, onOpenVisit, className }: {
  onUnavailable: (label: string) => void
  onOpenVisit: () => void
  className?: string
}) {
  return (
    <section className={`db-panel db-ped-card${className ? ` ${className}` : ''}`} aria-labelledby="ped-next-visit">
      <CardHead id="ped-next-visit" title="Next Vaccination / Visit" icon={PEDIATRIC_SECTION_ICONS.nextVisit} />
      <button type="button" className="db-ped-visit" onClick={onOpenVisit}>
        <img
          src={PEDIATRIC_SECTION_ICONS.vaccinationArt}
          alt=""
          width={56}
          height={64}
          className="db-ped-visit-art"
        />
        <span className="db-ped-visit-text">
          <span className="db-ped-visit-name">{NEXT_VISIT.vaccine}</span>
          <span className="db-ped-visit-meta">
            Recommended Age: {NEXT_VISIT.recommendedAge}
          </span>
          <span className="db-ped-visit-meta">
            Due Date: <strong>{NEXT_VISIT.dueDate}</strong>
            <span className="db-ped-visit-relative">{NEXT_VISIT.relativeLabel}</span>
          </span>
        </span>
        <span className="db-ped-chevron" aria-hidden="true">{PEDIATRIC_GLYPHS.chevron}</span>
      </button>
      <button type="button" className="db-ped-btn db-ped-btn--primary" onClick={() => onUnavailable('Appointment scheduling')}>
        <span aria-hidden="true">{PANEL_GLYPH.calendar}</span>
        Schedule Appointment
      </button>
    </section>
  )
}

export function PediatricMilestonesCard({ onOpenAll, className }: { onOpenAll: () => void; className?: string }) {
  return (
    <section className={`db-panel db-ped-card${className ? ` ${className}` : ''}`} aria-labelledby="ped-milestones">
      <CardHead
        id="ped-milestones"
        title="Developmental Milestones"
        glyph={PEDIATRIC_GLYPHS.star}
        action={
          <button type="button" className="db-ped-link" onClick={onOpenAll}>See All</button>
        }
      />
      <ul className="db-ped-rows">
        {MILESTONES.map((milestone) => (
          <li key={milestone.id}>
            <span className="db-ped-mark" aria-hidden="true">{PEDIATRIC_CHECK}</span>
            <span className="db-ped-row-label">{milestone.label}</span>
            <span className="db-ped-status">{milestone.status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PediatricVaccinationsCard({ onOpenFull, className }: { onOpenFull: () => void; className?: string }) {
  return (
    <section className={`db-panel db-ped-card${className ? ` ${className}` : ''}`} aria-labelledby="ped-vaccinations">
      <CardHead
        id="ped-vaccinations"
        title="Vaccination History"
        icon={PEDIATRIC_SECTION_ICONS.vaccinationShield}
        action={
          <button type="button" className="db-ped-link" onClick={onOpenFull}>See Full History</button>
        }
      />

      <div className="db-ped-table-wrap">
        <table className="db-ped-table">
          <caption className="sr-only">Vaccination history in the supplied reference order</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Vaccine</th>
              <th scope="col">Dose</th>
              <th scope="col">Status</th>
              <th scope="col">Next Due</th>
            </tr>
          </thead>
          <tbody>
            {VACCINATIONS.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span className="db-ped-mark" aria-hidden="true">{PEDIATRIC_CHECK}</span>
                  <span className="db-ped-table-date">{entry.date}</span>
                </td>
                <td>{entry.vaccine}</td>
                <td>{entry.dose}</td>
                <td><span className="db-ped-status">{entry.status}</span></td>
                <td>{entry.nextDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="db-ped-cards">
        {VACCINATIONS.map((entry) => (
          <li key={entry.id}>
            <span className="db-ped-mark" aria-hidden="true">{PEDIATRIC_CHECK}</span>
            <span className="db-ped-card-text">
              <strong>{entry.vaccine}</strong>
              <span>{entry.date} • Dose {entry.dose}</span>
              <span>Next due: {entry.nextDue}</span>
            </span>
            <span className="db-ped-status">{entry.status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PediatricNotesCard({ onOpenAll, className }: { onOpenAll: () => void; className?: string }) {
  return (
    <section className={`db-panel db-ped-card${className ? ` ${className}` : ''}`} aria-labelledby="ped-notes">
      <CardHead
        id="ped-notes"
        title="Recent Notes"
        glyph={PEDIATRIC_GLYPHS.document}
        action={<button type="button" className="db-ped-link" onClick={onOpenAll}>See All</button>}
      />
      <div className="db-ped-note">
        <p className="db-ped-note-meta">
          <span>{RECENT_NOTE.date}</span>
          <span>{RECENT_NOTE.clinician}</span>
          <span>{RECENT_NOTE.visit}</span>
        </p>
        <p className="db-ped-note-body">{RECENT_NOTE.body}</p>
        <button type="button" className="db-ped-more" onClick={onOpenAll}>
          <span aria-hidden="true">{PEDIATRIC_GLYPHS.chevron}</span>
          <span className="sr-only">Open this note and any other reference notes</span>
        </button>
      </div>
    </section>
  )
}
