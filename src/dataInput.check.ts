import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NAV_ITEMS } from './dashboard/dashboardData.ts'
import { duplicateValues } from './dashboard/dashboardLogic.ts'
import {
  RESOURCE_REGISTRY,
  UNREGISTERED_FIXTURES,
  findResource,
  isMutable,
} from './dashboard/dataInput/dataInputRegistry.ts'
import {
  DATA_INPUT_PAGE_SIZE,
  fieldValue,
  operationLabel,
  queryRecords,
  recordIdentifier,
} from './dashboard/dataInput/dataInputLogic.ts'
import { getRecord, listRecords } from './dashboard/dataInput/dataInputRepository.ts'
import { isMenuPathAllowed, navKeyForPath } from './dashboard/menuLock.ts'

const here = dirname(fileURLToPath(import.meta.url))
const dataInputDir = join(here, 'dashboard', 'dataInput')
const DATA_INPUT_PATH = '/dashboard/data-input'

// Registry shape: every declared field key must exist and every lookup must be resolvable.
assert.ok(RESOURCE_REGISTRY.length >= 1, 'at least one resource is registered')
assert.equal(
  duplicateValues(RESOURCE_REGISTRY.map((resource) => resource.key)).length,
  0,
  'resource keys are unique',
)
assert.deepEqual(
  RESOURCE_REGISTRY.map((resource) => resource.key),
  [
    'patients',
    'appointments',
    'medical-records',
    'maternity-records',
    'pediatric-vaccinations',
    'medications',
    'lab-orders',
    'lab-results',
    'lab-specimens',
    'lab-qc-runs',
    'inbox-messages',
  ],
  'the registered resources stay explicit and in review order',
)

for (const resource of RESOURCE_REGISTRY) {
  const fieldKeys = resource.fields.map((field) => field.key)
  assert.equal(duplicateValues(fieldKeys).length, 0, `${resource.key} field keys are unique`)
  assert.ok(resource.fields.length > 0, `${resource.key} declares fields`)
  assert.ok(fieldKeys.includes(resource.identifierField), `${resource.key} identifier is a declared field`)
  assert.ok(fieldKeys.includes(resource.displayField), `${resource.key} display field is declared`)
  for (const key of [...resource.listFields, ...resource.searchFields]) {
    assert.ok(fieldKeys.includes(key), `${resource.key} lookup field ${key} is declared`)
  }
  for (const field of resource.sortFields) {
    assert.ok(fieldKeys.includes(field.key), `${resource.key} sort field ${field.key} is declared`)
    assert.ok(field.label.length > 0, `${resource.key} sort field ${field.key} has a label`)
  }
  assert.ok(resource.source.startsWith('src/'), `${resource.key} records its fixture source`)
  assert.ok(resource.readOnlyReason.length > 0, `${resource.key} states why it is read-only`)
  assert.equal(resource.operations.read.available, true, `${resource.key} is readable`)
  assert.equal(
    resource.operations.read.status,
    resource.serverBacked ? 'implemented' : 'local-demo-only',
    `${resource.key} read matches its data source`,
  )
}

// Only appointments have proven write routes. Every other resource stays read-only.
for (const resource of RESOURCE_REGISTRY) {
  assert.equal(
    isMutable(resource),
    resource.key === 'appointments',
    `${resource.key} mutability matches the implemented routes`,
  )
  if (resource.key === 'appointments') continue
  for (const operation of ['create', 'update', 'delete'] as const) {
    assert.equal(
      resource.operations[operation].available,
      false,
      `${resource.key} ${operation} is unavailable`,
    )
    assert.ok(
      ['blocked', 'out-of-scope'].includes(resource.operations[operation].status),
      `${resource.key} ${operation} carries a blocking status`,
    )
    assert.ok(
      resource.operations[operation].evidence.length > 0,
      `${resource.key} ${operation} states its evidence`,
    )
  }
}

const appointments = findResource('appointments')
assert.ok(appointments, 'appointments resource is registered')
for (const operation of ['read', 'create', 'update'] as const) {
  assert.equal(appointments.operations[operation].status, 'implemented', `appointment ${operation} is implemented`)
  assert.equal(appointments.operations[operation].available, true, `appointment ${operation} is available`)
}
assert.equal(appointments.operations.delete.available, false, 'appointment deletion is unavailable')
assert.equal(appointments.operations.delete.status, 'out-of-scope', 'cancellation is not labelled as delete')

