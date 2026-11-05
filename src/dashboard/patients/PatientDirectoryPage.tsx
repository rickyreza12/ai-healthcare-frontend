import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError, type Patient, type PatientPage, type PatientStatus } from '../../api.ts'
import { slugify } from '../dashboardData.ts'
import { DirectoryStatusBadge } from '../DashboardPrimitives.tsx'
import { DIRECTORY_TABS, type DirectoryStatus } from './patientDirectoryData.ts'
import { ALL_DATES, ALL_DEPARTMENTS, ALL_STATUSES, DIRECTORY_PAGE_SIZE, directoryPageWindow, patientAgeLabel, patientIdLabel } from './patientDirectoryLogic.ts'
import { formatDate } from './patientDetailView.ts'

type DirectoryFilters = {
  status: PatientStatus | typeof ALL_STATUSES
  department: string
  visitDate: string
}

const DEFAULT_FILTERS: DirectoryFilters = {
  status: ALL_STATUSES,
  department: ALL_DEPARTMENTS,
  visitDate: ALL_DATES,
}

const STATUS_LABELS: Record<PatientStatus, DirectoryStatus> = {
  inpatient: 'Inpatient',
  outpatient: 'Outpatient',
  emergency: 'Emergency',
  follow_up: 'Follow-up',
}

const PLUS_GLYPH = (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
)

const RESET_GLYPH = (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 5.5v5h5" />
    <path d="M5.8 14.6a7 7 0 1 0 1.1-6.9L4.5 10.5" />
  </svg>
)

const DEPARTMENT_GLYPH = (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.4 20.6V5.1a1.3 1.3 0 0 1 1.3-1.3h8.2a1.3 1.3 0 0 1 1.3 1.3v15.5" />
    <path d="M15.2 9.6h3.2a1.3 1.3 0 0 1 1.3 1.3v9.7" />
    <path d="M3 20.6h18" />
    <path d="M7.5 8h1.6M7.5 12h1.6M7.5 16h1.6M11.6 8h1.6M11.6 12h1.6M11.6 16h1.6" />
  </svg>
)

const STATUS_GLYPH = (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.8 12h4.3l2.1-6.4 3.5 12.8 2.1-6.4h6.4" />
  </svg>
)

const DATE_GLYPH = (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.3" y="5.4" width="17.4" height="15.2" rx="2.6" />
    <path d="M3.3 10.2h17.4M8.2 3.4v4M15.8 3.4v4" />
  </svg>
)

const CLOSE_GLYPH = (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
)

const patientPath = (id: string) => `/dashboard/patients/${encodeURIComponent(id)}`

function Chevron({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'prev' ? <path d="M14.5 5.5 8 12l6.5 6.5" /> : <path d="M9.5 5.5 16 12l-6.5 6.5" />}
    </svg>
  )
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('')
}

function Avatar({ src, name, size }: { src: string | null | undefined; name: string; size: number }) {
  if (src) {
    return <img src={src} alt="" width={size} height={size} className="db-dir-avatar" style={{ width: size, height: size }} />
  }
  return (
    <span
      className="db-dir-avatar db-dir-avatar--initials"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.6) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function CellStack({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <span className="db-cell-stack">
      <strong>{primary}</strong>
      <span>{secondary}</span>
    </span>
  )
}

/**
 * The compact desktop control hides its label; the stacked narrow layout shows it again.
 * The icon is decorative and sits behind the native select's leading padding.
 */
function FilterField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="db-field">
      <span className="db-field-label">{label}</span>
      <span className="db-field-control">
        <span className="db-field-icon">{icon}</span>
        {children}
      </span>
    </label>
  )
}

