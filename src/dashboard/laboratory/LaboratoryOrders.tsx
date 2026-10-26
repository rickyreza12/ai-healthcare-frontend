import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LAB_ORDERS,
  ORDER_DETAIL_REFERENCE,
  ORDER_STATUSES,
  SPECIMEN_TYPES,
  type LabOrder,
} from './laboratoryData.ts'
import {
  ALL_SPECIMENS,
  ALL_STATUS,
  DEFAULT_ORDER_FILTERS,
  filterOrders,
  isDefaultOrderFilters,
  laboratoryOrderHref,
  orderStages,
  type OrderFilters,
} from './laboratoryLogic.ts'
import { LabAvatar, LabGlyph } from './LaboratoryGlyphs.tsx'
import { LabEmpty, LabSearch, PanelHeading, StatusChip } from './LaboratoryPrimitives.tsx'

export function LaboratoryOrders({ onOrderLinkClick, unknownOrder, onClearUnknown }: {
  onOrderLinkClick: (orderNumber: string) => void
  unknownOrder: string | null
  onClearUnknown: () => void
}) {
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS)
  const rows = useMemo(() => filterOrders(filters, LAB_ORDERS), [filters])

  return (
    <section className="lab-panel lab-work-panel" aria-labelledby="lab-orders-title">
      <PanelHeading id="lab-orders-title" aside={<span className="lab-period-chip">Supplied orders</span>}>
        <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="orders" size={18} /></span>
        Laboratory Orders
      </PanelHeading>

      {unknownOrder && (
        <div className="lab-inline-notice" role="alert">
          <span>Order <strong>{unknownOrder}</strong> is not part of this reference demo.</span>
          <button type="button" className="lab-text-button" onClick={onClearUnknown}>Return to orders</button>
        </div>
      )}

      <div className="lab-controls">
        <LabSearch
          id="lab-order-search"
          value={filters.query}
          onChange={(query) => setFilters({ ...filters, query })}
          placeholder="Search patient, patient ID, order number, or test…"
        />
        <label className="sr-only" htmlFor="lab-order-status">Order status</label>
        <select
          id="lab-order-status"
          className="lab-select"
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value as OrderFilters['status'] })}
        >
          <option value={ALL_STATUS}>All Status</option>
          {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <label className="sr-only" htmlFor="lab-order-specimen">Specimen type</label>
        <select
          id="lab-order-specimen"
          className="lab-select"
          value={filters.specimen}
          onChange={(event) => setFilters({ ...filters, specimen: event.target.value })}
        >
          <option value={ALL_SPECIMENS}>All Specimens</option>
          {SPECIMEN_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        {!isDefaultOrderFilters(filters) && (
          <button type="button" className="lab-button lab-button--ghost" onClick={() => setFilters(DEFAULT_ORDER_FILTERS)}>
            Clear
          </button>
        )}
      </div>

      {rows.length > 0 ? (
        <>
          <table className="lab-table">
            <caption className="sr-only">Laboratory orders</caption>
            <thead>
              <tr>
                <th scope="col">Patient</th>
                <th scope="col">Order No.</th>
                <th scope="col">Test(s)</th>
                <th scope="col">Category</th>
                <th scope="col">Specimen</th>
                <th scope="col">Status</th>
                <th scope="col">Order Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.number} className="lab-row">
                  <td data-label="Patient">
                    <span className="lab-person">
                      <LabAvatar name={order.patientName} size={32} />
                      <span>
                        <strong>{order.patientName}</strong>
                        <small>{order.patientId ?? 'Patient ID not supplied'}</small>
                      </span>
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
                  <td data-label="Category">{order.category}</td>
                  <td data-label="Specimen">{order.specimenType}</td>
                  <td data-label="Status"><StatusChip status={order.status} /></td>
                  <td data-label="Order Time">{order.dateGroup === 'Yesterday' ? `Yesterday, ${order.time}` : order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="lab-table-note">Showing {rows.length} of {LAB_ORDERS.length} supplied orders · Synthetic demonstration data</p>
        </>
      ) : (
        <LabEmpty onReset={() => setFilters(DEFAULT_ORDER_FILTERS)}>
          No laboratory orders match these filters.
        </LabEmpty>
      )}
    </section>
  )
}

