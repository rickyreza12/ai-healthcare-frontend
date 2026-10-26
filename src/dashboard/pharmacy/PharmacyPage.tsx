import { useMemo, useState } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import { ReadOnlyDialog } from '../ReadOnlyDialog.tsx'
import {
  MEDICATION_CATEGORIES,
  MEDICATION_PAGE_SIZE,
  MEDICATION_STATUSES,
  MEDICATION_TABS,
  PHARMACY_HERO,
  type Medication,
  type MedicationStatus,
} from './pharmacyData.ts'
import {
  ALL_CATEGORIES,
  ALL_STATUSES,
  DEFAULT_MEDICATION_FILTERS,
  clampPage,
  filterMedications,
  showingRangeText,
  tabHasNoSuppliedRows,
  totalPages,
  visibleRows,
  type MedicationFilters,
} from './pharmacyLogic.ts'
import { MedicationTabIcon } from './pharmacyIcons.tsx'

import heroBg from '../../assets/dashboard/backgrounds/dashboard_hospital_banner_clean.png'
import heroHaze from '../../assets/dashboard/backgrounds/dashboard_hero_left_gradient.png'
import heroNurse from '../../assets/dashboard/pharmacy/pharmacy_hero_nurse.png'
import medParacetamol from '../../assets/dashboard/pharmacy/med_paracetamol.png'
import medAmoxicillin from '../../assets/dashboard/pharmacy/med_amoxicillin.png'
import medIbuprofen from '../../assets/dashboard/pharmacy/med_ibuprofen.png'
import medOmeprazole from '../../assets/dashboard/pharmacy/med_omeprazole.png'
import medAmlodipine from '../../assets/dashboard/pharmacy/med_amlodipine.png'
import medMetformin from '../../assets/dashboard/pharmacy/med_metformin.png'
import medCetirizine from '../../assets/dashboard/pharmacy/med_cetirizine.png'
import medSalbutamol from '../../assets/dashboard/pharmacy/med_salbutamol.png'
import medLoratadine from '../../assets/dashboard/pharmacy/med_loratadine.svg'

import './pharmacy.css'

const MEDICATION_IMAGES: Record<string, string> = {
  'paracetamol-500': medParacetamol,
  'amoxicillin-500': medAmoxicillin,
  'ibuprofen-400': medIbuprofen,
  'omeprazole-20': medOmeprazole,
  'amlodipine-5': medAmlodipine,
  'metformin-500': medMetformin,
  'cetirizine-10': medCetirizine,
  'salbutamol-inhaler': medSalbutamol,
  'loratadine-10': medLoratadine,
}

const STATUS_TONE: Record<MedicationStatus, 'in-stock' | 'low-stock' | 'out-of-stock'> = {
  'In Stock': 'in-stock',
  'Low Stock': 'low-stock',
  'Out of Stock': 'out-of-stock',
}

const TABLE_COLUMNS = [
  'Medication',
  'Category',
  'Dosage / Form',
  'Stock',
  'Price (IDR)',
  'Prescription',
  'Status',
  'Actions',
] as const

