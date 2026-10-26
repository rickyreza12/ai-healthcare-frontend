import { useEffect, useId, useRef } from 'react'

export type Notice = {
  readonly title: string
  readonly body?: string
}

/**
 * Shared honest-unavailable dialog. The reference draws actions whose workflow and backing
 * data are not part of this demo, so they explain the limitation instead of silently failing.
 */
export function NoticeDialog({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (notice && !dialog.open) dialog.showModal()
    if (!notice && dialog.open) dialog.close()
  }, [notice])

  return (
    <dialog
      ref={dialogRef}
      className="db-dialog db-dialog--notice"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {notice && (
        <div className="db-dialog-body">
          <button type="button" className="db-dialog-close" onClick={onClose}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close</span>
          </button>
          <h2 id={titleId}>{notice.title}</h2>
          {notice.body && <p className="db-dialog-sub">{notice.body}</p>}
          <div className="db-dialog-actions">
            <button type="button" className="db-dialog-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </dialog>
  )
}