const patients = findResource('patients')
assert.ok(patients, 'patients resource is registered')
assert.equal(patients.serverBacked, true, 'patients read from the feature API')
assert.equal(patients.operations.read.status, 'implemented', 'patient reads are implemented')
assert.equal(patients.operations.create.status, 'out-of-scope', 'patient creation stays out of scope')
assert.equal(patients.operations.update.status, 'out-of-scope', 'patient editing stays out of scope')
assert.equal(patients.operations.delete.status, 'out-of-scope', 'patient deletion stays out of scope')
assert.equal(patients.operations.delete.available, false, 'patient deletion is unavailable')

for (const resource of RESOURCE_REGISTRY) {
  assert.ok(resource.apiSpec, `${resource.key} cites a generated API specification`)
  assert.match(
    resource.apiSpec,
    /^workspaces\/result\/api-specifications\/\d{2}-[a-z-]+\/openapi\.yaml$/,
    `${resource.key} cites the generated specification path`,
  )
  assert.ok(
    existsSync(join(here, '..', '..', '..', resource.apiSpec)),
    `${resource.key} specification file exists`,
  )
}

for (const resource of RESOURCE_REGISTRY) {
  for (const relationship of resource.relationships) {
    const target = findResource(relationship.target)
    assert.ok(target, `${resource.key} relationship target ${relationship.target} is registered`)
    assert.ok(
      target.fields.some((field) => field.key === relationship.targetField),
      `${resource.key} relationship target field ${relationship.targetField} exists`,
    )
  }
}

for (const entry of UNREGISTERED_FIXTURES) {
  assert.ok(entry.reason.length > 0, `${entry.resource} states why it is not registered`)
  assert.ok(['blocked', 'out-of-scope'].includes(entry.decision), `${entry.resource} has a decision`)
}

// Identifiers: present, unique, and resolvable through the repository.
for (const resource of RESOURCE_REGISTRY) {
  const identifiers = listRecords(resource).map((record) => recordIdentifier(resource, record))
  assert.equal(identifiers.length, resource.records.length, `${resource.key} reads every supplied row`)
  assert.ok(identifiers.every((identifier) => identifier.length > 0), `${resource.key} rows carry an identifier`)
  assert.equal(duplicateValues(identifiers).length, 0, `${resource.key} identifiers are unique`)
  const first = resource.records[0]
  assert.ok(first, `${resource.key} supplies at least one row`)
  assert.equal(
    getRecord(resource, identifiers[0]!),
    first,
    `${resource.key} returns the canonical record by identifier`,
  )
  assert.equal(getRecord(resource, 'not-a-real-id'), null, `${resource.key} returns null for an unknown identifier`)
}

// Display formatting.
const records = findResource('medical-records')
assert.ok(records, 'medical records resource is registered')
const cbc = records.records.find((record) => record.id === 'record-2024-05-03-complete-blood-count-cbc')
assert.ok(cbc, 'the CBC fixture exists')
assert.equal(fieldValue(records, cbc, 'examination'), 'Not supplied', 'a missing optional field is stated')
const results = findResource('lab-results')
assert.ok(results, 'lab results resource is registered')
assert.equal(fieldValue(results, results.records[0]!, 'critical'), 'Yes', 'booleans render as Yes or No')
assert.equal(
  fieldValue(findResource('medications')!, findResource('medications')!.records[0]!, 'stock'),
  '320',
  'numbers render as display text',
)

// Search and sort are pure and deterministic.
const snapshot = JSON.stringify(RESOURCE_REGISTRY.map((resource) => resource.records))
for (const resource of RESOURCE_REGISTRY) {
  const all = queryRecords(resource, { search: '', sortKey: '', page: 1 })
  assert.equal(all.total, resource.records.length, `${resource.key} empty search keeps every row`)

  const firstId = recordIdentifier(resource, resource.records[0]!)
  const searched = queryRecords(resource, { search: firstId.trim(), sortKey: '', page: 1 })
  assert.ok(
    searched.records.some((record) => recordIdentifier(resource, record) === firstId),
    `${resource.key} searches its identifier`,
  )
  assert.deepEqual(
    searched.records.map((record) => recordIdentifier(resource, record)),
    queryRecords(resource, { search: firstId.trim(), sortKey: '', page: 1 }).records.map((record) =>
      recordIdentifier(resource, record),
    ),
    `${resource.key} search is deterministic`,
  )

  for (const field of resource.sortFields) {
    const once = queryRecords(resource, { search: '', sortKey: field.key, page: 1 }).records
    const twice = queryRecords(resource, { search: '', sortKey: field.key, page: 1 }).records
    assert.deepEqual(
      once.map((record) => recordIdentifier(resource, record)),
      twice.map((record) => recordIdentifier(resource, record)),
      `${resource.key} sort by ${field.key} is deterministic`,
    )
  }

  const maybe = queryRecords(resource, { search: 'zzzz-no-such-record', sortKey: '', page: 1 })
  assert.equal(maybe.total, 0, `${resource.key} reports an honest empty result`)
  assert.equal(maybe.start, 0, `${resource.key} reports no range for an empty result`)
}

