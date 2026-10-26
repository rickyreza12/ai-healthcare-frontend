import type { ReactNode } from 'react'

export type GlyphKey =
  | 'sparkles' | 'hub' | 'person' | 'book' | 'document' | 'pill' | 'clipboard' | 'education'
  | 'kit' | 'chat' | 'shield' | 'clip' | 'info' | 'chevron' | 'arrow' | 'send'

/** Colored glyphs from the approved landing reference; the SVG export only embeds gray outlines. */
const GLYPHS: Record<GlyphKey, ReactNode> = {
  sparkles: (
    <g fill="#14a88f">
      <path d="M10 3l1.9 6.1L18 11l-6.1 1.9L10 19l-1.9-6.1L2 11l6.1-1.9z" />
      <path d="M19 1l.8 2.2L22 4l-2.2.8L19 7l-.8-2.2L16 4l2.2-.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </g>
  ),
  hub: (
    <g fill="#14a88f">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="4" r="2" /><circle cx="12" cy="20" r="2" /><circle cx="4" cy="12" r="2" /><circle cx="20" cy="12" r="2" />
      <path d="M11 6h2v3h-2zM11 15h2v3h-2zM6 11h3v2H6zM15 11h3v2h-3z" />
    </g>
  ),
  person: (
    <g fill="#2563d9">
      <circle cx="12" cy="7.5" r="4.5" />
      <path d="M3 21c0-5 4-8 9-8s9 3 9 8z" />
    </g>
  ),
  book: <path fill="#2563d9" d="M2 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM22 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z" />,
  document: (
    <g>
      <path fill="#3b7be8" d="M6 2h8l5 5v15H6z" />
      <path fill="#fff" d="M9 11h7v1.6H9zM9 14.5h7v1.6H9zM9 18h5v1.6H9z" />
    </g>
  ),
  pill: (
    <g transform="rotate(-45 12 12)">
      <rect x="3" y="8" width="18" height="8" rx="4" fill="#ef4f5f" />
      <rect x="12" y="8" width="9" height="8" rx="4" fill="#f7a1a9" />
      <rect x="12" y="8" width="2" height="8" fill="#f7a1a9" />
    </g>
  ),
  clipboard: (
    <g>
      <rect x="4" y="4" width="16" height="18" rx="2.5" fill="#12a37c" />
      <rect x="8" y="2" width="8" height="4" rx="1.5" fill="#0b7d5f" />
      <path fill="#fff" d="M8 10h8v1.6H8zM8 13.5h8v1.6H8zM8 17h5v1.6H8z" />
    </g>
  ),
  education: (
    <g>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#6d4fd8" />
      <path fill="#fff" d="M12 6l1.6 3.4 3.7.4-2.8 2.5.8 3.7L12 14.1 8.7 16l.8-3.7-2.8-2.5 3.7-.4z" />
    </g>
  ),
  kit: (
    <g>
      <rect x="2" y="6" width="20" height="16" rx="3" fill="#12a37c" />
      <path fill="#12a37c" d="M8 3h8v3h-2V5h-4v1H8z" />
      <path fill="#fff" d="M11 10h2v3h3v2h-3v3h-2v-3H8v-2h3z" />
    </g>
  ),
  chat: <path fill="none" stroke="#1d4f86" strokeWidth="1.8" strokeLinejoin="round" d="M12 4c5 0 9 3.1 9 7s-4 7-9 7c-1 0-2-.1-2.9-.4L4 20l1.4-3.9C4 14.8 3 13 3 11c0-3.9 4-7 9-7z" />,
  shield: (
    <g>
      <path fill="#12a37c" d="M12 2l9 3.5v6.2c0 5.3-3.8 9.3-9 10.3-5.2-1-9-5-9-10.3V5.5z" />
      <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-6" />
    </g>
  ),
  clip: <path fill="none" stroke="#1d4f86" strokeWidth="1.8" strokeLinecap="round" d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.5-8.5a3.3 3.3 0 014.7 4.7l-8.5 8.5a1.7 1.7 0 01-2.4-2.4l7.8-7.8" />,
  info: (
    <g>
      <circle cx="12" cy="12" r="10" fill="#2563d9" />
      <path fill="#fff" d="M11 10h2v8h-2zM11 6h2v2h-2z" />
    </g>
  ),
  chevron: <path fill="none" stroke="#1d4f86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />,
  arrow: <path fill="none" stroke="#3b7be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 12h15M13 6l6 6-6 6" />,
  send: <path fill="#fff" d="M3 11.5L21 3l-7.5 18-2.6-7.4z" />,
}

export function Glyph({ name, size = 22, className }: { name: GlyphKey; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {GLYPHS[name]}
    </svg>
  )
}
