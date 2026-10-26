import { useId } from 'react'
import {
  AGE_TICKS,
  GROWTH_SERIES_TABS,
  HEIGHT_DOMAIN,
  HEIGHT_HIGHLIGHT,
  HEIGHT_SERIES,
  HEIGHT_TICKS,
} from './pediatricData.ts'
import { findSeries, pointPosition, toPolylinePoints } from './pediatricLogic.ts'

import chartMark from '../../assets/dashboard/pediatric/pediatric_growth_chart_mark.png'

/** Prose alternative for the plotted lines, so the chart is not image-only. */
function describeChart(): string {
  const lines = HEIGHT_SERIES.filter((series) => !series.patient).map((series) => {
    const first = series.points[0]
    const last = series.points[series.points.length - 1]
    return `${series.label} runs from ${first?.value} centimetres at age 0 to ${last?.value} centimetres at age 7.`
  })
  const patient = findSeries(HEIGHT_SERIES, HEIGHT_HIGHLIGHT.seriesKey)
  const readings = (patient?.points ?? [])
    .map((point) => `${point.ageYears} years, ${point.value} centimetres`)
    .join('; ')
  return [
    'Height in centimetres against age in years, from 0 to 7 years.',
    ...lines,
    `${patient?.label ?? 'Patient growth'} is plotted at ${readings}.`,
    `The highlighted value is ${HEIGHT_HIGHLIGHT.valueLabel} at ${HEIGHT_HIGHLIGHT.ageLabel}, ${HEIGHT_HIGHLIGHT.percentileLabel}.`,
  ].join(' ')
}

export function PediatricGrowthChart({ onUnavailable, className }: { onUnavailable: (label: string) => void; className?: string }) {
  const id = useId()
  const patient = findSeries(HEIGHT_SERIES, HEIGHT_HIGHLIGHT.seriesKey)
  const highlight = pointPosition(
    { ageYears: HEIGHT_HIGHLIGHT.ageYears, value: HEIGHT_HIGHLIGHT.value },
    HEIGHT_DOMAIN,
  )

  return (
    <section className={`db-panel db-ped-card${className ? ` ${className}` : ''}`} aria-labelledby={id}>
      <div className="db-ped-head">
        <span className="db-ped-head-icon" aria-hidden="true">
          <img src={chartMark} alt="" width={20} height={20} />
        </span>
        <h2 id={id}>Growth Chart</h2>
        <div className="db-ped-seg" role="group" aria-label="Growth chart measure">
          {GROWTH_SERIES_TABS.map((tab) => {
            const active = tab.id === 'height'
            return (
              <button
                key={tab.id}
                type="button"
                className={`db-ped-seg-btn${active ? ' db-ped-seg-btn--active' : ''}`}
                aria-pressed={active}
                onClick={() => { if (!active) onUnavailable(`${tab.label} chart`) }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="db-ped-chart-body">
        <div className="db-ped-plot-row">
          <div className="db-ped-plot">
            <p className="db-ped-plot-y-title">Height (cm)</p>
            <ul className="db-ped-plot-y">
              {HEIGHT_TICKS.map((tick) => {
                const top = 100 - ((tick - HEIGHT_DOMAIN.yMin) / (HEIGHT_DOMAIN.yMax - HEIGHT_DOMAIN.yMin)) * 100
                return <li key={tick} style={{ top: `${top}%` }}>{tick}</li>
              })}
            </ul>
            <div className="db-ped-plot-area">
              <svg
                className="db-ped-plot-lines"
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                role="img"
                aria-labelledby={`${id}-title`}
                aria-describedby={`${id}-desc`}
              >
              <title id={`${id}-title`}>Growth chart: height for age</title>
              <desc id={`${id}-desc`}>{describeChart()}</desc>
              {HEIGHT_SERIES.map((series) => (
                <polyline
                  key={series.key}
                  className={`db-ped-line db-ped-line--${series.tone}`}
                  points={toPolylinePoints(series.points, HEIGHT_DOMAIN)}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {(patient?.points ?? []).map((point) => {
              const position = pointPosition(point, HEIGHT_DOMAIN)
              const isHighlight = point.ageYears === HEIGHT_HIGHLIGHT.ageYears
              return (
                <span
                  key={point.ageYears}
                  className={`db-ped-dot${isHighlight ? ' db-ped-dot--highlight' : ''}`}
                  style={{ left: `${position.left}%`, top: `${position.top}%` }}
                />
              )
            })}

            <p className="db-ped-callout" style={{ left: `${highlight.left}%`, top: `${highlight.top}%` }}>
              <span className="db-ped-callout-age">{HEIGHT_HIGHLIGHT.ageLabel}</span>
              <span className="db-ped-callout-value">{HEIGHT_HIGHLIGHT.valueLabel}</span>
              <span className="db-ped-callout-note">{HEIGHT_HIGHLIGHT.percentileLabel}</span>
            </p>
          </div>
          <ul className="db-ped-plot-x">
            {AGE_TICKS.map((tick) => <li key={tick}>{tick}</li>)}
          </ul>
          <p className="db-ped-plot-x-title">Age (Years)</p>
        </div>

        <ul className="db-ped-legend">
          {HEIGHT_SERIES.map((series) => (
            <li key={series.key}>
              <span
                className={`db-ped-legend-mark db-ped-legend-mark--${series.tone}${series.patient ? ' db-ped-legend-mark--dot' : ''}`}
                aria-hidden="true"
              />
              {series.label}
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  )
}
