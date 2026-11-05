import type { MenuConfig } from '../api.ts'
import { NAV_ITEMS } from './dashboardData.ts'

// Doctors and nurses see only these workspaces; the Vite dev server opens every menu.
export const MENU_FALLBACK: MenuConfig = {
  lock_enabled: !import.meta.env?.DEV,
  allowed_keys: ['dashboard', 'patients', 'appointments', 'medical-records', 'healthcare-assistant'],
  default_key: 'dashboard',
}

export function isMenuItemLocked(menu: MenuConfig, key: string): boolean {
  return menu.lock_enabled && !menu.allowed_keys.includes(key)
}

export function navKeyForPath(pathname: string): string | null {
  const match = NAV_ITEMS
    .filter((item) => item.route && (pathname === item.route || pathname.startsWith(`${item.route}/`)))
    .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0]
  return match?.key ?? null
}

export function isMenuPathAllowed(menu: MenuConfig, pathname: string): boolean {
  if (!menu.lock_enabled) return true
  const key = navKeyForPath(pathname)
  return key !== null && menu.allowed_keys.includes(key)
}

/** Null means the lock names no workspace this app can render. */
export function defaultMenuRoute(menu: MenuConfig): string | null {
  const allowed = NAV_ITEMS.filter((item) => item.route && !isMenuItemLocked(menu, item.key))
  const preferred = allowed.find((item) => item.key === menu.default_key)
  return (preferred ?? allowed[0])?.route ?? null
}
