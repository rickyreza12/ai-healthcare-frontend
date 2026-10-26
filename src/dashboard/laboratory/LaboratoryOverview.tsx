import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CATEGORY_TOTAL,
  COLLECTION_SCHEDULE,
  CRITICAL_ALERTS,
  LAB_ORDERS,
  OVERVIEW_METRICS,
  type LabOrderStatus,
} from './laboratoryData.ts'
import {
  ALL_STATUS,
  filterOrders,
  laboratoryOrderHref,
  laboratoryTabHref,
  type OrderFilters,
} from './laboratoryLogic.ts'
import { ActivityTrendChart, CategoryDonut } from './LaboratoryCharts.tsx'
import { LabAvatar, LabGlyph } from './LaboratoryGlyphs.tsx'
import { LabEmpty, LabSearch, MetricGrid, PanelHeading, StatusChip } from './LaboratoryPrimitives.tsx'

const RECENT_ORDERS = LAB_ORDERS.filter((order) => order.dateGroup === 'Today').slice(0, 5)

export function LaboratoryOverview({ onOrderLinkClick }: { onOrderLinkClick: (orderNumber: string) => void }) {
  const [recentQuery, setRecentQuery] = useState('')
  const [recentStatus, setRecentStatus] = useState<OrderFilters['status']>(ALL_STATUS)
  const recentFilters: OrderFilters = { query: recentQuery, status: recentStatus, specimen: 'All Specimens' }
  const recentRows = useMemo(() => filterOrders(recentFilters, RECENT_ORDERS), [recentFilters.query, recentFilters.status])

  return (
    <>
      <MetricGrid metrics={OVERVIEW_METRICS} label="Laboratory activity today" />

      <div className="lab-overview-top">
        <section className="lab-panel" aria-labelledby="lab-activity">
          <PanelHeading id="lab-activity" aside={<span className="lab-period-chip">Last 7 Days</span>}>
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="results" size={18} /></span>
            Test Activity Trend
          </PanelHeading>
          <ActivityTrendChart />
        </section>

        <section className="lab-panel" aria-labelledby="lab-categories">
          <PanelHeading id="lab-categories" aside={<span className="lab-period-chip">This Month</span>}>
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="overview" size={18} /></span>
            Test Category Distribution
          </PanelHeading>
          <CategoryDonut />
          <p className="sr-only">Category shares total {CATEGORY_TOTAL} tests.</p>
        </section>

        <section className="lab-panel" aria-labelledby="lab-critical">
          <PanelHeading id="lab-critical" aside={<Link className="lab-text-link" to={laboratoryTabHref('results', { filter: 'critical' })}>View All</Link>}>
            <span className="lab-heading-icon lab-heading-icon--red" aria-hidden="true"><LabGlyph name="alert" size={18} /></span>
            Critical Alerts / Abnormal Results
          </PanelHeading>
          <ul className="lab-alert-list" role="list">
            {CRITICAL_ALERTS.map((alert) => (
              <li key={alert.id}>
                <LabAvatar name={alert.patientName} size={34} />
                <div className="lab-alert-copy">
                  <strong>{alert.patientName}</strong>
                  <p><span>{alert.test}</span> <b>{alert.result}</b></p>
                </div>
                <div className="lab-alert-side">
                  <span className="lab-status lab-status--red">{alert.status}</span>
                  <span className="lab-alert-time">{alert.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="lab-overview-bottom">
        <section className="lab-panel" aria-labelledby="lab-recent">
          <PanelHeading id="lab-recent" aside={<Link className="lab-text-link" to={laboratoryTabHref('orders')}>View All</Link>}>
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="orders" size={18} /></span>
            Recent Lab Orders
          </PanelHeading>

          <div className="lab-inline-filters">
            <LabSearch
              id="lab-recent-search"
              value={recentQuery}
              onChange={setRecentQuery}
              placeholder="Search recent orders…"
            />
            <label className="sr-only" htmlFor="lab-recent-status">Recent order status</label>
            <select
              id="lab-recent-status"
              className="lab-select"
              value={recentStatus}
              onChange={(event) => setRecentStatus(event.target.value as OrderFilters['status'])}
            >
              <option value={ALL_STATUS}>All Status</option>
              {(['Completed', 'Processing', 'Collected', 'Pending'] as LabOrderStatus[]).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {recentRows.length > 0 ? (
            <table className="lab-table lab-table--overview">
              <caption className="sr-only">Recent laboratory orders</caption>
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">Order No.</th>
                  <th scope="col">Test(s)</th>
                  <th scope="col">Specimen</th>
                  <th scope="col">Status</th>
                  <th scope="col">Order Time</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((order) => (
                  <tr key={order.number}>
                    <td data-label="Patient">
                      <span className="lab-person">
                        <LabAvatar name={order.patientName} size={30} />
                        <strong>{order.patientName}</strong>
                      </span>
                    </td>
                    <td data-label="Order No.">
                      <Link
                        className="lab-row-link"
                        to={laboratoryOrderHref(order.number)}
                        data-order-link={order.number}
                        onClick={() => onOrderLinkClick(order.number)}
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td data-label="Test(s)">{order.testSummary}</td>
                    <td data-label="Specimen">{order.specimenType}</td>
                    <td data-label="Status"><StatusChip status={order.status} /></td>
                    <td data-label="Order Time">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <LabEmpty onReset={() => { setRecentQuery(''); setRecentStatus(ALL_STATUS) }}>
              No recent laboratory orders match these filters.
            </LabEmpty>
          )}
        </section>

        <section className="lab-panel" aria-labelledby="lab-collection">
          <PanelHeading id="lab-collection" aside={<Link className="lab-text-link" to={laboratoryTabHref('specimen-tracking')}>View All</Link>}>
            <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="overview" size={18} /></span>
            Today's Collection Schedule
          </PanelHeading>
          <ol className="lab-schedule" role="list">
            {COLLECTION_SCHEDULE.map((entry) => (
              <li key={entry.id}>
                <span className="lab-schedule-time">{entry.time}</span>
                <span className={`lab-schedule-dot lab-schedule-dot--${entry.status.toLowerCase().replace(' ', '-')}`} aria-hidden="true" />
                <LabAvatar name={entry.patientName} size={30} />
                <div className="lab-schedule-copy">
                  <strong>{entry.patientName}</strong>
                  <p>{entry.work}</p>
                </div>
                <StatusChip status={entry.status} />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
