import { useEffect, useRef, useState } from 'react'
import summaryReference from '../../assets/dashboard/patients/ai-reference/patient-ai-summary.svg'
import evidenceReference from '../../assets/dashboard/patients/ai-reference/patient-sources-evidence.svg'
import qualityReference from '../../assets/dashboard/patients/ai-reference/patient-data-quality.svg'
import './patientAiReferenceDialog.css'

type SummarySection = 'summary' | 'evidence' | 'data-quality'

const references = {
  summary: { label: 'Summary', source: summaryReference },
  evidence: { label: 'Sources & Evidence', source: evidenceReference },
  'data-quality': { label: 'Data Quality', source: qualityReference },
} satisfies Record<SummarySection, { label: string; source: string }>

function parseSection(value: string | null): SummarySection {
  return value === 'evidence' || value === 'data-quality' ? value : 'summary'
}

export function PatientAiReferenceDialog({ section }: { section: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activeSection = parseSection(section)
  const [selected, setSelected] = useState<SummarySection>(activeSection)

  useEffect(() => setSelected(activeSection), [activeSection])

  const close = () => dialogRef.current?.close()

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="patient-ai-reference-trigger"
        aria-label="Open AI Summary design reference"
        onClick={() => {
          setSelected(activeSection)
          dialogRef.current?.showModal()
        }}
      >
        <span aria-hidden="true">AI</span>
      </button>

      <dialog
        ref={dialogRef}
        className="patient-ai-reference-dialog"
        aria-labelledby="patient-ai-reference-title"
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === dialogRef.current) close()
        }}
      >
        <div className="patient-ai-reference-shell">
          <header className="patient-ai-reference-header">
            <div>
              <h2 id="patient-ai-reference-title">Patient AI Summary reference</h2>
              <p>Original supplied interface</p>
            </div>
            <button type="button" className="patient-ai-reference-close" onClick={close}>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Close design reference</span>
            </button>
          </header>

          <div className="patient-ai-reference-tabs" role="group" aria-label="Reference screens">
            {(Object.keys(references) as SummarySection[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={selected === key}
                className={selected === key ? 'patient-ai-reference-tab patient-ai-reference-tab--active' : 'patient-ai-reference-tab'}
                onClick={() => setSelected(key)}
              >
                {references[key].label}
              </button>
            ))}
          </div>

          <div className="patient-ai-reference-canvas" tabIndex={0}>
            <img
              src={references[selected].source}
              alt={`${references[selected].label} supplied design reference`}
            />
          </div>
        </div>
      </dialog>
    </>
  )
}
