import type { MenuConfig } from '../api.ts'
import { NAV_ITEMS } from './dashboardData.ts'

// shortcut: the fallback opens every menu while lock mode is off; restore a fail-closed fallback before enabling the lock.
export const MENU_FALLBACK: MenuConfig = {
  lock_enabled: false,
  allowed_keys: ['patients', 'healthcare-assistant'],
  default_key: 'patients',
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
