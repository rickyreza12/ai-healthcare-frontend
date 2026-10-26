import assert from 'node:assert/strict'
import { validate } from './validate.ts'

assert.deepEqual(Object.keys(validate('', '')).sort(), ['email', 'password'])
assert.ok(validate('not-an-email', 'x').email)
assert.ok(validate('a@b', 'x').email)
assert.deepEqual(validate('  nurse@clinic.example.org ', 'x'), {})
assert.deepEqual(validate('a@bunda.co.id', ' '), {}, 'password is never trimmed or length-checked')
console.log('validate checks passed')
