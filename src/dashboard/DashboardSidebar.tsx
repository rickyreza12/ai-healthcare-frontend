import { useState, type CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth.tsx'
import { MENU_LOCKED_HINT, NAV_ITEMS, NAV_SECTION_LABEL, PROMO, UNAVAILABLE_CHIP, UNAVAILABLE_HINT, type NavIconKey } from './dashboardData.ts'
import { NAV_ICONS } from './dashboardAssets.ts'
import { MenuLockIcon } from './MenuLockIcon.tsx'
import { isMenuItemLocked } from './menuLock.ts'
import crossLogo from '../assets/dashboard/brand/bunda_cross_canonical.svg'
import promoScene from '../assets/dashboard/backgrounds/sidebar_promo_hospital_nurse_free.png'
import promoNurse from '../assets/dashboard/characters/sidebar_promo_nurse_writing_source_alpha.png'

function NavIcon({ name }: { name: NavIconKey }) {
  const style = { '--db-icon': `url("${NAV_ICONS[name]}")` } as CSSProperties
  return <span className="db-nav-icon" style={style} aria-hidden="true" />
}

export function DashboardNavList({ variant, onNavigate }: { variant: 'sidebar' | 'drawer'; onNavigate?: () => void }) {
  const { menu } = useAuth()
  if (!menu) return null

  return (
    <ul className={`db-nav db-nav--${variant}`} role="list">
      {NAV_ITEMS.map((item) => {
        const locked = isMenuItemLocked(menu, item.key)
        const content = (
          <>
            <NavIcon name={item.icon} />
            <span className="db-nav-label">{item.label}</span>
            {locked && <MenuLockIcon className="db-nav-lock" />}
            {/* The 198px rail has no room for a chip beside the longest reference label. */}
            {!locked && item.route === null && variant === 'drawer' && <span className="db-nav-chip" aria-hidden="true">{UNAVAILABLE_CHIP}</span>}
          </>
        )

        return (
          <li key={item.key}>
            {!locked && item.route ? (
              <NavLink
                to={item.route}
                end={item.key === 'dashboard'}
                className={({ isActive }) => `db-nav-link${isActive ? ' db-nav-link--active' : ''}`}
                onClick={onNavigate}
              >
                {content}
              </NavLink>
            ) : (
              <span
                className={`db-nav-link ${locked ? 'db-nav-link--locked' : 'db-nav-link--disabled'}`}
                aria-disabled="true"
                aria-label={`${item.label}, ${locked ? MENU_LOCKED_HINT : UNAVAILABLE_HINT}`}
                title={locked ? MENU_LOCKED_HINT : UNAVAILABLE_HINT}
              >
                {content}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function DashboardSidebar() {
  const { logout } = useAuth()
  const [logoutPending, setLogoutPending] = useState(false)
  const [logoutError, setLogoutError] = useState('')

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
    <aside className="db-sidebar" aria-label="Main navigation">
      <div className="db-sidebar-brand">
        <img src={crossLogo} alt="" width={26} height={26} className="db-sidebar-cross" />
        <span className="db-sidebar-wordmark">
          <strong>BUNDA</strong>
          <span>HEALTHCARE</span>
        </span>
      </div>

      <p className="db-sidebar-section">{NAV_SECTION_LABEL}</p>

      <nav aria-label="Workspace">
        <DashboardNavList variant="sidebar" />
      </nav>

      <div className="db-sidebar-foot">
        <div className="db-sidebar-promo">
          <img src={promoScene} alt="" className="db-sidebar-promo-scene" width={816} height={704} />
          <img src={promoNurse} alt="" className="db-sidebar-promo-nurse" width={816} height={704} />
          <div className="db-sidebar-promo-copy">
            <strong>{PROMO.headline[0]}</strong>
            <strong>{PROMO.headline[1]}</strong>
            <span>{PROMO.note}</span>
          </div>
        </div>

        {logoutError && <p className="db-sidebar-error" role="alert">{logoutError}</p>}
        <button type="button" className="db-sidebar-logout" onClick={handleLogout} disabled={logoutPending}>
          {logoutPending ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
