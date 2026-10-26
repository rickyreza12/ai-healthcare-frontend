import {
  INBOX_DEFAULT_SELECTED_ID,
  INBOX_ITEMS,
  SITI_DETAIL,
  type InboxFilterKey,
  type InboxItem,
  type InboxSort,
} from './clinicalInboxData.ts'

export const ALL_INBOX_FILTERS = 'all'

export type InboxFilters = {
  readonly filter: InboxFilterKey
  readonly sort: InboxSort
}

export const DEFAULT_INBOX_FILTERS: InboxFilters = {
  filter: ALL_INBOX_FILTERS,
  sort: 'newest',
}

const KIND_BY_FILTER: Record<Exclude<InboxFilterKey, 'all'>, InboxItem['kind']> = {
  urgent: 'Urgent',
  messages: 'Message',
  followUps: 'Follow-up',
}

/** Filters apply to the eight supplied rows; global counts stay display-only. */
export function filterInbox(
  filters: InboxFilters,
  items: readonly InboxItem[] = INBOX_ITEMS,
): InboxItem[] {
  const kind = filters.filter === 'all' ? null : KIND_BY_FILTER[filters.filter]
  const visible = kind === null ? [...items] : items.filter((item) => item.kind === kind)
  return sortInbox(visible, filters.sort)
}

/** Deterministic ordering by the explicit fixture order value, never by date parsing. */
export function sortInbox(items: readonly InboxItem[], sort: InboxSort): InboxItem[] {
  const ordered = [...items]
  ordered.sort((a, b) => (sort === 'newest' ? a.order - b.order : b.order - a.order))
  return ordered
}

export function isDefaultInboxFilters(filters: InboxFilters): boolean {
  return filters.filter === DEFAULT_INBOX_FILTERS.filter && filters.sort === DEFAULT_INBOX_FILTERS.sort
}

export function findInboxItem(id: string, items: readonly InboxItem[] = INBOX_ITEMS): InboxItem | undefined {
  return items.find((item) => item.id === id)
}

export function selectedInboxItem(
  selectedId: string | null,
  items: readonly InboxItem[] = INBOX_ITEMS,
): InboxItem {
  return findInboxItem(selectedId ?? INBOX_DEFAULT_SELECTED_ID, items) ?? items[0]
}

/** Extended detail was supplied only for Siti Aisyah's alert; other rows never inherit it. */
export function hasExtendedDetail(item: InboxItem): boolean {
  return item.id === INBOX_DEFAULT_SELECTED_ID && item.sourceName === SITI_DETAIL.name
}
