import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AiSummary } from '../../features/clinicalAi/domain/patientSummary.ts'
import './patientDetailDialogs.css'

function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return ref
}

function Shell({ open, title, onClose, children, wide }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean
}) {
  const ref = useModal(open)
  const titleId = useId()
  return (
    <dialog ref={ref} className={`db-dialog pdx-dialog${wide ? ' pdx-dialog--wide' : ''}`} aria-labelledby={titleId}
      onClose={onClose} onClick={(event) => { if (event.target === ref.current) onClose() }}>
      <div className="db-dialog-body pdx-body">
        <button type="button" className="db-dialog-close" onClick={onClose}>
          <span aria-hidden="true">×</span><span className="sr-only">Close</span>
        </button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  )
}

export type Alert = AiSummary['alerts'][number]

const LEVEL_LABEL: Record<Alert['level'], string> = { high: 'High priority', medium: 'Needs review', info: 'For information' }
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function AlertDialog({ alert, summary, evidenceHref, onClose }: {
  alert: Alert | null; summary: AiSummary; evidenceHref: string; onClose: () => void
}) {
  const claim = alert ? summary.claims.find(item => item.title === alert.title) : undefined
  const issue = alert ? summary.dataQuality.issues.find(item => item.issue === alert.title) : undefined
  const records = claim ? summary.sources.filter(source => claim.sourceIds.includes(source.sourceId)) : []
  return (
    <Shell open={alert !== null} title={alert?.title ?? 'Clinical alert'} onClose={onClose} wide>
      {alert && <>
        <span className={`pdx-level pdx-level--${alert.level}`}>{LEVEL_LABEL[alert.level]}</span>
        <p className="pdx-lead">{alert.description}</p>
        {claim && <>
          <h3 className="pdx-h3">Supporting records ({records.length})</h3>
          {records.length === 0 && <p className="db-dialog-sub">No stored record supports this statement.</p>}
          <ul className="pdx-records">{records.map(record => (
            <li key={record.sourceId}>
              <span className="pdx-marker">{record.marker}</span>
              <div>
                <strong>{record.title}</strong>
                <span className="pdx-muted">{day(record.recordedAt)} · {record.kind}</span>
                <dl>{record.fields.slice(0, 3).map(field => (
                  <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>
                ))}</dl>
              </div>
            </li>
          ))}</ul>
        </>}
        {issue && <dl className="pdx-facts">
          <div><dt>Issue type</dt><dd>{issue.type.replace(/_/g, ' ')}</dd></div>
          <div><dt>Impact</dt><dd>{issue.impact}</dd></div>
        </dl>}
        <div className="db-dialog-actions">
          <Link to={evidenceHref} className="db-dialog-primary pdx-link" onClick={onClose}>
            {issue ? 'Open data quality' : 'Open sources & evidence'}
          </Link>
          <button type="button" className="db-dialog-secondary" onClick={onClose}>Close</button>
        </div>
      </>}
    </Shell>
  )
}

export type ExportFormat = 'pdf' | 'docx' | 'json'

const FORMAT_ICON_PATHS: Record<ExportFormat, ReactNode> = {
  pdf: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 15h6M9 18h4" /></>,
  docx: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 12h6M9 15h6M9 18h4" /></>,
  json: <><path d="M9 4C7 4 7 5.5 7 7v2c0 1.2-.8 2-2 3 1.2 1 2 1.8 2 3v2c0 1.5 0 3 2 3" /><path d="M15 4c2 0 2 1.5 2 3v2c0 1.2.8 2 2 3-1.2 1-2 1.8-2 3v2c0 1.5 0 3-2 3" /></>,
}

const FORMATS: { key: ExportFormat; title: string; copy: string }[] = [
  { key: 'pdf', title: 'PDF report', copy: 'Designed, print-ready report. Opens the print dialog; choose "Save as PDF".' },
  { key: 'docx', title: 'Word document', copy: 'Editable report that opens in Microsoft Word and Google Docs.' },
  { key: 'json', title: 'JSON data', copy: 'The raw saved summary with claims, sources and data quality.' },
]

function FormatIcon({ format }: { format: ExportFormat }) {
  return (
    <svg className="pdx-format-badge" width="52" height="52" viewBox="-14 -14 52 52" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {FORMAT_ICON_PATHS[format]}
    </svg>
  )
}

export function ExportDialog({ open, onExport, onClose }: {
  open: boolean; onExport: (format: ExportFormat) => void; onClose: () => void
}) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  return (
    <Shell open={open} title="Export summary" onClose={onClose}>
      <p className="db-dialog-sub">Choose how to export this patient's AI summary.</p>
      <div className="pdx-formats" role="radiogroup" aria-label="Export format">
        {FORMATS.map(option => (
          <button key={option.key} type="button" role="radio" aria-checked={format === option.key}
            className={`pdx-format${format === option.key ? ' pdx-format--active' : ''}`} onClick={() => setFormat(option.key)}>
            <FormatIcon format={option.key} />
            <span><strong>{option.title}</strong><span className="pdx-muted">{option.copy}</span></span>
          </button>
        ))}
      </div>
      <div className="db-dialog-actions">
        <button type="button" className="db-dialog-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="db-dialog-primary" onClick={() => { onExport(format); onClose() }}>Export</button>
      </div>
    </Shell>
  )
}
