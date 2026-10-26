import { Boot, useAuth } from '../auth.tsx'
import { defaultMenuRoute, isMenuPathAllowed } from './menuLock.ts'
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function RequireMenuAccess({ children }: { children: ReactNode }) {
  const { menu } = useAuth()
  const location = useLocation()

  if (!menu) return <Boot />
  if (isMenuPathAllowed(menu, location.pathname)) return children

  const target = defaultMenuRoute(menu)
  if (target) return <Navigate to={target} replace />

  return (
    <div className="db-feature">
      <h1>No workspace available</h1>
      <p className="db-feature-sub">The menu lock settings do not match a workspace in this app. Ask an administrator to check them.</p>
    </div>
  )
}
