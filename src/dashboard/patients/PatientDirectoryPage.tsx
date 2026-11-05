import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError, type FieldError, type Patient, type PatientCreate, type PatientPage, type PatientStatus } from '../../api.ts'
import { useAuth } from '../../auth.tsx'
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
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<readonly string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [createdMessage, setCreatedMessage] = useState('')
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
  const { user } = useAuth()

  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError('')
    api.patients.list({
      q: query.trim() || undefined,
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
  }, [filters, page, query, reloadToken])

  const rows = data?.items ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageCount = Math.max(1, data?.totalPages ?? 1)
  const selectedVisible = rows.filter(row => selected.includes(row.patientId)).length
  const allVisibleSelected = rows.length > 0 && selectedVisible === rows.length
  const hasFilters = filters.status !== ALL_STATUSES
    || filters.department !== ALL_DEPARTMENTS
    || filters.visitDate !== ALL_DATES
    || Boolean(query.trim())

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

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    setQuery('')
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
        {user?.role === 'nurse' && <button type="button" className="db-btn-primary" onClick={() => { setCreatedMessage(''); setAddOpen(true) }}>
          <span className="db-btn-primary-icon">{PLUS_GLYPH}</span>
          Add Patient
        </button>}
      </div>
      {createdMessage && <p role="status" className="db-registration-success">{createdMessage}</p>}

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
        <label className="db-field db-directory-search">
          <span className="db-field-label">Search patients</span>
          <input className="db-select" type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Name, patient code, or MRN" aria-label="Search patients by name, patient code, or MRN" />
        </label>
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

        <button type="button" className="db-clear-filters" onClick={clearFilters}>
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
                <button type="button" className="db-clear-filters" onClick={clearFilters}>
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
        className="db-dialog db-dialog--registration"
        aria-labelledby={addTitleId}
        onClose={() => { setAddOpen(false); window.setTimeout(() => document.querySelector<HTMLButtonElement>('.db-directory-head .db-btn-primary')?.focus(), 0) }}
        onClick={(event) => { if (event.target === addDialogRef.current) setAddOpen(false) }}
      >
        <div className="db-dialog-body">
          <button type="button" className="db-dialog-close" onClick={() => setAddOpen(false)}>
            {CLOSE_GLYPH}<span className="sr-only">Close</span>
          </button>
          <PatientRegistrationForm key={addOpen ? 'open' : 'closed'} titleId={addTitleId} open={addOpen} onCancel={() => setAddOpen(false)} onCreated={patient => {
            setCreatedMessage('Patient registered. Directory refreshed.')
            setAddOpen(false); setFilters(DEFAULT_FILTERS); setQuery(patient.patientNumber); setPage(1); setSelected([]); setReloadToken(token => token + 1)
          }} />
        </div>
      </dialog>
    </div>
  )
}

const EMPTY_PATIENT: PatientCreate = {
  patientCode: '', mrn: '', fullName: '', dateOfBirth: '', gender: 'female', religion: '', phone: '', address: '',
  status: 'outpatient', room: '', unit: '', attendingClinicianId: '',
}

