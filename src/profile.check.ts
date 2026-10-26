import assert from 'node:assert/strict'
import {
  DEFAULT_PROFILE_DRAFT,
  EDITABLE_FIELDS,
  PROFILE_FIXTURE,
  PROFILE_SECTIONS,
  SUPPORTED_THEME,
  THEME_CHOICES,
  normalizeRequiredField,
} from './dashboard/profile/profileData.ts'
import {
  PROFILE_STORAGE_KEY,
  loadProfileDraft,
  parseProfileStorage,
  saveProfileDraft,
} from './dashboard/profile/profileStorage.ts'

// Default profile values match the supplied strings.
assert.equal(PROFILE_FIXTURE.name, 'Dr. Ahmad Rahman')
assert.equal(PROFILE_FIXTURE.role, 'General Practitioner')
assert.equal(PROFILE_FIXTURE.organization, 'BUNDA Healthcare')
assert.equal(PROFILE_FIXTURE.status, 'Active User')
assert.equal(PROFILE_FIXTURE.fullName, 'Dr. Ahmad Rahman')
assert.equal(PROFILE_FIXTURE.email, 'ahmad@bunda.co.id')
assert.equal(PROFILE_FIXTURE.phone, '+62 812 3456 7890')
assert.equal(PROFILE_FIXTURE.specialization, 'General Practitioner')

// Email stays read-only: it is never an editable field.
assert.ok(!EDITABLE_FIELDS.some((field) => String(field.key) === 'email'), 'email is not editable')
assert.deepEqual(EDITABLE_FIELDS.map((field) => field.key), ['fullName', 'phone', 'specialization'])

// Editable fields reject blank normalized values and trim real ones.
assert.equal(normalizeRequiredField(''), null)
assert.equal(normalizeRequiredField('   '), null)
assert.equal(normalizeRequiredField('  Dr. Nadia Putri  '), 'Dr. Nadia Putri')

// Section rail starts on Profile; only Profile is implemented.
assert.equal(PROFILE_SECTIONS[0].key, 'profile', 'Profile starts active')
assert.ok(PROFILE_SECTIONS.slice(1).every((section) => section.key !== 'profile'))

// Only Light ships; Dark and System stay unsupported choices.
assert.equal(SUPPORTED_THEME, 'light')
assert.deepEqual(THEME_CHOICES.map((theme) => theme.key), ['light', 'dark', 'system'])

// Storage parsing accepts valid versioned data.
const validDraft = { fullName: 'Dr. Test', phone: '+62 000', specialization: 'GP', notifications: false }
const validPayload = JSON.stringify({ version: 1, draft: validDraft })
assert.deepEqual(parseProfileStorage(validPayload), validDraft)

// Malformed and stale data are safely rejected.
assert.equal(parseProfileStorage(null), null)
assert.equal(parseProfileStorage('not json {'), null)
assert.equal(parseProfileStorage(JSON.stringify({ version: 2, draft: validDraft })), null, 'stale versions are rejected')
assert.equal(parseProfileStorage(JSON.stringify({ version: 1 })), null, 'missing draft is rejected')
assert.equal(
  parseProfileStorage(JSON.stringify({ version: 1, draft: { ...validDraft, notifications: 'yes' } })),
  null,
  'wrong field types are rejected',
)
assert.equal(parseProfileStorage(JSON.stringify('plain string')), null)

// Unavailable storage falls back without breaking.
const throwingStorage = {
  getItem(): string | null {
    throw new Error('denied')
  },
  setItem(): void {
    throw new Error('denied')
  },
}
assert.equal(loadProfileDraft(throwingStorage), null)
assert.equal(saveProfileDraft(throwingStorage, DEFAULT_PROFILE_DRAFT), false)

// Notification preference round-trips when storage is available.
const fakeStorage = new Map<string, string>()
const storageLike = {
  getItem: (key: string) => fakeStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    fakeStorage.set(key, value)
  },
}
assert.equal(saveProfileDraft(storageLike, validDraft), true)
assert.ok(fakeStorage.has(PROFILE_STORAGE_KEY), 'data is stored under the versioned key')
assert.deepEqual(loadProfileDraft(storageLike), validDraft)
const disabled = { ...validDraft, notifications: true }
saveProfileDraft(storageLike, disabled)
assert.equal(loadProfileDraft(storageLike)?.notifications, true, 'notification preference round-trips')

// Local demo values never mutate the supplied fixtures.
const fixtureSnapshot = JSON.stringify([PROFILE_FIXTURE, DEFAULT_PROFILE_DRAFT])
normalizeRequiredField('x')
parseProfileStorage(validPayload)
assert.equal(JSON.stringify([PROFILE_FIXTURE, DEFAULT_PROFILE_DRAFT]), fixtureSnapshot, 'fixtures are not mutated')

console.log('profile checks passed')
