import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import {
  DEFAULT_PROFILE_DRAFT,
  EDITABLE_FIELDS,
  PROFILE_FIXTURE,
  PROFILE_INITIALS,
  PROFILE_PAGE,
  PROFILE_SECTIONS,
  SUPPORTED_THEME,
  THEME_CHOICES,
  normalizeRequiredField,
  type EditableFieldKey,
  type ProfileDraft,
  type ProfileSectionKey,
} from './profileData.ts'
import { loadProfileDraft, saveProfileDraft } from './profileStorage.ts'

import doctorPortrait from '../../assets/dashboard/profile/doctor_portrait.png'

import './profile.css'

type EditValues = Record<EditableFieldKey, string>
type EditErrors = Partial<Record<EditableFieldKey, string>>

function initialDraft(): ProfileDraft {
  try {
    return loadProfileDraft(window.localStorage) ?? DEFAULT_PROFILE_DRAFT
  } catch {
    return DEFAULT_PROFILE_DRAFT
  }
}

const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'prof-section-icon' } as const

const SECTION_ICONS: Record<string, ReactNode> = {
  profile: <svg {...iconProps}><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>,
  account: <svg {...iconProps}><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.7-1.6L13.5 2h-3l-.3 2.8a7 7 0 0 0-2.7 1.6l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .55.07 1.08.2 1.6l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.7 1.6l.3 2.8h3l.3-2.8a7 7 0 0 0 2.7-1.6l2.3.9 2-3.4-2-1.5c.13-.52.2-1.05.2-1.6Z" /></svg>,
  care: <svg {...iconProps}><path d="M12 20.5S4 15.5 4 10a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 10c0 5.5-8 10.5-8 10.5Z" /></svg>,
  notifications: <svg {...iconProps}><path d="M18 10a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" /><path d="M10.3 19.5a2 2 0 0 0 3.4 0" /></svg>,
  security: <svg {...iconProps}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>,
}

const INITIAL_EDIT: EditValues = {
  fullName: DEFAULT_PROFILE_DRAFT.fullName,
  phone: DEFAULT_PROFILE_DRAFT.phone,
  specialization: DEFAULT_PROFILE_DRAFT.specialization,
}

/** Storage may be unavailable; the page then keeps its in-memory demo state. */
function persistDraft(draft: ProfileDraft) {
  try {
    saveProfileDraft(window.localStorage, draft)
  } catch {
    // Storage unavailable; nothing to persist.
  }
}

