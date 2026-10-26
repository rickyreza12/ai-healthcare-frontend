import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Read-only reference dialog. Detail views in the delivery fixtures describe supplied content,
 * so they share one dialog shell and never imply editing or saved state.
 */
export function ReadOnlyDialog({ open, title, onClose, children }: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="db-dialog db-dialog--readonly"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="db-dialog-body">
        <button type="button" className="db-dialog-close" onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close</span>
        </button>
        <h2 id={titleId} className="db-readonly-title">{title}</h2>
        {children}
        <div className="db-dialog-actions">
          <button type="button" className="db-dialog-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  )
}