export function PharmacyPage() {
  const [filters, setFilters] = useState<MedicationFilters>(DEFAULT_MEDICATION_FILTERS)
  const [requestedPage, setRequestedPage] = useState(1)
  const pageSize = MEDICATION_PAGE_SIZE
  const [notice, setNotice] = useState<Notice | null>(null)
  const [viewTarget, setViewTarget] = useState<Medication | null>(null)

  // Filters reset pagination: any change invalidates the requested page.
  const updateFilters = (next: MedicationFilters) => {
    setFilters(next)
    setRequestedPage(1)
  }

  const rows = useMemo(() => filterMedications(filters), [filters])
  const pages = totalPages(rows.length, pageSize)
  const currentPage = clampPage(requestedPage, pages)
  const pageRows = useMemo(() => visibleRows(rows, currentPage, pageSize), [rows, currentPage, pageSize])

  const showingText = showingRangeText(rows.length, currentPage, pageSize)

  const resetFilters = () => updateFilters(DEFAULT_MEDICATION_FILTERS)

  return (
    <div className="ph-page">
      <section className="ph-hero" aria-labelledby="ph-heading">
        <img src={heroBg} alt="" className="ph-hero-bg" width={1160} height={187} aria-hidden="true" />
        <img src={heroHaze} alt="" className="ph-hero-haze" width={475} height={178} aria-hidden="true" />
        <div className="ph-hero-text">
          <h1 id="ph-heading">{PHARMACY_HERO.heading}</h1>
          <p>{PHARMACY_HERO.supporting}</p>
        </div>
        <p className="ph-hero-artwork" aria-hidden="true">
          {PHARMACY_HERO.artworkLines[0]}
          <span>{PHARMACY_HERO.artworkLines[1]}</span>
        </p>
        <img src={heroNurse} alt="" className="ph-hero-nurse" aria-hidden="true" />
      </section>

      <nav className="ph-tabs" aria-label="Medication categories">
        <ul>
          {MEDICATION_TABS.map((tab) => {
            const active = filters.tab === tab.key
            return (
              <li key={tab.key}>
                <button
                  type="button"
                  className={`ph-tab${active ? ' ph-tab--active' : ''}`}
                  aria-pressed={active}
                  onClick={() => updateFilters({ ...filters, tab: tab.key })}
                >
                  <MedicationTabIcon tab={tab.key} />
                  {tab.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="ph-controls">
        <div className="ph-search">
          <label className="sr-only" htmlFor="ph-search-input">Search medications</label>
          <svg className="ph-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input
            id="ph-search-input"
            type="search"
            placeholder="Search medication name, generic name, or category…"
            value={filters.query}
            onChange={(event) => updateFilters({ ...filters, query: event.target.value })}
          />
        </div>
        <div className="ph-select">
          <label className="sr-only" htmlFor="ph-category">Category</label>
          <select
            id="ph-category"
            value={filters.category}
            onChange={(event) => updateFilters({ ...filters, category: event.target.value })}
          >
            <option value={ALL_CATEGORIES}>All Categories</option>
            {MEDICATION_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="ph-select">
          <label className="sr-only" htmlFor="ph-status">Status</label>
          <select
            id="ph-status"
            value={filters.status}
            onChange={(event) =>
              updateFilters({ ...filters, status: event.target.value as MedicationFilters['status'] })
            }
          >
            <option value={ALL_STATUSES}>All Status</option>
            {MEDICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="ph-add"
          onClick={() =>
            setNotice({
              title: 'Add Medication',
              body: 'Medication creation is not available in this reference demo.',
            })
          }
        >
          + Add Medication
        </button>
      </div>

      {rows.length > 0 ? (
        <table className="ph-table">
          <caption className="sr-only">Medication inventory</caption>
          <thead>
            <tr>
              {TABLE_COLUMNS.map((column) => (
                <th key={column} scope="col">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((medication) => (
              <tr key={medication.id}>
                <td data-label="Medication" className="ph-cell-medication">
                  <img src={MEDICATION_IMAGES[medication.id]} alt="" aria-hidden="true" />
                  <span>
                    <strong>{medication.name}</strong>
                    <small>{medication.genericName}</small>
                  </span>
                </td>
                <td data-label="Category">
                  <span className="ph-category-label">{medication.category}</span>
                </td>
                <td data-label="Dosage / Form" className="ph-cell-dosage">
                  <span>{medication.dosage}</span>
                  <span>{medication.form}</span>
                </td>
                <td data-label="Stock">
                  <span className={`ph-stock ph-stock--${STATUS_TONE[medication.status]}`}>{medication.stock}</span>
                </td>
                <td data-label="Price (IDR)">{medication.price}</td>
                <td data-label="Prescription">
                  {medication.prescription === 'Required' ? (
                    <span className="ph-rx">Required</span>
                  ) : (
                    <>
                      <span aria-hidden="true" className="ph-rx-dash">–</span>
                      <span className="sr-only">Not required</span>
                    </>
                  )}
                </td>
                <td data-label="Status">
                  <span className={`ph-status ph-status--${STATUS_TONE[medication.status]}`}>
                    <span aria-hidden="true" className="ph-status-dot" />
                    {medication.status}
                  </span>
                </td>
                <td data-label="Actions" className="ph-cell-actions">
                  <button type="button" className="ph-view" onClick={() => setViewTarget(medication)}>
                    View
                  </button>
                  <button
                    type="button"
                    className="ph-more"
                    aria-label={`More actions for ${medication.name}`}
                    onClick={() =>
                      setNotice({
                        title: 'Row actions',
                        body: 'Editing, dispensing, and stock adjustment are not available in this reference demo.',
                      })
                    }
                  >
                    <span aria-hidden="true">⋮</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="ph-empty">
          <p>
            {tabHasNoSuppliedRows(filters.tab)
              ? 'No reference rows were supplied for this category.'
              : 'No medications match these filters.'}
          </p>
          <button type="button" className="ph-reset" onClick={resetFilters}>Reset filters</button>
        </div>
      )}

      <div className="ph-footer">
        <p className="ph-showing">{showingText}</p>
        <nav className="ph-pagination" aria-label="Inventory pages">
          <button
            type="button"
            disabled={currentPage <= 1}
            aria-label="Previous page"
            onClick={() => setRequestedPage(currentPage - 1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          {Array.from({ length: pages }, (_, index) => {
            const pageNumber = index + 1
            return (
              <button
                key={pageNumber}
                type="button"
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                onClick={() => setRequestedPage(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          })}
          <button
            type="button"
            disabled={currentPage >= pages}
            aria-label="Next page"
            onClick={() => setRequestedPage(currentPage + 1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </nav>
      </div>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />

      <ReadOnlyDialog
        open={viewTarget !== null}
        title={viewTarget?.name ?? 'Medication'}
        onClose={() => setViewTarget(null)}
      >
        {viewTarget && (
          <dl className="db-dialog-facts">
            <div><dt>Generic name</dt><dd>{viewTarget.genericName}</dd></div>
            <div><dt>Category</dt><dd>{viewTarget.category}</dd></div>
            <div><dt>Dosage / Form</dt><dd>{viewTarget.dosage}, {viewTarget.form}</dd></div>
            <div><dt>Stock</dt><dd>{viewTarget.stock}</dd></div>
            <div><dt>Price (IDR)</dt><dd>{viewTarget.price}</dd></div>
            <div><dt>Prescription</dt><dd>{viewTarget.prescription}</dd></div>
            <div><dt>Status</dt><dd>{viewTarget.status}</dd></div>
          </dl>
        )}
        <p className="db-readonly-note">
          Read-only reference fixture. Stock adjustment, dispensing, and purchasing are not part of this demo.
        </p>
      </ReadOnlyDialog>
    </div>
  )
}