export function ProfileSettingsPage() {
  const [draft, setDraft] = useState<ProfileDraft>(initialDraft)
  // Only Profile content ships, so the active section never changes.
  const section: ProfileSectionKey = 'profile'
  const [notice, setNotice] = useState<Notice | null>(null)
  const [saved, setSaved] = useState(false)
  const [portraitFailed, setPortraitFailed] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editValues, setEditValues] = useState<EditValues>(INITIAL_EDIT)
  const [editErrors, setEditErrors] = useState<EditErrors>({})

  const editDialogRef = useRef<HTMLDialogElement>(null)
  const editOpenerRef = useRef<HTMLButtonElement>(null)

  const openEdit = () => {
    setEditValues({
      fullName: draft.fullName,
      phone: draft.phone,
      specialization: draft.specialization,
    })
    setEditErrors({})
    setSaved(false)
    setEditOpen(true)
    editDialogRef.current?.showModal()
  }

  const closeEdit = () => {
    editDialogRef.current?.close()
  }

  const onEditClosed = () => {
    setEditOpen(false)
    editOpenerRef.current?.focus()
  }

  const saveEdit = (event: FormEvent) => {
    event.preventDefault()
    const errors: EditErrors = {}
    const next: Record<EditableFieldKey, string> = { ...editValues }
    for (const field of EDITABLE_FIELDS) {
      const normalized = normalizeRequiredField(editValues[field.key])
      if (normalized === null) errors[field.key] = `${field.label} is required.`
      else next[field.key] = normalized
    }
    setEditErrors(errors)
    if (Object.keys(errors).length > 0) return
    const newDraft: ProfileDraft = { ...draft, ...next }
    setDraft(newDraft)
    persistDraft(newDraft)
    setSaved(true)
    closeEdit()
  }

  const toggleNotifications = (checked: boolean) => {
    const newDraft: ProfileDraft = { ...draft, notifications: checked }
    setDraft(newDraft)
    persistDraft(newDraft)
  }

  const selectSection = (key: ProfileSectionKey, label: string) => {
    if (key === 'profile') return
    setNotice({
      title: label,
      body: `${label} is not included in this reference demo. Profile stays open.`,
    })
  }

  const selectTheme = (key: string, label: string) => {
    if (key === SUPPORTED_THEME) return
    setNotice({ title: `${label} theme`, body: 'This theme is not available in the reference demo.' })
  }

  return (
    <div className="prof-page">
      <header className="prof-header">
        <h1>{PROFILE_PAGE.heading}</h1>
        <p>{PROFILE_PAGE.supporting}</p>
      </header>

      <section className="prof-banner" aria-labelledby="prof-name">
        {portraitFailed ? (
          <span className="prof-portrait prof-portrait--fallback" aria-hidden="true">{PROFILE_INITIALS}</span>
        ) : (
          <img
            src={doctorPortrait}
            alt=""
            width={144}
            height={144}
            className="prof-portrait"
            onError={() => setPortraitFailed(true)}
          />
        )}
        <div className="prof-identity">
          <h2 id="prof-name">{PROFILE_FIXTURE.name}</h2>
          <p className="prof-role">{PROFILE_FIXTURE.role} · {PROFILE_FIXTURE.organization}</p>
          <p className="prof-status">
            <span aria-hidden="true" className="prof-status-dot" />
            {PROFILE_FIXTURE.status}
          </p>
        </div>
        <button type="button" className="prof-edit-button" ref={editOpenerRef} onClick={openEdit}>
          Edit Profile
        </button>
      </section>

      <div className="prof-columns">
        <nav className="prof-rail" aria-label="Account sections">
          <h2>Account</h2>
          <ul role="list">
            {PROFILE_SECTIONS.map((entry) => {
              const active = entry.key === section
              return (
                <li key={entry.key}>
                  <button
                    type="button"
                    className={`prof-section${active ? ' prof-section--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => selectSection(entry.key, entry.label)}
                  >
                    {SECTION_ICONS[entry.key]}
                    {entry.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="prof-content">
          <section className="prof-card" aria-labelledby="prof-personal">
            <h2 id="prof-personal">Personal Information</h2>
            <dl className="prof-fields">
              <div>
                <dt><label htmlFor="prof-full-name">Full Name</label></dt>
                <dd><input id="prof-full-name" type="text" value={draft.fullName} readOnly /></dd>
              </div>
              <div>
                <dt><label htmlFor="prof-email">Email Address</label></dt>
                <dd>
                  <input id="prof-email" type="email" value={PROFILE_FIXTURE.email} readOnly aria-describedby="prof-email-note" />
                  <span id="prof-email-note" className="sr-only">Email changes require a verification workflow, which is not part of this demo.</span>
                </dd>
              </div>
              <div>
                <dt><label htmlFor="prof-phone">Phone Number</label></dt>
                <dd><input id="prof-phone" type="tel" value={draft.phone} readOnly /></dd>
              </div>
              <div>
                <dt><label htmlFor="prof-specialization">Specialization</label></dt>
                <dd><input id="prof-specialization" type="text" value={draft.specialization} readOnly /></dd>
              </div>
            </dl>
          </section>

          <section className="prof-card" aria-labelledby="prof-appearance">
            <h2 id="prof-appearance">Appearance &amp; Preferences</h2>
            <div className="prof-pref-row">
              <span className="prof-pref-label" id="prof-theme-label">Application theme</span>
              <div className="prof-themes" role="group" aria-labelledby="prof-theme-label">
                {THEME_CHOICES.map((theme) => {
                  const active = theme.key === SUPPORTED_THEME
                  return (
                    <button
                      key={theme.key}
                      type="button"
                      className={`prof-theme${active ? ' prof-theme--active' : ''}`}
                      aria-pressed={active}
                      onClick={() => selectTheme(theme.key, theme.label)}
                    >
                      {theme.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="prof-pref-row">
              <label className="prof-pref-label" htmlFor="prof-notifications">Notifications</label>
              <span className="prof-toggle">
                <input
                  id="prof-notifications"
                  type="checkbox"
                  role="switch"
                  checked={draft.notifications}
                  onChange={(event) => toggleNotifications(event.target.checked)}
                />
              </span>
            </div>
            <p className="prof-local-note">
              Preferences in this demo are stored only in this browser. Nothing is sent to a server.
            </p>
          </section>
        </div>
      </div>

      <p className="prof-saved" role="status">
        {saved ? 'Profile changes are saved on this device for the reference demo.' : ''}
      </p>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />

      <dialog
        ref={editDialogRef}
        className="prof-dialog"
        aria-labelledby="prof-edit-title"
        onClose={onEditClosed}
        onClick={(event) => {
          if (event.target === editDialogRef.current) editDialogRef.current.close()
        }}
      >
        {editOpen && (
          <form className="prof-dialog-body" onSubmit={saveEdit} noValidate>
            <button type="button" className="prof-dialog-close" onClick={closeEdit}>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Close</span>
            </button>
            <h2 id="prof-edit-title">Edit Profile</h2>
            <p className="prof-dialog-sub">Changes are saved on this device for the reference demo only.</p>
            {EDITABLE_FIELDS.map((field) => (
              <div className="prof-edit-field" key={field.key}>
                <label htmlFor={`prof-edit-${field.key}`}>{field.label}</label>
                <input
                  id={`prof-edit-${field.key}`}
                  type="text"
                  value={editValues[field.key]}
                  aria-invalid={editErrors[field.key] ? true : undefined}
                  aria-describedby={editErrors[field.key] ? `prof-edit-${field.key}-error` : undefined}
                  onChange={(event) => setEditValues({ ...editValues, [field.key]: event.target.value })}
                />
                {editErrors[field.key] && (
                  <p className="prof-edit-error" id={`prof-edit-${field.key}-error`}>{editErrors[field.key]}</p>
                )}
              </div>
            ))}
            <div className="prof-dialog-actions">
              <button type="button" className="prof-dialog-secondary" onClick={closeEdit}>Cancel</button>
              <button type="submit" className="prof-dialog-primary">Save</button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  )
}
