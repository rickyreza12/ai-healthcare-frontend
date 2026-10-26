import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.tsx'
import { DOCTOR, RECENT_PATIENTS, TODAYS_APPOINTMENTS } from './dashboardData.ts'
import { searchFixtures } from './dashboardLogic.ts'
import { AVATARS } from './dashboardAssets.ts'
import { useDismissible } from './useDismissible.ts'
import { DIRECTORY_PATIENTS } from './patients/patientDirectoryData.ts'
import { MEDICAL_RECORDS } from './medicalRecords/medicalRecordData.ts'

const SEARCH_RESULT_LIMIT = 8

function SearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false" className="db-topbar-glyph db-topbar-glyph--search">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  )
}

function BellGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="db-topbar-glyph db-topbar-glyph--bell">
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.7 3H4.3z" />
      <path d="M10.5 21.5a2 2 0 0 0 3 0" />
    </svg>
  )
}

function Popover({ open, label, children }: { open: boolean; label: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="db-popover" role="dialog" aria-label={label}>
      {children}
    </div>
  )
}

export function DashboardTopbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutPending, setLogoutPending] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const searchBoxRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const notifBoxRef = useRef<HTMLDivElement>(null)
  const notifButtonRef = useRef<HTMLButtonElement>(null)
  const profileBoxRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)

  const results = searchFixtures(query, RECENT_PATIENTS, TODAYS_APPOINTMENTS, DIRECTORY_PATIENTS, MEDICAL_RECORDS)
  const trimmedQuery = query.trim()

  // The pediatric workspace carries its own clinician identity in the shared top bar.
  // The global DOCTOR identity is never overwritten; it stays for every other route.
  const isPediatric = location.pathname === '/dashboard/pediatric'
  const topbarName = isPediatric ? 'Dr. Siti Aisyah' : DOCTOR.name
  const topbarRole = isPediatric ? 'General Pediatrician' : DOCTOR.role
  const topbarAvatar = isPediatric ? AVATARS.sitiAisyah : AVATARS[DOCTOR.avatar]

  // Each workspace reference gives the shared search field its own scope.
  const searchPlaceholder = location.pathname === '/dashboard/pharmacy'
    ? 'Search patients, medications, prescriptions…'
    : 'Search patients, appointments, and medical records'

  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const closeNotif = useCallback(() => setNotifOpen(false), [])
  const closeProfile = useCallback(() => {
    setProfileOpen(false)
    setLogoutError('')
  }, [])

  useDismissible(searchOpen, closeSearch, searchBoxRef, searchInputRef)
  useDismissible(notifOpen, closeNotif, notifBoxRef, notifButtonRef)
  useDismissible(profileOpen, closeProfile, profileBoxRef, profileButtonRef)

  function onSearchInput(value: string) {
    setQuery(value)
    setSearchOpen(value.trim().length > 0)
  }

  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Escape') return
    if (query) setQuery('')
    else setSearchOpen(false)
  }

  async function handleLogout() {
    setLogoutPending(true)
    setLogoutError('')
    try {
      await logout()
    } catch {
      setLogoutError('Sign out failed. Try again.')
      setLogoutPending(false)
    }
  }

  return (
    <header className="db-topbar">
      <div className="db-topbar-search" ref={searchBoxRef}>
        <SearchGlyph />
        <input
          ref={searchInputRef}
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          aria-expanded={searchOpen && trimmedQuery.length > 0}
          value={query}
          onChange={(event) => onSearchInput(event.target.value)}
          onFocus={() => { if (trimmedQuery) setSearchOpen(true) }}
          onKeyDown={onSearchKey}
        />
        <p className="sr-only" aria-live="polite">
          {searchOpen && trimmedQuery ? `${results.length} matching records` : ''}
        </p>
        <Popover open={searchOpen && trimmedQuery.length > 0} label="Search results">
          {results.length > 0 ? (
            <>
              <ul className="db-search-results">
                {results.slice(0, SEARCH_RESULT_LIMIT).map((result) => (
                  <li key={`${result.name}-${result.detail}`}>
                    {result.href ? (
                      <Link
                        to={result.href}
                        className="db-search-item db-search-item--link"
                        onClick={() => setSearchOpen(false)}
                      >
                        <span className="db-search-label">{result.name}</span>
                        <span className="db-search-sub">{result.detail}</span>
                      </Link>
                    ) : (
                      <span className="db-search-item">
                        <span className="db-search-label">{result.name}</span>
                        <span className="db-search-sub">{result.detail}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {results.length > SEARCH_RESULT_LIMIT && (
                <p className="db-popover-empty">
                  Showing {SEARCH_RESULT_LIMIT} of {results.length} matches. Refine your search.
                </p>
              )}
            </>
          ) : (
            <p className="db-popover-empty">No records match “{trimmedQuery}”.</p>
          )}
        </Popover>
      </div>

      <div className="db-topbar-control" ref={notifBoxRef}>
        <button
          ref={notifButtonRef}
          type="button"
          className="db-icon-button"
          aria-label="Notifications, 1 unread"
          aria-expanded={notifOpen}
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setSearchOpen(false) }}
        >
          <BellGlyph />
          <span className="db-icon-button-dot" aria-hidden="true" />
        </button>
        <Popover open={notifOpen} label="Notifications">
          <p className="db-popover-empty">No new notifications</p>
        </Popover>
      </div>

      <div className="db-topbar-control" ref={profileBoxRef}>
        <button
          ref={profileButtonRef}
          type="button"
          className="db-topbar-profile"
          aria-label={`Account menu for ${user?.email ?? topbarName}`}
          aria-expanded={profileOpen}
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setSearchOpen(false) }}
        >
          <img src={topbarAvatar} alt="" width={44} height={44} className="db-topbar-avatar" />
          <span className="db-topbar-identity">
            <span className="db-topbar-name">{topbarName}</span>
            <span className="db-topbar-role">{topbarRole}</span>
          </span>
          <span className="db-topbar-caret" aria-hidden="true">⌄</span>
        </button>
        <Popover open={profileOpen} label="Account menu">
          <div className="db-profile-menu">
            {user?.email && <p className="db-profile-email">{user.email}</p>}
            {logoutError && <p className="db-profile-error" role="alert">{logoutError}</p>}
            <button type="button" className="db-profile-logout" onClick={handleLogout} disabled={logoutPending}>
              {logoutPending ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </Popover>
      </div>
    </header>
  )
}
