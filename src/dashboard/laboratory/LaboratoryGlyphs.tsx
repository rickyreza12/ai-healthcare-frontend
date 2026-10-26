import { AVATARS } from '../dashboardAssets.ts'
import type { LabGlyphKey } from './laboratoryData.ts'

const AVATAR_BY_NAME: Record<string, string | undefined> = {
  'Siti Aisyah': AVATARS.sitiAisyah,
  'Muhammad Rizki': AVATARS.muhammadRizki,
  'Anita Dewi': AVATARS.anitaDewi,
  'Budi Santoso': AVATARS.budiSantoso,
  'Rina Melati': AVATARS.rinaMelati,
  'Dr. Ahmad Rahman': AVATARS.doctor,
}

export function LabAvatar({ name, size = 34 }: { name: string; size?: number }) {
  const src = AVATAR_BY_NAME[name]
  if (src) {
    return (
      <img
        className="lab-avatar"
        src={src}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    )
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  return (
    <span className="lab-avatar lab-avatar--initials" aria-hidden="true" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}>
      {initials}
    </span>
  )
}

export function LabGlyph({ name, size = 20 }: { name: LabGlyphKey; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'overview':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" />
        </svg>
      )
    case 'orders':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="17" rx="3" />
          <path d="M9 4V3h6v1M8 9h8M8 13h8M8 17h5" />
        </svg>
      )
    case 'results':
      return (
        <svg {...common}>
          <path d="M5 3h10l4 4v14H5z" />
          <path d="M15 3v5h5M8 17v-4M12 17V9M16 17v-6" />
        </svg>
      )
    case 'specimen':
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v13.5a4 4 0 1 0 4 0V3" />
          <path d="M10 14h4M8.5 17h7" />
        </svg>
      )
    case 'quality':
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.8 3.1 8 7.5 9.5 4.4-1.5 7.5-4.7 7.5-9.5V6z" />
          <path d="m8.5 12 2.3 2.3 4.7-4.7" />
        </svg>
      )
    case 'drop':
      return (
        <svg {...common}>
          <path d="M12 3.5S5.5 10.3 5.5 15a6.5 6.5 0 0 0 13 0C18.5 10.3 12 3.5 12 3.5Z" />
          <path d="M9 15.5a3 3 0 0 0 4.5 1.8" />
        </svg>
      )
    case 'flask':
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v6.2L5.4 18a2.4 2.4 0 0 0 2.1 3.5h9a2.4 2.4 0 0 0 2.1-3.5L14 9.2V3" />
          <path d="M7.2 15h9.6" />
        </svg>
      )
    case 'alert':
      return (
        <svg {...common}>
          <path d="M10.3 4.1 2.7 17.7A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.3L13.7 4.1a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v5M12 17.2v.1" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.2 2.6 2.6L16.5 9" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5.4l3.2 2" />
        </svg>
      )
    case 'report':
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M15 3v5h5M9 12h6M9 16h6" />
        </svg>
      )
    default:
      return null
  }
}

export function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}
