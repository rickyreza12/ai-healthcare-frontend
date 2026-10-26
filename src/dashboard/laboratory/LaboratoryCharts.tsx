import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { ACTIVITY_TREND, CATEGORY_DISTRIBUTION, CATEGORY_TOTAL, HEMOGLOBIN_TREND, QC_CHART } from './laboratoryData.ts'

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
)

/* Canvas cannot read CSS custom properties, so these mirror the dashboard tokens. */
const NAVY = '#103659'
const MUTED = '#55708f'
const GRID = '#e7eef4'
const TEAL = '#00a895'
const RED = '#e5484d'

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

const ACTIVITY_OPTIONS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      stacked: true,
      min: 0,
      max: 80,
      ticks: { stepSize: 20, padding: 6 },
      grid: { color: GRID },
      border: { display: false },
    },
    x: {
      stacked: true,
      grid: { display: false },
      border: { display: false },
      ticks: { autoSkip: false, maxRotation: 0 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { ...TOOLTIP_STYLE },
  },
}

const HEMOGLOBIN_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      min: 6,
      max: 13,
      afterBuildTicks: (axis) => {
        axis.ticks = [7, 9, 11, 13].map((value) => ({ value }))
      },
      grid: { color: GRID },
      border: { display: false },
      ticks: { padding: 6 },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { autoSkip: false, maxRotation: 0 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { ...TOOLTIP_STYLE },
  },
}

const QC_TICK_INDEXES = [0, 5, 10, 15, 20, 25] as const

const QC_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      min: QC_CHART.limits.low,
      max: QC_CHART.limits.high,
      ticks: { stepSize: 4, padding: 6 },
      grid: { color: GRID },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        callback(_value: string | number, index: number) {
          const tick = QC_TICK_INDEXES.indexOf(index as (typeof QC_TICK_INDEXES)[number])
          return tick === -1 ? '' : QC_CHART.labels[tick]
        },
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...TOOLTIP_STYLE,
      callbacks: {
        title: (items) => `Day ${items[0].dataIndex + 1}`,
        label: (item) => `${item.parsed.y}`,
      },
    },
  },
}

/* The supplied control limits are reference lines, not data series. */
const qcLimitLines: Plugin<'line'> = {
  id: 'qcLimitLines',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart
    const scale = chart.scales.y
    if (!chartArea) return

    ctx.save()
    for (const limit of [
      { value: QC_CHART.limits.high, color: RED },
      { value: QC_CHART.limits.warningHigh, color: '#ffa51f' },
      { value: QC_CHART.limits.warningLow, color: '#ffa51f' },
      { value: QC_CHART.limits.low, color: RED },
    ]) {
      const y = scale.getPixelForValue(limit.value)
      ctx.strokeStyle = limit.color
      ctx.lineWidth = 1.4
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      ctx.moveTo(chartArea.left, y)
      ctx.lineTo(chartArea.right, y)
      ctx.stroke()
    }
    ctx.restore()
  },
}

function activityData(): ChartData<'bar', number[], string> {
  return {
    labels: [...ACTIVITY_TREND.labels],
    datasets: ACTIVITY_TREND.series.map((series) => ({
      label: series.label,
      data: [...series.values],
      backgroundColor: series.color,
      borderRadius: 2,
      borderSkipped: false,
      maxBarThickness: 34,
      categoryPercentage: 0.58,
      barPercentage: 0.5,
      stack: 'activity',
    })),
  }
}

const ACTIVITY_ARIA = `Stacked bar chart of test activity for 7 May to 13 May. ${ACTIVITY_TREND.series
  .map((series) => `${series.label}: ${series.values.join(', ')}`)
  .join('. ')}. Full values appear in the data table.`

