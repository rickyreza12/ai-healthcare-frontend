import { type CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth.tsx'
import { MENU_LOCKED_HINT, NAV_ITEMS, type NavItem } from './dashboardData.ts'
import { NAV_ICONS } from './dashboardAssets.ts'
import { MenuLockIcon } from './MenuLockIcon.tsx'
import { isMenuItemLocked } from './menuLock.ts'

const MOBILE_TAB_KEYS = ['patients', 'healthcare-assistant', 'appointments', 'pharmacy'] as const

const TAB_ITEMS: readonly NavItem[] = MOBILE_TAB_KEYS.flatMap((key) => NAV_ITEMS.filter((item) => item.key === key))

function TabIcon({ item }: { item: NavItem }) {
  return <span className="db-mobile-icon" style={{ '--db-icon': `url("${NAV_ICONS[item.icon]}")` } as CSSProperties} aria-hidden="true" />
}

export function DashboardMobileNav() {
  const { menu } = useAuth()
  if (!menu) return null

  return (
    <nav className="db-mobile-nav" aria-label="Mobile navigation">
      {TAB_ITEMS.map((tab) => {
        const locked = isMenuItemLocked(menu, tab.key)
        if (locked) {
          return (
            <span
              key={tab.key}
              className="db-mobile-tab db-mobile-tab--locked"
              aria-disabled="true"
              aria-label={`${tab.label}, ${MENU_LOCKED_HINT}`}
            >
              <TabIcon item={tab} />
              <span className="db-mobile-label">
                {tab.label}
                <MenuLockIcon className="db-mobile-lock" />
              </span>
            </span>
          )
        }
        return (
          <NavLink
            key={tab.key}
            to={tab.route ?? '/dashboard/patients'}
            className={({ isActive }) => `db-mobile-tab${isActive ? ' db-mobile-tab--active' : ''}`}
          >
            <TabIcon item={tab} />
            <span>{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