function PatientRegistrationForm({ titleId, open, onCancel, onCreated }: { titleId: string; open: boolean; onCancel: () => void; onCreated: (patient: Patient) => void }) {
  const [form, setForm] = useState<PatientCreate>(EMPTY_PATIENT)
  const [doctors, setDoctors] = useState<{ id: string; displayName: string; specialty: string }[]>([])
  const [doctorState, setDoctorState] = useState('Loading attending doctors…')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const key = useRef<string | undefined>(undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const firstField = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return
    let live = true
    api.doctors().then(({ items }) => {
      if (!live) return
      setDoctors(items); setDoctorState(items.length ? '' : 'No active doctors are available.')
    }).catch(reason => { if (live) setDoctorState(reason instanceof Error ? reason.message : 'Could not load doctors.') })
    return () => { live = false }
  }, [open])
  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    key.current = undefined
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
    setFieldErrors(current => { const next = { ...current }; delete next[event.target.name]; return next })
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setFieldErrors({}); setPending(true); key.current ??= crypto.randomUUID()
    try {
      const patient = await api.patients.create(Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '')) as PatientCreate, key.current)
      key.current = undefined; onCreated(patient)
    } catch (reason) {
      if (reason instanceof ApiError) {
        const mapped = Object.fromEntries(reason.fieldErrors.map((item: FieldError) => [item.field, item.message]))
        setFieldErrors(mapped)
        setError(reason.status === 401 ? 'Your session expired. Sign in again.' : reason.status === 403 ? 'Only nurses can register patients.' : reason.status === 409 ? 'Patient code or MRN already exists. Check the entered values.' : reason.status === 422 ? reason.message || 'Correct the highlighted fields.' : reason.message)
        const field = Object.keys(mapped)[0]
        if (field) (formRef.current?.elements.namedItem(field) as HTMLElement | null)?.focus()
        else firstField.current?.focus()
      } else { setError(reason instanceof Error ? reason.message : 'Patient could not be registered. Try again.'); firstField.current?.focus() }
    } finally { setPending(false) }
  }
  function cancel() { setForm(EMPTY_PATIENT); key.current = undefined; setError(''); setFieldErrors({}); onCancel() }
  const field = (name: keyof PatientCreate, label: string, required = false, type = 'text') => <label className="db-registration-field" key={name}>
    <span>{label}{required ? ' (required)' : ' (optional)'}</span>
    <input ref={name === 'patientCode' ? firstField : undefined} name={name} type={type} value={String(form[name] ?? '')} onChange={update} required={required} max={type === 'date' ? new Date().toISOString().slice(0, 10) : undefined} aria-invalid={Boolean(fieldErrors[name])} aria-describedby={fieldErrors[name] ? `${name}-error` : undefined} />
    {fieldErrors[name] && <small id={`${name}-error`} role="alert">{fieldErrors[name]}</small>}
  </label>
  return <>
    <h2 id={titleId}>Register patient</h2>
    <p className="db-dialog-sub">Required fields are marked. Patient records are saved to the clinical system.</p>
    <form ref={formRef} className="db-registration-form" onSubmit={submit}>
      <fieldset className="db-registration-fields" disabled={pending}>
      {error && <p className="db-registration-error" role="alert" tabIndex={-1}>{error}</p>}
      {field('patientCode', 'Patient code', true)}{field('mrn', 'MRN', true)}{field('fullName', 'Full name', true)}{field('dateOfBirth', 'Date of birth', true, 'date')}
      <label className="db-registration-field"><span>Gender (required)</span><select name="gender" value={form.gender} onChange={update} required aria-invalid={Boolean(fieldErrors.gender)}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select>{fieldErrors.gender && <small role="alert">{fieldErrors.gender}</small>}</label>
      {field('religion', 'Religion')}{field('phone', 'Phone')}
      <label className="db-registration-field"><span>Address (optional)</span><textarea name="address" value={form.address} onChange={update} rows={2} aria-invalid={Boolean(fieldErrors.address)} />{fieldErrors.address && <small role="alert">{fieldErrors.address}</small>}</label>
      <label className="db-registration-field"><span>Status (required)</span><select name="status" value={form.status} onChange={update} required aria-invalid={Boolean(fieldErrors.status)}><option value="inpatient">Inpatient</option><option value="outpatient">Outpatient</option><option value="emergency">Emergency</option><option value="follow_up">Follow-up</option></select>{fieldErrors.status && <small role="alert">{fieldErrors.status}</small>}</label>
      {field('room', 'Room')}{field('unit', 'Unit', true)}
      <label className="db-registration-field"><span>Attending doctor (required)</span><select name="attendingClinicianId" value={form.attendingClinicianId} onChange={update} required disabled={!doctors.length} aria-invalid={Boolean(fieldErrors.attendingClinicianId)}><option value="">{doctorState || 'Select a doctor'}</option>{doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.displayName}{doctor.specialty ? ` · ${doctor.specialty}` : ''}</option>)}</select>{doctorState && <small role="status">{doctorState}</small>}{fieldErrors.attendingClinicianId && <small role="alert">{fieldErrors.attendingClinicianId}</small>}</label>
      </fieldset>
      <div className="db-dialog-actions"><button type="button" className="db-dialog-secondary" onClick={cancel} disabled={pending}>Cancel</button><button type="submit" className="db-dialog-primary" disabled={pending || !doctors.length}>{pending ? 'Saving…' : 'Register patient'}</button></div>
    </form>
  </>
}

export { PatientDirectoryPage, Avatar as PatientAvatar }
