export type FieldErrors = { email?: string; password?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const trimmed = email.trim()
  if (!trimmed) errors.email = 'Enter your email address.'
  else if (!EMAIL.test(trimmed)) errors.email = 'Enter a valid email address, like name@example.com.'
  if (!password) errors.password = 'Enter your password.'
  return errors
}
