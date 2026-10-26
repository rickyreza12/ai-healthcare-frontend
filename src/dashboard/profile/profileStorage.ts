import type { ProfileDraft } from './profileData.ts'

export const PROFILE_STORAGE_KEY = 'bunda.profile.demo.v1'

const PROFILE_STORAGE_VERSION = 1

type ProfileStorageShape = {
  readonly version: number
  readonly draft: ProfileDraft
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

/**
 * Parses versioned demo data. Malformed JSON, stale versions, and wrong shapes
 * all return null so the page falls back to the supplied fixture.
 */
export function parseProfileStorage(raw: string | null): ProfileDraft | null {
  if (raw === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const candidate = parsed as Partial<ProfileStorageShape>
  if (candidate.version !== PROFILE_STORAGE_VERSION) return null
  const draft = candidate.draft
  if (typeof draft !== 'object' || draft === null) return null
  const { fullName, phone, specialization, notifications } = draft as Partial<ProfileDraft>
  if (
    typeof fullName !== 'string' ||
    typeof phone !== 'string' ||
    typeof specialization !== 'string' ||
    typeof notifications !== 'boolean'
  ) {
    return null
  }
  return { fullName, phone, specialization, notifications }
}

export function loadProfileDraft(storage: StorageLike): ProfileDraft | null {
  try {
    return parseProfileStorage(storage.getItem(PROFILE_STORAGE_KEY))
  } catch {
    return null
  }
}

export function saveProfileDraft(storage: StorageLike, draft: ProfileDraft): boolean {
  try {
    const payload: ProfileStorageShape = { version: PROFILE_STORAGE_VERSION, draft }
    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}
