import { Component, type ReactNode } from 'react'
import {
  PATIENT_TYPES,
  PATIENT_TYPES_TOTAL,
  VISIT_TRENDS,
  donutSegments,
  valueToY,
} from './analyticsData.ts'

const PLOT = { left: 52, right: 648, top: 16, bottom: 236 } as const

const DONUT = { cx: 100, cy: 100, radius: 70, stroke: 32 } as const

/** Chart failure shows the accessible table instead of an empty canvas. */
export class ChartBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function VisitTrendsTable({ sr = false }: { sr?: boolean }) {
  return (
    <table className={sr ? 'ana-data-table ana-data-table--sr' : 'ana-data-table'}>
      <caption className="sr-only">Patient visit trends, both reference series by month</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Reference series A</th>
          <th scope="col">Reference series B</th>
        </tr>
      </thead>
      <tbody>
        {VISIT_TRENDS.months.map((month, index) => (
          <tr key={month}>
            <th scope="row">{month}</th>
            <td>{VISIT_TRENDS.seriesA[index]}</td>
            <td>{VISIT_TRENDS.seriesB[index]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function VisitTrendsChart() {
  const groupWidth = (PLOT.right - PLOT.left) / VISIT_TRENDS.months.length
  const barWidth = Math.min(26, groupWidth / 3)

  return (
    <figure className="ana-chart">
      <svg
        viewBox="0 0 680 270"
        role="img"
        aria-label="Grouped bar chart of monthly patient visits from January to June. Reference series A rises from 65 to 134; Reference series B rises from 60 to 114. Full values are listed in the data table."
        className="ana-bar-chart"
      >
        <defs />

        {VISIT_TRENDS.axis.map((tick) => {
          const y = valueToY(tick, 40, 140, PLOT.top, PLOT.bottom)
          return (
            <g key={tick}>
              <line x1={PLOT.left} y1={y} x2={PLOT.right} y2={y} className="ana-grid-line" />
              <text x={PLOT.left - 12} y={y + 4} textAnchor="end" className="ana-axis-label">{tick}</text>
            </g>
          )
        })}

        {VISIT_TRENDS.months.map((month, index) => {
          const groupCenter = PLOT.left + groupWidth * index + groupWidth / 2
          const valueA = VISIT_TRENDS.seriesA[index]
          const valueB = VISIT_TRENDS.seriesB[index]
          const yA = valueToY(valueA, 40, 140, PLOT.top, PLOT.bottom)
          const yB = valueToY(valueB, 40, 140, PLOT.top, PLOT.bottom)
          return (
            <g key={month}>
              <rect
                x={groupCenter - barWidth - 2}
                y={yA}
                width={barWidth}
                height={PLOT.bottom - yA}
                fill={VISIT_TRENDS.seriesAColor}
                rx="3"
              />
              <rect
                x={groupCenter + 2}
                y={yB}
                width={barWidth}
                height={PLOT.bottom - yB}
                fill={VISIT_TRENDS.seriesBColor}
                rx="3"
              />
              <text x={groupCenter} y={PLOT.bottom + 22} textAnchor="middle" className="ana-axis-label">{month}</text>
            </g>
          )
        })}
      </svg>
      <ul className="ana-legend" role="list">
        <li>
          <span aria-hidden="true" className="ana-swatch" style={{ background: VISIT_TRENDS.seriesAColor }} />
          Reference series A
        </li>
        <li>
          <span aria-hidden="true" className="ana-swatch" style={{ background: VISIT_TRENDS.seriesBColor }} />
          Reference series B
        </li>
      </ul>
      <VisitTrendsTable sr />
    </figure>
  )
}

export function PatientTypesLegend() {
  return (
    <ul className="ana-donut-legend" role="list">
      {PATIENT_TYPES.map((type) => (
        <li key={type.key}>
          <span aria-hidden="true" className="ana-swatch" style={{ background: type.color }} />
          <span className="ana-donut-label">{type.label}</span>
          <span className="ana-donut-percent">{type.percent}%</span>
        </li>
      ))}
    </ul>
  )
}

export function PatientTypesDonut() {
  const circumference = 2 * Math.PI * DONUT.radius
  const segments = donutSegments(PATIENT_TYPES)

  return (
    <figure className="ana-chart ana-donut-figure">
      <div className="ana-donut-wrap">
        <svg viewBox="0 0 200 200" role="img" aria-label="Doughnut chart of patient types. Maternity 40 percent, Pediatric 25 percent, OBGYN 20 percent, General 15 percent. 1,248 patients in total." className="ana-donut">
          <g transform="rotate(-90 100 100)">
            {segments.map((segment) => (
              <circle
                key={segment.label}
                cx={DONUT.cx}
                cy={DONUT.cy}
                r={DONUT.radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={DONUT.stroke}
                strokeDasharray={`${(segment.percent / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(segment.offsetPercent / 100) * circumference}
              />
            ))}
          </g>
          <text x="100" y="96" textAnchor="middle" className="ana-donut-total">{PATIENT_TYPES_TOTAL}</text>
          <text x="100" y="116" textAnchor="middle" className="ana-donut-caption">Patients</text>
        </svg>
        <PatientTypesLegend />
      </div>
    </figure>
  )
}
