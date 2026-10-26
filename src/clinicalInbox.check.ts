import assert from 'node:assert/strict'
import {
  INBOX_DEFAULT_SELECTED_ID,
  INBOX_FILTERS,
  INBOX_GLOBAL_COUNTS,
  INBOX_ITEMS,
  INBOX_SORT_OPTIONS,
  SITI_DETAIL,
} from './dashboard/notifications/clinicalInboxData.ts'
import {
  DEFAULT_INBOX_FILTERS,
  filterInbox,
  findInboxItem,
  hasExtendedDetail,
  selectedInboxItem,
  sortInbox,
} from './dashboard/notifications/clinicalInboxLogic.ts'

// Fixture identity: eight visible rows, stable and unique ids.
assert.equal(INBOX_ITEMS.length, 8, 'eight inbox rows are supplied')
assert.deepEqual(
  INBOX_ITEMS.map((item) => item.id),
  [
    'siti-aisyah-bp-alert',
    'rizki-new-message',
    'followup-reminder-tomorrow',
    'budi-glucose-alert',
    'anita-refill-request',
    'lab-cbc-available',
    'appointment-rescheduled',
    'ahmad-dtp-due',
  ],
  'fixture ids are stable',
)
assert.equal(new Set(INBOX_ITEMS.map((item) => item.id)).size, 8, 'fixture ids are unique')

// Global supplied counts stay separate from visible-row counts.
assert.deepEqual(INBOX_GLOBAL_COUNTS, { all: 12, urgent: 3, messages: 5, followUps: 4 })
assert.notEqual(INBOX_GLOBAL_COUNTS.all, INBOX_ITEMS.length)
assert.equal(filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'urgent' }).length, 2, 'three urgent rows exist globally, two are visible')
assert.equal(filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'messages' }).length, 3)
assert.equal(filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'followUps' }).length, 2)

// Default order matches the supplied reference (Siti first).
assert.deepEqual(filterInbox(DEFAULT_INBOX_FILTERS).map((item) => item.order), [1, 2, 3, 4, 5, 6, 7, 8])

// Filter kinds return the correct visible rows.
assert.deepEqual(
  filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'urgent' }).map((item) => item.id),
  ['siti-aisyah-bp-alert', 'budi-glucose-alert'],
)
assert.deepEqual(
  filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'messages' }).map((item) => item.id),
  ['rizki-new-message', 'anita-refill-request', 'appointment-rescheduled'],
)
assert.deepEqual(
  filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'followUps' }).map((item) => item.id),
  ['followup-reminder-tomorrow', 'ahmad-dtp-due'],
)
assert.ok(
  filterInbox({ ...DEFAULT_INBOX_FILTERS, filter: 'urgent' }).every((item) => item.kind === 'Urgent'),
  'the urgent filter never returns other kinds',
)

// Sorting is deterministic and uses explicit order values, not date parsing.
assert.deepEqual(sortInbox(INBOX_ITEMS, 'newest').map((item) => item.order), [1, 2, 3, 4, 5, 6, 7, 8])
assert.deepEqual(sortInbox(INBOX_ITEMS, 'oldest').map((item) => item.order), [8, 7, 6, 5, 4, 3, 2, 1])
assert.deepEqual(filterInbox({ ...DEFAULT_INBOX_FILTERS, sort: 'oldest' })[0]?.id, 'ahmad-dtp-due')

// Siti Aisyah starts selected; unknown ids fall back to her alert.
assert.equal(INBOX_DEFAULT_SELECTED_ID, 'siti-aisyah-bp-alert')
assert.equal(selectedInboxItem(null).id, INBOX_DEFAULT_SELECTED_ID)
assert.equal(selectedInboxItem('no-such-item').id, INBOX_DEFAULT_SELECTED_ID)
assert.equal(selectedInboxItem('budi-glucose-alert').id, 'budi-glucose-alert')

// Other rows cannot inherit Siti's vitals or message body.
assert.ok(hasExtendedDetail(selectedInboxItem(null)))
for (const item of INBOX_ITEMS) {
  if (item.id === INBOX_DEFAULT_SELECTED_ID) continue
  assert.equal(hasExtendedDetail(item), false, `${item.id} has no supplied vitals or message`)
}

// The four vital values, statuses, and ranges remain supplied strings.
assert.deepEqual(
  SITI_DETAIL.vitals.map((vital) => vital.value),
  ['162/98', '88', '36.8', '98'],
)
assert.deepEqual(
  SITI_DETAIL.vitals.map((vital) => vital.status),
  ['High', 'Normal', 'Normal', 'Normal'],
)
assert.deepEqual(
  SITI_DETAIL.vitals.map((vital) => vital.range),
  ['Normal: < 140/90', '60 – 100', '36.1 – 37.2', '≥ 95'],
)

// Reference labels are display-only and never route identifiers.
const REFERENCE_LABEL = /^(Patient ID: B\d{7}|\d+ patients?|Laboratory)$/
assert.ok(INBOX_ITEMS.every((item) => REFERENCE_LABEL.test(item.referenceLabel)), 'reference labels stay display-only')
assert.ok(INBOX_ITEMS.every((item) => !('route' in item) && !('path' in item)), 'inbox items carry no route or path fields')

// Filter and sort option lists match the supplied labels and counts.
assert.deepEqual(INBOX_FILTERS.map((filter) => filter.label), [
  'All (12)',
  'Urgent Alerts (3)',
  'Patient Messages (5)',
  'Follow-ups (4)',
])
assert.deepEqual(INBOX_SORT_OPTIONS.map((option) => option.label), ['Newest First', 'Oldest First'])
assert.equal(findInboxItem('lab-cbc-available')?.kind, 'Info')

// Helpers do not mutate fixtures.
const snapshot = JSON.stringify(INBOX_ITEMS)
filterInbox({ filter: 'urgent', sort: 'oldest' })
sortInbox(INBOX_ITEMS, 'oldest')
assert.equal(JSON.stringify(INBOX_ITEMS), snapshot, 'fixtures are not mutated')

console.log('clinicalInbox checks passed')
