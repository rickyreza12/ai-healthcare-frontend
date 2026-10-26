import type { ReactElement, ReactNode } from 'react'
import type { MedicationTabKey } from './pharmacyData.ts'

type IconProps = { readonly className?: string }

function StrokeIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

function IconCapsule(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.8" y="9" width="18.4" height="9" rx="4.5" transform="rotate(-45 12 12)" />
      <path d="m9.5 14.5 5-5" />
    </StrokeIcon>
  )
}

function IconPrescription(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9.5 13h5M9.5 17h5" />
    </StrokeIcon>
  )
}

function IconCounter(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 4h2l2.4 12h11l2.2-8H6.7" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </StrokeIcon>
  )
}

function IconLeaf(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 20C5 11 11 5 20 4c-.5 9-5.5 15-14 16z" />
      <path d="M5 20c3-5 7-9 12-11" />
    </StrokeIcon>
  )
}

function IconSupplyBox(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2" />
      <path d="M12 11.5v6M9 14.5h6" />
    </StrokeIcon>
  )
}

const TAB_ICONS: Record<MedicationTabKey, (props: IconProps) => ReactElement> = {
  all: IconCapsule,
  prescription: IconPrescription,
  otc: IconCounter,
  supplements: IconLeaf,
  supplies: IconSupplyBox,
}

export function MedicationTabIcon({ tab }: { tab: MedicationTabKey }) {
  const Icon = TAB_ICONS[tab]
  return <Icon className="ph-tab-icon" />
}
