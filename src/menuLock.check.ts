import assert from 'node:assert/strict'
import type { MenuConfig } from './api.ts'
import {
  MENU_FALLBACK,
  defaultMenuRoute,
  isMenuItemLocked,
  isMenuPathAllowed,
  navKeyForPath,
} from './dashboard/menuLock.ts'

// The fallback follows the current unlocked default.
assert.equal(MENU_FALLBACK.lock_enabled, false)

const locked: MenuConfig = {
  lock_enabled: true,
  allowed_keys: ['patients', 'healthcare-assistant'],
  default_key: 'patients',
}

assert.deepEqual(locked.allowed_keys, ['patients', 'healthcare-assistant'])
assert.equal(locked.default_key, 'patients')

// The longest matching route wins, so /dashboard does not unlock its children.
assert.equal(navKeyForPath('/dashboard'), 'dashboard')
assert.equal(navKeyForPath('/dashboard/patients/P-00012345'), 'patients')
assert.equal(navKeyForPath('/dashboard/healthcare-assistant'), 'healthcare-assistant')
assert.equal(navKeyForPath('/dashboard/appointments/a-1'), 'appointments')
assert.equal(navKeyForPath('/dashboard/medical-records'), 'medical-records')

// Only the two allowed workspaces open.
assert.equal(isMenuPathAllowed(locked, '/dashboard/patients'), true)
assert.equal(isMenuPathAllowed(locked, '/dashboard/patients/P-00012345'), true)
assert.equal(isMenuPathAllowed(locked, '/dashboard/healthcare-assistant'), true)
assert.equal(isMenuPathAllowed(locked, '/dashboard'), false)
assert.equal(isMenuPathAllowed(locked, '/dashboard/appointments'), false)
assert.equal(isMenuPathAllowed(locked, '/dashboard/pharmacy'), false)
assert.equal(isMenuPathAllowed(locked, '/not-a-dashboard-page'), false)

// Items outside the allow list are locked, including unavailable routes.
assert.equal(isMenuItemLocked(locked, 'patients'), false)
assert.equal(isMenuItemLocked(locked, 'healthcare-assistant'), false)
assert.equal(isMenuItemLocked(locked, 'dashboard'), true)
assert.equal(isMenuItemLocked(locked, 'notifications'), true)
assert.equal(defaultMenuRoute(locked), '/dashboard/patients')

// Turning the lock off opens every workspace and does not redirect.
const unlocked: MenuConfig = { lock_enabled: false, allowed_keys: ['patients'], default_key: 'patients' }
assert.equal(isMenuPathAllowed(unlocked, '/dashboard/pharmacy'), true)
assert.equal(isMenuItemLocked(unlocked, 'dashboard'), false)

// The allowed keys and default key are configuration, not hard-coded order.
const custom: MenuConfig = { lock_enabled: true, allowed_keys: ['appointments'], default_key: 'appointments' }
assert.equal(isMenuItemLocked(custom, 'patients'), true)
assert.equal(isMenuItemLocked(custom, 'appointments'), false)
assert.equal(defaultMenuRoute(custom), '/dashboard/appointments')

console.log('menu lock checks passed')
