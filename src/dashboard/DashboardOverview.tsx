import { useEffect, useState } from 'react'
import { HERO, METRICS } from './dashboardData.ts'
import { formatDashboardDate, getDashboardGreeting } from './dashboardLogic.ts'
import { METRIC_ART } from './dashboardAssets.ts'
import { PatientTypesChart, VisitsChart } from './DashboardCharts.tsx'
import { AppointmentsPanel, RecentPatientsPanel } from './DashboardLowerPanels.tsx'
import heroBanner from '../assets/dashboard/backgrounds/dashboard_hospital_banner_clean.png'
import heroHaze from '../assets/dashboard/backgrounds/dashboard_hero_left_gradient.png'
import heroNurse from '../assets/dashboard/characters/dashboard_nurse_hero_right_hand.png'

const CLOCK_INTERVAL = 60_000

/** Local clock, refreshed each minute so the date and salutation survive midnight. */
function useLocalClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return now
}

function HeroBanner() {
  const now = useLocalClock()

  return (
    <section className="db-hero" aria-labelledby="db-hero-greeting">
      <img src={heroBanner} alt="" className="db-hero-bg" width={1160} height={187} />
      <img src={heroHaze} alt="" className="db-hero-haze" width={475} height={178} />
      <img src={heroNurse} alt="" className="db-hero-nurse" width={634} height={736} />
      <div className="db-hero-copy">
        <h1 id="db-hero-greeting" className="db-hero-greeting">{`${getDashboardGreeting(now)}, ${HERO.doctorName}`}</h1>
        <p className="db-hero-date">{formatDashboardDate(now)}</p>
        <p className="db-hero-msg">{HERO.message}</p>
      </div>
      <div className="db-hero-quote">
        <span className="db-hero-quote-mark" aria-hidden="true">“</span>
        <p>{HERO.tagline[0]}</p>
        <p>{HERO.tagline[1]}</p>
        <span className="db-hero-quote-rule" aria-hidden="true" />
      </div>
    </section>
  )
}

function MetricRow() {
  return (
    <div className="db-metrics">
      {METRICS.map((metric) => (
        <article key={metric.label} className="db-metric">
          <img src={METRIC_ART[metric.art]} alt="" width={44} height={44} className="db-metric-art" />
          <p className="db-metric-value">{metric.value}</p>
          <p className="db-metric-label">{metric.label}</p>
          <p className="db-metric-trend">
            <span className={metric.favorable ? 'db-trend db-trend--up' : 'db-trend db-trend--down'}>
              <span aria-hidden="true">{metric.favorable ? '↑' : '↓'}</span>
              {metric.trend}
            </span>
            <span className="db-metric-cmp">{metric.comparison}</span>
          </p>
        </article>
      ))}
    </div>
  )
}

export function DashboardOverview() {
  return (
    <div className="db-overview">
      <HeroBanner />
      <MetricRow />
      <div className="db-analytics">
        <VisitsChart />
        <PatientTypesChart />
      </div>
      <div className="db-bottom">
        <RecentPatientsPanel />
        <AppointmentsPanel />
      </div>
    </div>
  )
}