export function ActivityTrendChart() {
  return (
    <figure className="lab-chart">
      <div className="lab-chart-canvas lab-chart-canvas--activity">
        <Bar data={activityData()} options={ACTIVITY_OPTIONS} role="img" aria-label={ACTIVITY_ARIA} />
      </div>
      <ul className="lab-legend" role="list">
        {ACTIVITY_TREND.series.map((series) => (
          <li key={series.key}>
            <span className="lab-legend-dot" style={{ background: series.color }} aria-hidden="true" />
            {series.label}
          </li>
        ))}
      </ul>
      <div className="sr-only">
        <table>
          <caption>Test activity trend, supplied demonstration values</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              {ACTIVITY_TREND.series.map((series) => <th key={series.key} scope="col">{series.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {ACTIVITY_TREND.labels.map((label, index) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {ACTIVITY_TREND.series.map((series) => <td key={series.key}>{series.values[index]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

export function CategoryDonut() {
  const data: ChartData<'doughnut', number[], string> = {
    labels: CATEGORY_DISTRIBUTION.map((category) => category.label),
    datasets: [
      {
        label: 'Tests',
        data: CATEGORY_DISTRIBUTION.map((category) => category.percent),
        backgroundColor: CATEGORY_DISTRIBUTION.map((category) => category.color),
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    radius: '92%',
    cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_STYLE,
        callbacks: {
          label: (item) => `${item.label}: ${item.parsed}%`,
        },
      },
    },
  }

  const ariaLabel = `Doughnut chart of test categories. ${CATEGORY_DISTRIBUTION.map(
    (category) => `${category.label} ${category.percent} percent`,
  ).join(', ')}. ${CATEGORY_TOTAL} tests in total.`

  return (
    <figure className="lab-donut-figure">
      <div className="lab-donut-layout">
        <div className="lab-donut-chart">
          <Doughnut data={data} options={options} role="img" aria-label={ariaLabel} />
          <div className="lab-donut-center" aria-hidden="true">
            <span className="lab-donut-value">{CATEGORY_TOTAL}</span>
            <span className="lab-donut-caption">Tests</span>
          </div>
        </div>
        <ul className="lab-donut-legend" role="list">
          {CATEGORY_DISTRIBUTION.map((category) => (
            <li key={category.label}>
              <span className="lab-legend-dot" style={{ background: category.color }} aria-hidden="true" />
              <span className="lab-donut-label">{category.label}</span>
              <span className="lab-donut-percent">{category.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

export function HemoglobinTrend() {
  const data: ChartData<'line', number[], string> = {
    labels: [...HEMOGLOBIN_TREND.labels],
    datasets: [
      {
        label: 'Hemoglobin',
        data: [...HEMOGLOBIN_TREND.values],
        borderColor: RED,
        backgroundColor: RED,
        borderWidth: 2.4,
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0,
      },
    ],
  }

  return (
    <figure className="lab-trend-figure">
      <div className="lab-chart-canvas lab-chart-canvas--trend">
        <Line
          data={data}
          options={HEMOGLOBIN_OPTIONS}
          role="img"
          aria-label="Hemoglobin trend from January to June. Latest value 6.8 grams per decilitre, down 5.2 from the first supplied point. Values: 12.0, 11.6, 11.2, 10.9, 10.4, 6.8."
        />
      </div>
      <div className="sr-only">
        <table>
          <caption>Hemoglobin trend, supplied demonstration values</caption>
          <thead>
            <tr><th scope="col">Month</th><th scope="col">Hemoglobin (g/dL)</th></tr>
          </thead>
          <tbody>
            {HEMOGLOBIN_TREND.values.map((value, index) => (
              <tr key={HEMOGLOBIN_TREND.labels[index]}>
                <th scope="row">{HEMOGLOBIN_TREND.labels[index]}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

export function LeveyJenningsChart() {
  const data: ChartData<'line', number[], string> = {
    labels: QC_CHART.values.map((_, index) => `Day ${index + 1}`),
    datasets: [
      {
        label: 'Control measurement',
        data: [...QC_CHART.values],
        borderColor: TEAL,
        backgroundColor: TEAL,
        borderWidth: 2,
        tension: 0,
        pointBorderWidth: 0,
        pointBackgroundColor: QC_CHART.values.map((value) =>
          value >= QC_CHART.limits.warningHigh || value <= QC_CHART.limits.warningLow ? RED : TEAL,
        ),
        pointRadius: QC_CHART.values.map((value) =>
          value >= QC_CHART.limits.warningHigh || value <= QC_CHART.limits.warningLow ? 4 : 3,
        ),
        pointHoverRadius: 5,
      },
    ],
  }

  return (
    <figure className="lab-chart">
      <div className="lab-chart-canvas lab-chart-canvas--qc">
        <Line
          data={data}
          options={QC_OPTIONS}
          plugins={[qcLimitLines]}
          role="img"
          aria-label={`Levey-Jennings control chart for ${QC_CHART.subtitle}. Thirty daily measurements are shown between ${QC_CHART.limits.low} and ${QC_CHART.limits.high}; one point reaches ${Math.max(...QC_CHART.values)}. Full values appear in the data table.`}
        />
      </div>
      <ul className="lab-legend" role="list">
        {QC_CHART.legend.map((item) => (
          <li key={item.label}>
            <span className="lab-legend-dot" style={{ background: item.color }} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
      <div className="sr-only">
        <table>
          <caption>Control measurements for {QC_CHART.subtitle}</caption>
          <thead>
            <tr><th scope="col">Measurement</th><th scope="col">Value</th></tr>
          </thead>
          <tbody>
            {QC_CHART.values.map((value, index) => (
              <tr key={`${value}-${index}`}><th scope="row">{index + 1}</th><td>{value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
