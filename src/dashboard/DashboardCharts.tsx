import { useRef } from 'react'
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Scale,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  PATIENT_TYPES,
  VISIT_TREND,
  VISIT_TREND_MAX,
  VISIT_TREND_TICKS,
  type PatientType,
  type PatientVisitDay,
} from './dashboardData.ts'
import { sumPatientTypes } from './dashboardLogic.ts'
import { PanelHeader, PANEL_GLYPH } from './DashboardPrimitives.tsx'

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement, Tooltip)

/* Canvas cannot read CSS custom properties, so these mirror the dashboard tokens. */
const NAVY = '#103659'
const MUTED = '#55708f'
const GRID = '#daeaf6'
const OUTPATIENT = '#00a895'
const INPATIENT = '#75d2f5'

const COMPACT_LABEL_WIDTH = 420
const BAR_CATEGORY_PERCENTAGE = 0.58
const BAR_PERCENTAGE = 0.47
const BAR_MAX_THICKNESS = 22
const DONUT_RADIUS = '87%'
const DONUT_CUTOUT = '68%'

ChartJS.defaults.font.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
ChartJS.defaults.font.size = 10
ChartJS.defaults.color = MUTED

const TOOLTIP_STYLE = {
  backgroundColor: NAVY,
  titleFont: { size: 11.5, weight: 'bold' },
  bodyFont: { size: 11 },
  padding: 8,
  cornerRadius: 9,
  boxWidth: 10,
  boxHeight: 10,
  boxPadding: 3,
} as const

const BAR_OPTIONS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      min: 0,
      max: VISIT_TREND_MAX,
      ticks: { stepSize: VISIT_TREND_TICKS[1], padding: 6 },
      grid: { color: GRID },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        callback(this: Scale, _value: string | number, index: number) {
          const label = String(this.getLabelForValue(index))
          return this.chart.width < COMPACT_LABEL_WIDTH ? label.replace(' May', '') : label
        },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { ...TOOLTIP_STYLE },
  },
}

function barData(data: readonly PatientVisitDay[]): ChartData<'bar', number[], string> {
  return {
    labels: data.map((day) => day.day),
    datasets: [
      {
        label: 'Outpatient',
        data: data.map((day) => day.outpatient),
        backgroundColor: OUTPATIENT,
        borderRadius: 4,
        maxBarThickness: BAR_MAX_THICKNESS,
        categoryPercentage: BAR_CATEGORY_PERCENTAGE,
        barPercentage: BAR_PERCENTAGE,
      },
      {
        label: 'Inpatient',
        data: data.map((day) => day.inpatient),
        backgroundColor: INPATIENT,
        borderRadius: 4,
        maxBarThickness: BAR_MAX_THICKNESS,
        categoryPercentage: BAR_CATEGORY_PERCENTAGE,
        barPercentage: BAR_PERCENTAGE,
      },
    ],
  }
}

function EmptyState({ message }: { message: string }) {
  return <p className="db-chart-empty">{message}</p>
}

