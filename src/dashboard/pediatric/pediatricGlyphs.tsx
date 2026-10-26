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

/** Glyphs sampled from the approved pediatric reference. Chart art and portraits are embedded raster. */
export const PEDIATRIC_GLYPHS: Record<string, ReactNode> = {
  chevron: <svg {...stroke} width={16} height={16}><path d="M9.5 5.5 16 12l-6.5 6.5" /></svg>,
  star: <svg {...stroke}><path d="M12 3.8l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.9l5.8-.8z" /></svg>,
  document: <svg {...stroke}><path d="M7 3.6h7.4L19 8.1v12.3H7z" /><path d="M14.4 3.6v4.5H19" /></svg>,
  pencil: <svg {...stroke} width={16} height={16}><path d="M4.4 19.6h4l10-10a2.3 2.3 0 0 0-3.2-3.2l-10 10z" /><path d="M13.6 8l2.4 2.4" /></svg>,
  crown: <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true"><path d="M3.6 7.6l3.8 3 4.6-5.4 4.6 5.4 3.8-3-1.6 9.8H5.2z" /></svg>,
  checkTiny: <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5.4 12.6l4.2 4.2 9-9.4" /></svg>,
  male: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10.2" cy="13.8" r="5.4" /><path d="M14 10l5.4-5.4M14.6 4.6h4.8v4.8" /></svg>,
  arrowUp: <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.4 17.6 17.6 6.4M9.6 6.4h8v8" /></svg>,
}

/** Milestone and vaccination rows carry a written status, so this mark is decorative. */
export const PEDIATRIC_CHECK = (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
    <circle cx="12" cy="12" r="9.4" fill="currentColor" />
    <path d="M8.1 12.4l2.7 2.7 5.1-5.4" fill="none" stroke="#ffffff" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
