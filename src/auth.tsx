import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, type MenuConfig, type User } from './api.ts'
import { MENU_FALLBACK } from './dashboard/menuLock.ts'

type AuthState = {
  /** undefined while the first session check is running */
  user: User | null | undefined
  /** undefined until the signed-in menu settings are known */
  menu: MenuConfig | undefined
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const DEV_BYPASS_EMAIL = 'dev@bunda.co.id'
const DEV_BYPASS_SESSION = 'bunda.dev-auth'

function hasDevBypassSession(): boolean {
  return import.meta.env.DEV && sessionStorage.getItem(DEV_BYPASS_SESSION) === DEV_BYPASS_EMAIL
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [menu, setMenu] = useState<MenuConfig | undefined>(undefined)

  useEffect(() => {
    let live = true
    async function load() {
      if (hasDevBypassSession()) {
        if (live) {
          setMenu(MENU_FALLBACK)
          setUser({ id: 0, email: DEV_BYPASS_EMAIL })
        }
        return
      }
      try {
        const nextUser = await api.me()
        if (!nextUser) {
          if (live) setUser(null)
          return
        }
        const nextMenu = await api.menu().catch(() => MENU_FALLBACK)
        if (live) {
          setMenu(nextMenu)
          setUser(nextUser)
        }
      } catch {
        if (live) setUser(null)
      }
    }
    void load()
    return () => {
      live = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    if (import.meta.env.DEV && email.trim().toLowerCase() === DEV_BYPASS_EMAIL) {
      sessionStorage.setItem(DEV_BYPASS_SESSION, DEV_BYPASS_EMAIL)
      setMenu(MENU_FALLBACK)
      setUser({ id: 0, email: DEV_BYPASS_EMAIL })
      return
    }
    const nextUser = await api.login(email, password, remember)
    const nextMenu = await api.menu().catch(() => MENU_FALLBACK)
    setMenu(nextMenu)
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    if (hasDevBypassSession()) {
      sessionStorage.removeItem(DEV_BYPASS_SESSION)
      setMenu(undefined)
      setUser(null)
      return
    }
    await api.logout()
    setMenu(undefined)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, menu, login, logout }), [user, menu, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** Only same-origin paths: one leading slash, no protocol-relative or backslash tricks. */
export function safeDestination(value: unknown): string {
  if (typeof value !== 'string' || !/^\/(?![/\\])/.test(value) || value.startsWith('/login')) return '/dashboard'
  return value
}

export function Boot() {
  return (
    <div className="boot" role="status">
      Loading…
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (user === undefined) return <Boot />
  if (user === null) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

export function RedirectHome() {
  const { user } = useAuth()
  if (user === undefined) return <Boot />
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}