export function LaboratoryOrderDetail({ order, onClose }: {
  order: LabOrder
  onClose: () => void
}) {
  const full = order.hasFullDetail ? ORDER_DETAIL_REFERENCE : null
  const orderDate = order.dateGroup === 'Today' ? '13 May 2025' : '12 May 2025'
  const collection = full?.specimen
  const stages = orderStages(order.status)

  return (
    <div className="lab-order-detail">
      <div className="lab-order-summary-line">
        <span className="lab-order-number">{order.number}</span>
        <StatusChip status={order.status} />
        <span>Last Updated: {orderDate}, {order.time}</span>
      </div>

      <section className="lab-panel lab-order-patient" aria-labelledby="lab-order-patient-title">
        <h2 id="lab-order-patient-title" className="sr-only">Patient and order summary</h2>
        <LabAvatar name={order.patientName} size={60} />
        <div className="lab-order-patient-id">
          <strong>{order.patientName}</strong>
          <span>{order.patientId ?? full?.patientId ?? 'Patient ID not supplied'}</span>
          <p>
            {full ? `${full.gender} · ${full.age} (${full.dateOfBirth}) · ${full.phone}` : 'Demographics are not included for this supplied order.'}
          </p>
        </div>
        <div className="lab-order-meta">
          <span>Attending Doctor</span>
          <strong>{ORDER_DETAIL_REFERENCE.attendingDoctor}</strong>
        </div>
        <div className="lab-order-meta">
          <span>Order Date &amp; Time</span>
          <strong>{orderDate}<br />{order.time}</strong>
        </div>
        <div className="lab-order-meta">
          <span>Priority</span>
          <strong>{order.tests[0]?.priority ?? 'Routine'}</strong>
        </div>
      </section>

      <div className="lab-order-grid">
        <div className="lab-order-main">
          <section className="lab-panel" aria-labelledby="lab-requested-tests">
            <PanelHeading id="lab-requested-tests">
              <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="flask" size={18} /></span>
              Requested Tests ({order.tests.length})
            </PanelHeading>
            <table className="lab-table lab-table--compact">
              <caption className="sr-only">Requested tests for order {order.number}</caption>
              <thead>
                <tr>
                  <th scope="col">No.</th>
                  <th scope="col">Test Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Specimen</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.tests.map((test, index) => (
                  <tr key={`${test.name}-${index}`}>
                    <td data-label="No.">{index + 1}</td>
                    <td data-label="Test Name"><strong>{test.name}</strong></td>
                    <td data-label="Category">{test.category}</td>
                    <td data-label="Specimen">{test.specimen}</td>
                    <td data-label="Priority"><span className="lab-status lab-status--blue">{test.priority}</span></td>
                    <td data-label="Status"><StatusChip status={test.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="lab-order-pair">
            <section className="lab-panel" aria-labelledby="lab-specimen-info">
              <PanelHeading id="lab-specimen-info">
                <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="specimen" size={18} /></span>
                Specimen Information
              </PanelHeading>
              <dl className="lab-fact-grid">
                <div><dt>Specimen</dt><dd>{collection?.type ?? order.specimenType}</dd></div>
                <div><dt>Collection Type</dt><dd>{collection ? 'Venipuncture' : 'Not supplied'}</dd></div>
                <div><dt>Container</dt><dd>{collection?.container ?? 'Not supplied'}</dd></div>
                <div><dt>Volume</dt><dd>{collection?.volume ?? 'Not supplied'}</dd></div>
                <div><dt>Special Instructions</dt><dd>{collection?.instructions ?? 'Not supplied'}</dd></div>
              </dl>
            </section>

            <section className="lab-panel" aria-labelledby="lab-collection-info">
              <PanelHeading id="lab-collection-info">
                <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="overview" size={18} /></span>
                Collection Details
              </PanelHeading>
              <dl className="lab-fact-grid">
                <div><dt>Scheduled Date</dt><dd>{collection?.scheduled ?? `${orderDate}, ${order.time}`}</dd></div>
                <div><dt>Collected Date</dt><dd>{collection?.collected ?? (order.status === 'Pending' ? 'Not collected' : `${orderDate}, ${order.time}`)}</dd></div>
                <div><dt>Collected By</dt><dd>{collection?.collectedBy ?? 'Not supplied'}</dd></div>
                <div><dt>Collection Location</dt><dd>{collection?.location ?? 'Not supplied'}</dd></div>
              </dl>
            </section>
          </div>

          <section className="lab-panel" aria-labelledby="lab-timeline">
            <PanelHeading id="lab-timeline">
              <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="clock" size={18} /></span>
              Order Timeline / Workflow
            </PanelHeading>
            <ol className="lab-timeline" role="list">
              {stages.map((stage) => (
                <li key={stage.key} className={`lab-timeline-step lab-timeline-step--${stage.state}`}>
                  <span className="lab-timeline-dot" aria-hidden="true" />
                  <strong>{stage.label}</strong>
                  <span>{stage.state === 'pending' ? 'Pending' : stage.state === 'current' ? 'Current stage' : orderDate}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="lab-order-pair">
            <section className="lab-panel" aria-labelledby="lab-clinical-notes">
              <PanelHeading id="lab-clinical-notes">
                <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="report" size={18} /></span>
                Clinical Notes
              </PanelHeading>
              <p className="lab-note">
                {full?.clinicalNote ?? 'No clinical notes are supplied for this order. The order list fields above are the available reference detail.'}
              </p>
            </section>
            <section className="lab-panel" aria-labelledby="lab-billing">
              <PanelHeading id="lab-billing">
                <span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="report" size={18} /></span>
                Billing &amp; Coverage
              </PanelHeading>
              <dl className="lab-fact-grid">
                <div><dt>Payment Type</dt><dd>{full?.billing.paymentType ?? 'Not supplied'}</dd></div>
                <div><dt>Estimated Cost</dt><dd>{full?.billing.estimatedCost ?? 'Not supplied'}</dd></div>
                <div><dt>Coverage</dt><dd>{full?.billing.coverage ?? 'Not supplied'}</dd></div>
              </dl>
            </section>
          </div>
        </div>

        <aside className="lab-order-aside" aria-label="Order record">
          <section className="lab-panel lab-readonly-card">
            <h2><span className="lab-heading-icon" aria-hidden="true"><LabGlyph name="orders" size={18} /></span>Order Record</h2>
            <dl className="lab-fact-grid">
              <div><dt>Status</dt><dd><StatusChip status={order.status} /></dd></div>
              <div><dt>Tests</dt><dd>{order.tests.length}</dd></div>
              <div><dt>Specimen</dt><dd>{order.specimenType}</dd></div>
              <div><dt>Priority</dt><dd>{order.tests[0]?.priority ?? 'Routine'}</dd></div>
            </dl>
            <p className="lab-readonly-note">Read-only reference record. Printing, collection changes, technician assignment, cancellation, and release actions are not part of this demo.</p>
            <button type="button" className="lab-button lab-button--secondary" onClick={onClose}>Return to orders</button>
          </section>
        </aside>
      </div>
    </div>
  )
}
