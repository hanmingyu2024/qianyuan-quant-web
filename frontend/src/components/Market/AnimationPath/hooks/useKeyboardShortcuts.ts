import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onEscape: () => void
  onSave: () => void
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onDelete,
  onEscape,
  onSave,
}: ShortcutHandlers) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
      if (event.shiftKey) {
        onRedo()
      } else {
        onUndo()
      }
      event.preventDefault()
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      onDelete()
      event.preventDefault()
    }

    if (event.key === 'Escape') {
      onEscape()
      event.preventDefault()
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      onSave()
      event.preventDefault()
    }
  }, [onUndo, onRedo, onDelete, onEscape, onSave])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
} 