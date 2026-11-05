import bundaLogo from '../../../assets/dashboard/brand/bunda_cross_logo_transparent.png'
import './clinicalAiLoader.css'

export type LoaderStep = { label: string; status: 'done' | 'active' | 'pending' }

type Props = {
  label: string
  detail?: string
  steps?: LoaderStep[]
}

export function ClinicalAiLoader({ label, detail, steps }: Props) {
  return (
    <div className="clinical-loader" role="status" aria-live="polite" aria-busy="true">
      <img className="clinical-loader-logo" src={bundaLogo} alt="" width={64} height={64} />
      <p className="clinical-loader-label">{label}</p>
      {detail && <p className="clinical-loader-detail">{detail}</p>}
      <div className="clinical-loader-bar" aria-hidden="true"><span /></div>
      {steps && <ol className="clinical-loader-steps">
        {steps.map(step => <li key={step.label} className={`clinical-loader-step clinical-loader-step--${step.status}`}>
          <span className="clinical-loader-dot" aria-hidden="true" />{step.label}
          <span className="sr-only"> ({step.status})</span>
        </li>)}
      </ol>}
    </div>
  )
}
