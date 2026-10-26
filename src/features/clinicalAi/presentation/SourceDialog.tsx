import { useEffect, useId, useRef } from 'react'

export type CitationDetail = {
  title: string
  subtitle: string
  description: string
  fields?: { label: string; value: string }[]
}

export function SourceDialog({ source, onClose }: { source: CitationDetail | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)
  const heading = useId()

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (source && !element.open) {
      restoreFocus.current = document.activeElement as HTMLElement | null
      element.showModal()
    }
    if (!source && element.open) element.close()
  }, [source])

  const close = () => {
    onClose()
    restoreFocus.current?.focus()
  }

  return (
    <dialog ref={ref} className="clinical-source-dialog" aria-labelledby={heading} onClose={close}
      onClick={event => { if (event.target === ref.current) close() }}>
      {source && <div className="clinical-source-content">
        <div className="clinical-source-heading">
          <h2 id={heading}>{source.title}</h2>
          <button type="button" aria-label="Close source details" onClick={close}>Close</button>
        </div>
        <p className="clinical-muted">{source.subtitle}</p>
        <p>{source.description}</p>
        {source.fields?.length ? <dl className="clinical-facts">{source.fields.map((field, index) =>
          <div key={`${field.label}-${index}`}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl> : null}
      </div>}
    </dialog>
  )
}
