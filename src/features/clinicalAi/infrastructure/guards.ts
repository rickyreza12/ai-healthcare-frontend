export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Unexpected backend response.')
  return value as Record<string, unknown>
}

export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Unexpected backend collection.')
  return value
}

export function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Unexpected backend string.')
  return value
}

export function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Unexpected backend number.')
  return value
}

export function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Unexpected backend boolean.')
  return value
}

export function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return string(value)
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T {
  const text = string(value)
  if (!allowed.includes(text as T)) throw new Error(`Unexpected backend value: ${text}`)
  return text as T
}