export function VisitsChart({ data = VISIT_TREND }: { data?: readonly PatientVisitDay[] }) {
  if (data.length === 0) {
    return (
      <section className="db-panel db-visits" aria-labelledby="db-visits-title">
        <PanelHeader id="db-visits-title" title="Patient Visits Trend" icon={PANEL_GLYPH.trend} action={<span className="db-panel-period">Last 7 Days</span>} />
        <EmptyState message="No patient visits recorded for this period." />
      </section>
    )
  }

  return (
    <section className="db-panel db-visits" aria-labelledby="db-visits-title">
      <PanelHeader id="db-visits-title" title="Patient Visits Trend" icon={PANEL_GLYPH.trend} action={<span className="db-panel-period">Last 7 Days</span>} />
      <div className="db-chart-wrap">
        <Bar
          data={barData(data)}
          options={BAR_OPTIONS}
          role="img"
          aria-label={`Grouped bar chart of patient visits from ${data[0].day} to ${data[data.length - 1].day}. Outpatient: ${data
            .map((day) => `${day.day} ${day.outpatient}`)
            .join(', ')}. Inpatient: ${data.map((day) => `${day.day} ${day.inpatient}`).join(', ')}.`}
        />
      </div>
      <ul className="db-visits-legend" role="list">
        <li className="db-legend-item"><span className="db-legend-dot db-legend-dot--outpatient" />Outpatient</li>
        <li className="db-legend-item"><span className="db-legend-dot db-legend-dot--inpatient" />Inpatient</li>
      </ul>
      <table className="sr-only">
        <caption>Patient visits by day</caption>
        <thead>
          <tr><th scope="col">Day</th><th scope="col">Outpatient</th><th scope="col">Inpatient</th></tr>
        </thead>
        <tbody>
          {data.map((day) => (
            <tr key={day.day}>
              <th scope="row">{day.day}</th>
              <td>{day.outpatient}</td>
              <td>{day.inpatient}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function PatientTypesChart({ data = PATIENT_TYPES }: { data?: readonly PatientType[] }) {
  const tooltipRef = useRef<HTMLParagraphElement>(null)
  const total = sumPatientTypes(data)

  if (data.length === 0) {
    return (
      <section className="db-panel db-types" aria-labelledby="db-types-title">
        <PanelHeader id="db-types-title" title="Patient Types" icon={PANEL_GLYPH.types} action={<span className="db-panel-period">This Month</span>} />
        <EmptyState message="No patient types recorded for this month." />
      </section>
    )
  }

  const donutData: ChartData<'doughnut', number[], string> = {
    labels: data.map((type) => type.label),
    datasets: [
      {
        label: 'Patients',
        data: data.map((type) => type.count),
        backgroundColor: data.map((type) => type.color),
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  }

  const donutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    radius: DONUT_RADIUS,
    cutout: DONUT_CUTOUT,
    plugins: {
      legend: { display: false },
      /* The 165px canvas clips a built-in tooltip, so mirror it into an HTML pill. */
      tooltip: {
        ...TOOLTIP_STYLE,
        enabled: false,
        external: (context) => {
          const node = tooltipRef.current
          if (!node) return
          const model = context.tooltip
          const point = model.dataPoints[0]
          if (model.opacity === 0 || !point) {
            node.removeAttribute('data-visible')
            return
          }
          node.textContent = `${point.label}: ${point.parsed} patients (${data[point.dataIndex].percent}%)`
          node.style.left = `${model.caretX}px`
          node.style.top = `${model.caretY}px`
          node.setAttribute('data-visible', 'true')
        },
      },
    },
  }

  return (
    <section className="db-panel db-types" aria-labelledby="db-types-title">
      <PanelHeader id="db-types-title" title="Patient Types" icon={PANEL_GLYPH.types} action={<span className="db-panel-period">This Month</span>} />
      <div className="db-types-body">
        <div className="db-donut-wrap">
          <Doughnut
            data={donutData}
            options={donutOptions}
            role="img"
            aria-label={`Donut chart of ${total} patients. ${data.map((type) => `${type.label}: ${type.count} patients, ${type.percent} percent`).join('. ')}.`}
          />
          <div className="db-donut-center" aria-hidden="true">
            <strong>{total}</strong>
            <span>Patients</span>
          </div>
          <p className="db-donut-tooltip" ref={tooltipRef} aria-hidden="true" />
        </div>
        <ul className="db-types-legend" role="list">
          {data.map((type) => (
            <li key={type.label} className="db-type-row">
              <span className="db-legend-dot" style={{ background: type.color }} />
              <span className="db-type-label">{type.label}</span>
              <span className="db-type-count">{type.count}</span>
              <span className="db-type-pct">{type.percent}%</span>
            </li>
          ))}
        </ul>
        <table className="sr-only">
          <caption>Patient types this month</caption>
          <thead>
            <tr><th scope="col">Type</th><th scope="col">Patients</th><th scope="col">Share</th></tr>
          </thead>
          <tbody>
            {data.map((type) => (
              <tr key={type.label}>
                <th scope="row">{type.label}</th>
                <td>{type.count}</td>
                <td>{type.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
