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
