import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LAB_ARTWORK_COPY, LAB_TABS, LAB_TAB_COPY } from './laboratoryData.ts'
import {
  findOrder,
  laboratoryTabHref,
  parseLaboratoryTab,
  parseResultStatusFilter,
} from './laboratoryLogic.ts'
import { LaboratoryOverview } from './LaboratoryOverview.tsx'
import { LaboratoryOrders, LaboratoryOrderDetail } from './LaboratoryOrders.tsx'
import { LaboratoryResults } from './LaboratoryResults.tsx'
import { LaboratorySpecimens } from './LaboratorySpecimens.tsx'
import { LaboratoryQuality } from './LaboratoryQuality.tsx'
import { LabGlyph } from './LaboratoryGlyphs.tsx'

import heroScene from '../../assets/dashboard/laboratory/laboratory_hero_scene.png'

import './laboratory.css'

export function LaboratoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseLaboratoryTab(searchParams.get('tab'))
  const orderParam = searchParams.get('order')
  const selectedOrder = activeTab === 'orders' ? findOrder(orderParam) : undefined
  const unknownOrder = activeTab === 'orders' && orderParam && !selectedOrder ? orderParam : null
  const resultStatusFilter = parseResultStatusFilter(searchParams.get('filter'))

  const pageHeadingRef = useRef<HTMLHeadingElement>(null)
  const tabStripRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const triggerOrderRef = useRef<string | null>(null)
  const restoreFocusRef = useRef(false)

  const copy = selectedOrder
    ? {
        heading: 'Lab Order Details',
        supporting: `Order ${selectedOrder.number} · ${selectedOrder.dateGroup === 'Today' ? '13 May 2025' : '12 May 2025'}, ${selectedOrder.time}`,
      }
    : LAB_TAB_COPY[activeTab]

  const handleOrderLink = (orderNumber: string) => {
    triggerOrderRef.current = orderNumber
  }

  const clearOrderParam = (restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus
    const next = new URLSearchParams(searchParams)
    next.delete('order')
    if (!next.get('tab')) next.set('tab', 'orders')
    setSearchParams(next, { replace: true })
  }

  const closeOrder = () => clearOrderParam(true)

  useEffect(() => {
    if (selectedOrder) {
      const timer = window.setTimeout(() => pageHeadingRef.current?.focus(), 0)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [selectedOrder])

  useEffect(() => {
    if (selectedOrder || !restoreFocusRef.current) return
    restoreFocusRef.current = false
    const orderNumber = triggerOrderRef.current
    const timer = window.setTimeout(() => {
      const orderLink = orderNumber
        ? document.querySelector<HTMLElement>(`[data-order-link="${orderNumber}"]`)
        : null
      const fallback = document.querySelector<HTMLElement>('.lab-tab[aria-current="page"]')
      ;(orderLink ?? fallback ?? pageHeadingRef.current)?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [selectedOrder])

  useEffect(() => {
    if (!selectedOrder) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.querySelector('dialog[open]')) return
      event.preventDefault()
      closeOrder()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    const strip = tabStripRef.current
    const link = tabRefs.current[activeTab]
    if (!strip || !link) return undefined
    const left = link.offsetLeft - strip.clientWidth / 2 + link.offsetWidth / 2
    const show = () => { strip.scrollLeft = Math.max(0, left) }
    show()
    const frame = window.requestAnimationFrame(show)
    const timer = window.setTimeout(show, 180)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [activeTab])

  return (
    <div className="lab-page">
      {selectedOrder && (
        <div className="lab-order-toolbar">
          <nav className="lab-breadcrumb" aria-label="Breadcrumb">
            <Link to={laboratoryTabHref('overview')}>Laboratory</Link>
            <span aria-hidden="true">›</span>
            <button type="button" onClick={closeOrder}>Orders</button>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Order Detail</span>
          </nav>
          <button type="button" className="lab-button lab-button--secondary lab-order-close" onClick={closeOrder}>
            Close order details
          </button>
        </div>
      )}

      <section className="lab-hero" aria-labelledby="lab-heading">
        <img src={heroScene} alt="" className="lab-hero-scene" width={1172} height={131} aria-hidden="true" />
        <div className="lab-hero-copy">
          <h1 id="lab-heading" ref={pageHeadingRef} tabIndex={-1}>{copy.heading}</h1>
          <p>{copy.supporting}</p>
        </div>
        <p className="lab-hero-artwork">
          <span className="lab-hero-quote" aria-hidden="true">“</span>
          <span>{LAB_ARTWORK_COPY.lineOne}<br /><b>{LAB_ARTWORK_COPY.lineTwo}</b></span>
        </p>
      </section>

      <nav className="lab-tabs" aria-label="Laboratory sections" ref={tabStripRef}>
        <ul role="list">
          {LAB_TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <li key={tab.key}>
                <Link
                  className={`lab-tab${active ? ' lab-tab--active' : ''}`}
                  to={laboratoryTabHref(tab.key)}
                  aria-current={active ? 'page' : undefined}
                  ref={(element) => { tabRefs.current[tab.key] = element }}
                >
                  <LabGlyph name={tab.glyph} size={19} />
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="lab-content">
        {selectedOrder ? (
          <LaboratoryOrderDetail order={selectedOrder} onClose={closeOrder} />
        ) : (
          <>
            {activeTab === 'overview' && <LaboratoryOverview onOrderLinkClick={handleOrderLink} />}
            {activeTab === 'orders' && (
              <LaboratoryOrders
                onOrderLinkClick={handleOrderLink}
                unknownOrder={unknownOrder}
                onClearUnknown={() => clearOrderParam(false)}
              />
            )}
            {activeTab === 'results' && <LaboratoryResults initialStatus={resultStatusFilter} />}
            {activeTab === 'specimen-tracking' && <LaboratorySpecimens />}
            {activeTab === 'quality-control' && <LaboratoryQuality />}
          </>
        )}
      </div>

      <p className="lab-page-note">
        Synthetic demonstration data from the supplied BUNDA reference set. Not for clinical use.
      </p>
    </div>
  )
}