assert.equal(
  JSON.stringify(RESOURCE_REGISTRY.map((resource) => resource.records)),
  snapshot,
  'queries never mutate the fixtures',
)

// Pagination: every row appears once, page counts are honest, and out-of-range pages clamp.
for (const resource of RESOURCE_REGISTRY) {
  const firstPage = queryRecords(resource, { search: '', sortKey: '', page: 1 })
  assert.equal(firstPage.page, 1, `${resource.key} starts on page 1`)
  assert.equal(
    firstPage.pageCount,
    Math.max(1, Math.ceil(resource.records.length / DATA_INPUT_PAGE_SIZE)),
    `${resource.key} page count matches the fixture size`,
  )
  let seen = 0
  for (let page = 1; page <= firstPage.pageCount; page += 1) {
    const result = queryRecords(resource, { search: '', sortKey: '', page })
    assert.ok(result.records.length <= DATA_INPUT_PAGE_SIZE, `${resource.key} page ${page} respects the page size`)
    seen += result.records.length
  }
  assert.equal(seen, resource.records.length, `${resource.key} pagination covers every row exactly once`)
  assert.equal(
    queryRecords(resource, { search: '', sortKey: '', page: 9999 }).page,
    firstPage.pageCount,
    `${resource.key} clamps an out-of-range page`,
  )
}

// Operation labels stay human-readable for every status.
assert.equal(operationLabel('implemented'), 'Implemented')
assert.equal(operationLabel('proposed'), 'Proposed only')
assert.equal(operationLabel('blocked'), 'Blocked')
assert.equal(operationLabel('out-of-scope'), 'Out of scope')
assert.equal(operationLabel('local-demo-only'), 'Local fixture read')

// Navigation: the route exists and menu-lock behaves like every other workspace.
const navItem = NAV_ITEMS.find((item) => item.key === 'data-input')
assert.equal(navItem?.route, DATA_INPUT_PATH, 'Data Input has a navigation route')
assert.equal(navKeyForPath(DATA_INPUT_PATH), 'data-input', 'the route resolves to its menu key')
assert.equal(
  navKeyForPath(`${DATA_INPUT_PATH}/medications/paracetamol-500`),
  'data-input',
  'record routes resolve to the Data Input menu key',
)
assert.equal(
  isMenuPathAllowed({ lock_enabled: false, allowed_keys: [], default_key: 'dashboard' }, DATA_INPUT_PATH),
  true,
  'the route opens while the menu lock is off',
)
assert.equal(
  isMenuPathAllowed(
    { lock_enabled: true, allowed_keys: ['data-input'], default_key: 'data-input' },
    DATA_INPUT_PATH,
  ),
  true,
  'the route opens when the lock allows its key',
)
assert.equal(
  isMenuPathAllowed(
    { lock_enabled: true, allowed_keys: ['patients'], default_key: 'patients' },
    DATA_INPUT_PATH,
  ),
  false,
  'the route stays locked when the server menu omits its key',
)

// No mutation or network call may hide in the workspace sources.
// Contract evidence quotes `/api/...` paths, so only executable call sites are rejected.
const sources = readdirSync(dataInputDir)
for (const file of sources) {
  const text = readFileSync(join(dataInputDir, file), 'utf8')
  assert.ok(!text.includes('fetch('), `${file} performs no fetch`)
  assert.ok(!text.includes('XMLHttpRequest'), `${file} opens no request`)
  assert.ok(!text.includes('localStorage'), `${file} stores nothing in the browser`)
}

console.log('dataInput.check.ts passed')