function PatientDirectoryPage() {
  const [filters, setFilters] = useState<DirectoryFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<readonly string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PatientPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const selectAllRef = useRef<HTMLInputElement>(null)
  const addDialogRef = useRef<HTMLDialogElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null)
  const addTitleId = useId()
  const navigate = useNavigate()

  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError('')
    api.patients.list({
      status: filters.status === ALL_STATUSES ? undefined : filters.status,
      department: filters.department === ALL_DEPARTMENTS ? undefined : filters.department,
      visitDate: filters.visitDate === ALL_DATES ? undefined : filters.visitDate,
      page,
      pageSize: DIRECTORY_PAGE_SIZE,
    }).then((next) => {
      if (!abort.signal.aborted) { setData(next); setLoading(false) }
    }).catch((reason) => {
      if (abort.signal.aborted) return
      setError(
        reason instanceof ApiError && reason.status === 401
          ? 'Your session expired. Sign in again to continue.'
          : reason instanceof ApiError && reason.status === 403
            ? 'You do not have permission to view the patient directory.'
            : reason instanceof Error ? reason.message : 'The patient directory could not be loaded.',
      )
      setLoading(false)
    })
    return () => abort.abort()
  }, [filters, page, reloadToken])

  const rows = data?.items ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageCount = Math.max(1, data?.totalPages ?? 1)
  const selectedVisible = rows.filter(row => selected.includes(row.patientId)).length
  const allVisibleSelected = rows.length > 0 && selectedVisible === rows.length
  const hasFilters = filters.status !== ALL_STATUSES
    || filters.department !== ALL_DEPARTMENTS
    || filters.visitDate !== ALL_DATES

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisible > 0 && selectedVisible < rows.length
    }
  }, [selectedVisible, rows.length])

  useEffect(() => {
    const dialog = addDialogRef.current
    if (!dialog) return
    if (addOpen && !dialog.open) dialog.showModal()
    if (!addOpen && dialog.open) dialog.close()
  }, [addOpen])

  // One row menu at a time; Escape restores the trigger and any outside pointer or scroll dismisses it.
  useEffect(() => {
    if (!menu) return
    const close = (restoreFocus: boolean) => {
      setMenu(null)
      if (restoreFocus) menuTriggerRef.current?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || menuTriggerRef.current?.contains(target)) return
      close(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }
    const onViewportChange = () => close(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [menu])

  // Fixed placement keeps the menu out of the table's horizontal scroll clipping.
  function openMenu(id: string, trigger: HTMLButtonElement) {
    const rect = trigger.getBoundingClientRect()
    const width = 168
    const below = rect.bottom + 6
    menuTriggerRef.current = trigger
    setMenu({
      id,
      top: below + 52 > window.innerHeight ? rect.top - 58 : below,
      left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    })
  }

  function applyFilters(patch: Partial<DirectoryFilters>) {
    setFilters(current => ({ ...current, ...patch }))
    setSelected([])
    setPage(1)
  }

  function toggleAll() {
    setSelected(allVisibleSelected ? [] : rows.map(row => row.patientId))
  }

  function toggleRow(id: string) {
    setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  }

  // The row is a pointer shortcut; controls inside it keep their own behavior and the name link carries keyboard access.
  function openRow(event: MouseEvent<HTMLTableRowElement>, id: string) {
    if ((event.target as HTMLElement).closest('a, button, input, label')) return
    navigate(patientPath(id))
  }

  const reload = useCallback(() => setReloadToken(token => token + 1), [])
  const visitDates = [...new Set(rows.map(row => row.lastVisit?.slice(0, 10)).filter((value): value is string => Boolean(value)))]

  return (
    <div className="db-directory">
      <div className="db-directory-head">
        <div className="db-directory-heading">
          <h1 className="db-directory-title">Patient Directory</h1>
          <p className="db-directory-sub">Manage and view all patient information</p>
        </div>
        <button type="button" className="db-btn-primary" onClick={() => setAddOpen(true)}>
          <span className="db-btn-primary-icon">{PLUS_GLYPH}</span>
          Add Patient
        </button>
      </div>

      <div className="db-directory-tabs" role="group" aria-label="Patient type filters">
        {DIRECTORY_TABS.map((tab) => {
          const status = tab.key === 'all' ? ALL_STATUSES : tab.key.toLowerCase().replace('-', '_') as PatientStatus
          const active = filters.status === status
          const count = tab.key === 'all' ? data?.statusCounts.all : data?.statusCounts[status as PatientStatus]
          return (
            <button
              key={tab.key}
              type="button"
              className={`db-tab db-tab--${slugify(tab.key)}${active ? ' db-tab--active' : ''}`}
              aria-pressed={active}
              onClick={() => applyFilters({ status })}
            >
              <span className="db-tab-label">{tab.label}</span>
              <span className="db-tab-count">{count === undefined ? '—' : count.toLocaleString('en-US')}</span>
            </button>
          )
        })}
      </div>

      <div className="db-directory-filters">
        <FilterField label="Department" icon={DEPARTMENT_GLYPH}>
          <select
            className="db-select"
            value={filters.department}
            onChange={(event) => applyFilters({ department: event.target.value })}
          >
            <option value={ALL_DEPARTMENTS}>All Departments</option>
            {(data?.filterOptions.departments ?? []).map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Status" icon={STATUS_GLYPH}>
          <select
            className="db-select"
            value={filters.status}
            onChange={(event) => applyFilters({ status: event.target.value as PatientStatus | typeof ALL_STATUSES })}
          >
            <option value={ALL_STATUSES}>All Status</option>
            {DIRECTORY_TABS.filter((tab) => tab.key !== 'all').map((tab) => (
              <option key={tab.key} value={tab.key.toLowerCase().replace('-', '_')}>{tab.label}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Visit date" icon={DATE_GLYPH}>
          <select
            className="db-select"
            data-placeholder={filters.visitDate === ALL_DATES || undefined}
            value={filters.visitDate}
            onChange={(event) => applyFilters({ visitDate: event.target.value })}
          >
            <option value={ALL_DATES}>Select Date Range</option>
            {(filters.visitDate !== ALL_DATES && !visitDates.includes(filters.visitDate)
              ? [filters.visitDate, ...visitDates]
              : visitDates
            ).map((date) => (
              <option key={date} value={date}>{formatDate(date)}</option>
            ))}
          </select>
        </FilterField>

        <button type="button" className="db-clear-filters" onClick={() => applyFilters(DEFAULT_FILTERS)}>
          {RESET_GLYPH}
          Clear Filters
        </button>
      </div>

      <section className="db-directory-panel" aria-label="Patient records" aria-busy={loading}>
        {loading && (
          <p className="db-directory-loading" role="status">Loading patients…</p>
        )}
        {!loading && error && (
          <div className="db-directory-empty" role="alert">
            <p className="db-directory-empty-title">Patient directory unavailable</p>
            <p className="db-directory-empty-text">{error}</p>
            <button type="button" className="db-clear-filters" onClick={reload}>
              {RESET_GLYPH}
              Try again
            </button>
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="db-directory-empty">
            <p className="db-directory-empty-title">
              {hasFilters ? 'No patients match these filters.' : 'No patients are recorded yet.'}
            </p>
            <p className="db-directory-empty-text">
              {hasFilters
                ? 'Adjust the filters or clear them to see the full directory.'
                : 'Registered patients will appear here once the record service stores them.'}
            </p>
            {hasFilters && (
              <button type="button" className="db-clear-filters" onClick={() => applyFilters(DEFAULT_FILTERS)}>
                {RESET_GLYPH}
                Clear filters
              </button>
            )}
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <>
            <div
              className="db-directory-table-wrap"
              role="region"
              aria-label="Patient table; scroll horizontally to reach every column"
              tabIndex={0}
            >
              <table className="db-directory-table">
                <caption className="sr-only">
                  Patient directory listing the name, patient ID, age, gender, room, unit, last visit, attending doctor,
                  specialty, and status of each patient.
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="db-col-select">
                      <label className="db-check">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAll}
                          aria-label="Select all patients on this page"
                        />
                      </label>
                    </th>
                    <th scope="col">Patient</th>
                    <th scope="col">Age / Gender</th>
                    <th scope="col">Room / Unit</th>
                    <th scope="col">Last Visit</th>
                    <th scope="col">Attending Doctor</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="db-col-actions">
                      <span aria-hidden="true">...</span>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((patient: Patient) => (
                    <tr
                      key={patient.patientId}
                      className="db-directory-row"
                      data-selected={selected.includes(patient.patientId) || undefined}
                      onClick={(event) => openRow(event, patient.patientId)}
                    >
                      <td className="db-col-select">
                        <label className="db-check">
                          <input
                            type="checkbox"
                            checked={selected.includes(patient.patientId)}
                            onChange={() => toggleRow(patient.patientId)}
                            aria-label={`Select ${patient.displayName}`}
                          />
                        </label>
                      </td>
                      <td>
                        <Link to={patientPath(patient.patientId)} className="db-directory-row-link">
                          <Avatar src={patient.avatarUrl} name={patient.displayName} size={48} />
                          <span className="db-cell-stack">
                            <strong>{patient.displayName}</strong>
                            <span>{patientIdLabel(patient.patientId)}</span>
                          </span>
                        </Link>
                      </td>
                      <td><CellStack primary={patientAgeLabel(patient.age)} secondary={patient.gender} /></td>
                      <td><CellStack primary={patient.room ?? '—'} secondary={patient.unit ?? '—'} /></td>
                      <td>{formatDate(patient.lastVisit, '—')}</td>
                      <td>
                        <span className="db-directory-identity">
                          <Avatar src={patient.doctor.avatarUrl} name={patient.doctor.displayName} size={48} />
                          <CellStack primary={patient.doctor.displayName} secondary={patient.doctor.specialty} />
                        </span>
                      </td>
                      <td><DirectoryStatusBadge status={STATUS_LABELS[patient.status]} /></td>
                      <td className="db-col-actions">
                        <button
                          type="button"
                          className="db-row-menu-button"
                          aria-haspopup="menu"
                          aria-expanded={menu?.id === patient.patientId}
                          aria-label={`Actions for ${patient.displayName}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (menu?.id === patient.patientId) setMenu(null)
                            else openMenu(patient.patientId, event.currentTarget)
                          }}
                        >
                          <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="5" r="1.7" />
                            <circle cx="12" cy="12" r="1.7" />
                            <circle cx="12" cy="19" r="1.7" />
                          </svg>
                        </button>
                        {menu?.id === patient.patientId && (
                          <div
                            ref={menuRef}
                            role="menu"
                            aria-label={`Actions for ${patient.displayName}`}
                            className="db-row-menu"
                            style={{ top: menu.top, left: menu.left }}
                          >
                            <Link
                              role="menuitem"
                              className="db-row-menu-link"
                              to={patientPath(patient.patientId)}
                              onClick={() => setMenu(null)}
                            >
                              View patient record
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="db-directory-cards" role="list">
              {rows.map((patient: Patient) => (
                <li key={patient.patientId} className="db-directory-card" data-selected={selected.includes(patient.patientId) || undefined}>
                  <div className="db-directory-card-head">
                    <label className="db-check">
                      <input
                        type="checkbox"
                        checked={selected.includes(patient.patientId)}
                        onChange={() => toggleRow(patient.patientId)}
                        aria-label={`Select ${patient.displayName}`}
                      />
                    </label>
                    <Avatar src={patient.avatarUrl} name={patient.displayName} size={44} />
                    <span className="db-cell-stack">
                      <strong>{patient.displayName}</strong>
                      <span>{patientIdLabel(patient.patientId)}</span>
                    </span>
                    <DirectoryStatusBadge status={STATUS_LABELS[patient.status]} />
                  </div>
                  <dl className="db-directory-card-facts">
                    <Fact label="Age" value={`${patientAgeLabel(patient.age)} · ${patient.gender}`} />
                    <Fact label="Room" value={`${patient.room ?? '—'} · ${patient.unit ?? '—'}`} />
                    <Fact label="Last visit" value={formatDate(patient.lastVisit, '—')} />
                    <Fact label="Attending doctor" value={`${patient.doctor.displayName} · ${patient.doctor.specialty}`} />
                  </dl>
                  <Link
                    to={patientPath(patient.patientId)}
                    className="db-directory-card-link"
                    aria-label={`View patient ${patient.displayName}`}
                  >
                    View patient
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="db-directory-foot">
          <p className="db-directory-count">
            {loading || error
              ? 'Loading patient records'
              : rows.length === 0
                ? 'No patients match these filters'
                : `Showing ${(currentPage - 1) * DIRECTORY_PAGE_SIZE + 1}-${(currentPage - 1) * DIRECTORY_PAGE_SIZE + rows.length} of ${total.toLocaleString('en-US')} patients`}
          </p>
          <nav className="db-pagination" aria-label="Patient directory pages">
            <span className="db-page-status">Page {currentPage} of {pageCount}</span>
            <button
              type="button"
              className="db-page db-page--step"
              disabled={loading || currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <Chevron dir="prev" />
            </button>
            {directoryPageWindow(currentPage, pageCount).map((item, index) =>
              item.kind === 'gap' ? (
                <span key={`gap-${index}`} className="db-page db-page--gap" aria-hidden="true">…</span>
              ) : item.page === currentPage ? (
                <span key={item.page} className="db-page db-page--active" aria-current="page">{item.page}</span>
              ) : (
                <button
                  key={item.page}
                  type="button"
                  className="db-page db-page--plain"
                  onClick={() => setPage(item.page)}
                  aria-label={`Page ${item.page}`}
                >
                  {item.page}
                </button>
              ),
            )}
            <button
              type="button"
              className="db-page db-page--step"
              disabled={loading || currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
            >
              <Chevron dir="next" />
            </button>
          </nav>
        </div>
      </section>

      <dialog
        ref={addDialogRef}
        className="db-dialog db-dialog--notice"
        aria-labelledby={addTitleId}
        onClose={() => setAddOpen(false)}
        onClick={(event) => { if (event.target === addDialogRef.current) setAddOpen(false) }}
      >
        <div className="db-dialog-body">
          <button type="button" className="db-dialog-close" onClick={() => setAddOpen(false)}>
            {CLOSE_GLYPH}<span className="sr-only">Close</span>
          </button>
          <h2 id={addTitleId}>Patient registration is not available.</h2>
          <p className="db-dialog-sub">
            The patient directory reads stored records. Creating a patient needs a registration workflow that this
            service does not expose.
          </p>
          <div className="db-dialog-actions">
            <button type="button" className="db-dialog-secondary" onClick={() => setAddOpen(false)}>Close</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export { PatientDirectoryPage, Avatar as PatientAvatar }
