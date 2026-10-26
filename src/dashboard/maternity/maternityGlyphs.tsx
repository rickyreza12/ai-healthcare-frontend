import type { ReactNode } from 'react'

const stroke = {
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** Glyphs sampled from the approved maternity reference. Section artwork is embedded raster; these are drawn. */
export const MATERNITY_GLYPHS: Record<string, ReactNode> = {
  chevron: <svg {...stroke} width={16} height={16}><path d="M9.5 5.5 16 12l-6.5 6.5" /></svg>,
  chevronDown: <svg {...stroke} width={16} height={16}><path d="M6.2 9.6 12 15.4l5.8-5.8" /></svg>,
  phone: <svg {...stroke} width={17} height={17}><path d="M6.6 3.6h2.6l1.4 3.6-1.9 1.2a10.6 10.6 0 0 0 4.9 4.9l1.2-1.9 3.6 1.4v2.6a2 2 0 0 1-2.2 2A14.9 14.9 0 0 1 4.6 5.8a2 2 0 0 1 2-2.2z" /></svg>,
  chat: <svg {...stroke} width={17} height={17}><path d="M4.6 4.8h14.8v10.4H9.9L5.6 19v-3.8H4.6z" /><path d="M9.4 10h5.2" /></svg>,
  heartPulse: <svg {...stroke} width={17} height={17}><path d="M12 20.2s-7.1-4.6-7.1-9.5A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.1 3.3c0 4.9-7.1 9.5-7.1 9.5z" /><path d="M6.9 12.4h2.9l1.2-2.1 1.6 3.3 1.2-1.2h2" /></svg>,
  clock: <svg {...stroke} width={17} height={17}><circle cx="12" cy="12" r="8.4" /><path d="M12 7.4V12l3.2 1.9" /></svg>,
  pin: <svg {...stroke} width={17} height={17}><path d="M12 20.6s6-5.7 6-10a6 6 0 0 0-12 0c0 4.3 6 10 6 10z" /><circle cx="12" cy="10.2" r="2.2" /></svg>,
  document: <svg {...stroke} width={17} height={17}><path d="M7 3.6h7.4L19 8.1v12.3H7z" /><path d="M14.4 3.6v4.5H19" /></svg>,
  ruler: <svg {...stroke} width={19} height={19}><g transform="rotate(-45 12 12)"><rect x="3.6" y="8.4" width="16.8" height="7.2" rx="1.6" /><path d="M7.6 8.4v2.8M11 8.4v2.8M14.4 8.4v2.8M17.8 8.4v2.8" /></g></svg>,
  weight: <svg {...stroke} width={19} height={19}><path d="M5.4 8.6h13.2l-1.5 11.2H6.9z" /><path d="M9.2 8.6V7a2.8 2.8 0 0 1 5.6 0v1.6" /></svg>,
}

/** Filled pink fetus silhouette beside the supplied gestational age. */
export const FETUS_GLYPH = (
  <svg viewBox="0 0 24 24" width={26} height={26} fill="currentColor" aria-hidden="true">
    <circle cx="15.2" cy="8.2" r="3.8" />
    <path d="M11.8 12.4c-2.9.6-5 2.9-5 5.5 0 2 1.4 3.2 3.4 3.2h3.4a1.3 1.3 0 0 0 0-2.6h-3c-.6 0-1-.4-1-1 0-1.6 1.2-2.9 2.8-3.3a1.3 1.3 0 0 0-.6-2.5z" />
    <path d="M9.4 15.2 7.2 18a1.3 1.3 0 0 0 2.2 1.4l1.8-2.4z" />
  </svg>
)

/** Solid metric glyphs sit on the tinted circles of the maternal health tiles. */
export const MATERNAL_ICONS: Record<'heart' | 'thermometer', ReactNode> = {
  heart: (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M12 20.6s-7.4-4.8-7.4-10A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 7.4 3.4c0 5.2-7.4 10-7.4 10z" />
    </svg>
  ),
  thermometer: (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M14.2 14.3V5.8a2.2 2.2 0 0 0-4.4 0v8.5a4.2 4.2 0 1 0 4.4 0z" />
      <path d="M12 17.4v-3" />
    </svg>
  ),
}

export type ChecklistIconState = 'Completed' | 'Due Soon' | 'Pending'

/** Status icons carry a written status beside them, so the glyph is decorative. */
export const CHECKLIST_ICONS: Record<ChecklistIconState, ReactNode> = {
  Completed: (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="currentColor" />
      <path d="M8.1 12.4l2.7 2.7 5.1-5.4" fill="none" stroke="#ffffff" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Due Soon': (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <circle cx="12" cy="12" r="9.4" fill="currentColor" />
      <path d="M12 7.2V12l3.3 2" fill="none" stroke="#ffffff" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Pending: (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" strokeWidth={1.8} />
    </svg>
  ),
}
