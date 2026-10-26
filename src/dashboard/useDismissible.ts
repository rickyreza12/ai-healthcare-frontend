import { useEffect, type RefObject } from 'react'

/** Closes on outside pointer press; Escape closes and returns focus to the trigger. */
export function useDismissible(
  open: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
  returnFocusRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      const container = containerRef.current
      if (container && !container.contains(event.target as Node)) onClose()
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return
      onClose()
      returnFocusRef.current?.focus()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, containerRef, returnFocusRef])
}
