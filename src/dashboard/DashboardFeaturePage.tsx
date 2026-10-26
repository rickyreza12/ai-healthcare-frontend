import { Link } from 'react-router-dom'
import { NAV_ITEMS } from './dashboardData.ts'

const FEATURE_KEYS = ['pharmacy', 'laboratory', 'healthcare-assistant'] as const
type FeatureKey = (typeof FEATURE_KEYS)[number]

export function DashboardFeaturePage({ page }: { page: FeatureKey }) {
  const info = NAV_ITEMS.find((n) => n.key === page)
  const title = info?.label ?? page

  return (
    <div className="db-feature">
      <h1>{title}</h1>
      <p className="db-feature-sub">This workspace is ready for future product requirements.</p>
      <section className="db-feature-empty" aria-label={`${title} status`}>
        <p className="db-feature-empty-title">Nothing here yet</p>
        <p className="db-feature-empty-text">No {title.toLowerCase()} features have been set up.</p>
      </section>
      <Link to="/dashboard" className="db-back-link">Back to Dashboard</Link>
    </div>
  )
}

export { FEATURE_KEYS }
export type { FeatureKey }
