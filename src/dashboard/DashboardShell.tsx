import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardNavList, DashboardSidebar } from './DashboardSidebar.tsx'
import { DashboardTopbar } from './DashboardTopbar.tsx'
import { DashboardMobileNav } from './DashboardMobileNav.tsx'
import { RequireMenuAccess } from './RequireMenuAccess.tsx'
import { Boot, useAuth } from '../auth.tsx'
import bundaLogo from '../assets/dashboard/brand/bunda_cross_logo_transparent.png'

export function DashboardShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const { logout, menu } = useAuth()
  const [logoutPending, setLogoutPending] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  useEffect(() => {
    if (drawerOpen) closeRef.current?.focus()
  }, [drawerOpen])

  function closeDrawer() {
    setDrawerOpen(false)
    menuRef.current?.focus()
  }

  // Escape must also work when focus sits outside the trap (for example on the backdrop).
  useEffect(() => {
    if (!drawerOpen) return
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  function onDrawerKey(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not(:disabled),input,[tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function handleDrawerLogout() {
    setLogoutPending(true)
    setLogoutError('')
    try {
      await logout()
    } catch {
      setLogoutError('Sign out failed. Try again.')
      setLogoutPending(false)
    }
  }

  if (!menu) return <Boot />

  return (
    <div className="db-shell">
      <a href="#db-main" className="db-skip">Skip to content</a>
      <DashboardSidebar />

      <DashboardTopbar />

      <header className="db-mobile-topbar">
        <button ref={menuRef} type="button" className="db-mobile-menu" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" width={24} height={24} aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <img src={bundaLogo} alt="BUNDA Healthcare" width={104} height={37} className="db-mobile-logo" />
      </header>

      <div className="db-drawer-backdrop" data-open={drawerOpen} onClick={closeDrawer} />
      <div ref={drawerRef} className="db-drawer" data-open={drawerOpen} role="dialog" aria-modal="true" aria-label="Navigation" onKeyDown={onDrawerKey}>
        <div className="db-drawer-head">
          <img src={bundaLogo} alt="BUNDA Healthcare" width={120} height={43} />
          <button ref={closeRef} type="button" className="db-drawer-close" aria-label="Close menu" onClick={closeDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" width={24} height={24} aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Workspace">
          <DashboardNavList variant="drawer" onNavigate={closeDrawer} />
        </nav>
        {logoutError && <p className="db-sidebar-error" role="alert">{logoutError}</p>}
        <button type="button" className="db-drawer-logout" onClick={handleDrawerLogout} disabled={logoutPending}>
          {logoutPending ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>

      <main id="db-main" className="db-main" inert={drawerOpen || undefined}>
        <RequireMenuAccess>
          <Outlet />
        </RequireMenuAccess>
      </main>

      <DashboardMobileNav />
    </div>
  )
}
