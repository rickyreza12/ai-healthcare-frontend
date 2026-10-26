import { useRef, useState, type FormEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Navigate, useLocation } from 'react-router-dom'
import { validate, type FieldErrors } from './validate.ts'
import { ApiError, NetworkError } from './api.ts'
import { Boot, safeDestination, useAuth } from './auth.tsx'
import background from './assets/login/background.webp'
import nurse from './assets/login/nurse.png'
import cardIcon from './assets/login/icon.png'
import googleIcon from './assets/login/google.png'
import appleIcon from './assets/login/apple.png'
import microsoftIcon from './assets/login/microsoft.png'

gsap.registerPlugin(useGSAP)

const PROVIDERS = [
  { name: 'Google', icon: googleIcon },
  { name: 'Apple', icon: appleIcon },
  { name: 'Microsoft', icon: microsoftIcon },
]

const icon = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [feedback, setFeedback] = useState<{ id: number; text: string } | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const { user, login } = useAuth()
  const location = useLocation()

  useGSAP(
    () => {
      if (!feedback) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(feedbackRef.current, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.out', overwrite: true })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(feedbackRef.current, { opacity: 1 })
      })
      return () => mm.revert()
    },
    { dependencies: [feedback], revertOnUpdate: true },
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting.current) return
    const found = validate(email, password)
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()
    submitting.current = true
    setPending(true)
    try {
      await login(email, password, remember)
    } catch (err) {
      const text =
        err instanceof NetworkError
          ? err.message
          : err instanceof ApiError && err.status === 401
            ? 'Email or password is incorrect.'
            : 'Sign-in failed. Try again in a moment.'
      setFeedback({ id: Date.now(), text })
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  if (user === undefined) return <Boot />
  if (user) return <Navigate to={safeDestination((location.state as { from?: unknown } | null)?.from)} replace />

  return (
    <div className="login" style={{ backgroundImage: `url(${background})` }}>
      <div className="stage">
        <div className="scene" aria-hidden="true">
          <img className="nurse" src={nurse} alt="" />
        </div>
        <main className="panel">
          <div className="brand-lockup">
            <img className="brand-icon" src={cardIcon} alt="" />
            <div className="brand-text">
              <span className="brand-name">BUNDA</span>
              <span className="brand-sub">Healthcare</span>
            </div>
          </div>
          <p className="tagline">Caring for Every Generation.</p>
          <h1>Welcome Back</h1>
          <p className="lede">Sign in to your BUNDA Healthcare account to continue your care journey.</p>

          <form noValidate onSubmit={(e) => void onSubmit(e)}>
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="control">
                <svg {...icon} className="lead"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7.5 8 6 8-6" /></svg>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@bunda.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && <p id="email-error" className="error">{errors.email}</p>}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="control">
                <svg {...icon} className="lead"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="eye"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg {...icon}><path d="M3 3l18 18" /><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 8.5 4.2 9.5 6a14 14 0 0 1-2.6 3.2M6.5 7.6A14 14 0 0 0 2.5 12c1 1.800 4.500 6 9.500 6 1.400 0 2.600-.3 3.700-.8" /><path d="M9.900 10a3 3 0 0 0 4.100 4.100" /></svg>
                  ) : (
                    <svg {...icon}><path d="M2.500 12C3.500 10.200 7 6 12 6s8.500 4.200 9.500 6c-1 1.800-4.500 6-9.500 6s-8.500-4.200-9.500-6Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p id="password-error" className="error">{errors.password}</p>}
            </div>

            <div className="row">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <span className="link off" aria-disabled="true">Forgot Password?</span>
            </div>

            <div ref={feedbackRef} className="feedback" role="status">
              {feedback?.text}
            </div>

            <button type="submit" className="primary" disabled={pending} aria-busy={pending}>
              {pending ? 'Signing in…' : 'Login'}
              {!pending && <svg {...icon} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
            </button>
          </form>

          <div className="divider"><span>Or continue with</span></div>
          <div className="providers">
            {PROVIDERS.map((p) => (
              <button key={p.name} type="button" disabled aria-label={`Continue with ${p.name}`}>
                <img src={p.icon} alt="" />
              </button>
            ))}
          </div>

          <button type="button" className="secondary" disabled>Create Account</button>

          <p className="legal">
            By signing in, you agree to our <span className="off">Terms of Service</span> and <span className="off">Privacy Policy</span>.
          </p>
          <p className="legal notice">Social sign-in, password reset, registration and legal pages are not available yet.</p>
        </main>
      </div>
    </div>
  )
}
