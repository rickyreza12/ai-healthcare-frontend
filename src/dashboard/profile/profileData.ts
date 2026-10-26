export const PROFILE_PAGE = {
  heading: 'Profile & Settings',
  supporting: 'Manage account information, preferences, and security.',
} as const

/** Supplied demonstration profile. Never merged into the authenticated user object. */
export const PROFILE_FIXTURE = {
  name: 'Dr. Ahmad Rahman',
  role: 'General Practitioner',
  organization: 'BUNDA Healthcare',
  status: 'Active User',
  fullName: 'Dr. Ahmad Rahman',
  email: 'ahmad@bunda.co.id',
  phone: '+62 812 3456 7890',
  specialization: 'General Practitioner',
} as const

export const PROFILE_INITIALS = 'AR'

export type ProfileSectionKey = 'profile' | 'account' | 'care' | 'notifications' | 'security'

export const PROFILE_SECTIONS: readonly { readonly key: ProfileSectionKey; readonly label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account Settings' },
  { key: 'care', label: 'Care Preferences' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Privacy & Security' },
]

export type ThemeChoice = 'light' | 'dark' | 'system'

export const THEME_CHOICES: readonly { readonly key: ThemeChoice; readonly label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
]

/** Only Light ships; the app has no complete dark or system theme. */
export const SUPPORTED_THEME: ThemeChoice = 'light'

export type ProfileDraft = {
  readonly fullName: string
  readonly phone: string
  readonly specialization: string
  readonly notifications: boolean
}

export const DEFAULT_PROFILE_DRAFT: ProfileDraft = {
  fullName: PROFILE_FIXTURE.fullName,
  phone: PROFILE_FIXTURE.phone,
  specialization: PROFILE_FIXTURE.specialization,
  notifications: true,
}

/** Editable fields are required; blank normalized values are rejected. */
export function normalizeRequiredField(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export type EditableFieldKey = 'fullName' | 'phone' | 'specialization'

export const EDITABLE_FIELDS: readonly { readonly key: EditableFieldKey; readonly label: string }[] = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'specialization', label: 'Specialization' },
]
