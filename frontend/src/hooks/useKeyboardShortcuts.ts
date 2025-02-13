import { useEffect } from 'react'

interface ShortcutHandlers {
  onDelete: () => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onPaste: () => void
  onEscape: () => void
}

export const useKeyboardShortcuts = ({
  onDelete,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onEscape,
}: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDelete()
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              onRedo()
            } else {
              onUndo()
            }
            e.preventDefault()
            break
          case 'c':
            onCopy()
            e.preventDefault()
            break
          case 'v':
            onPaste()
            e.preventDefault()
            break
        }
      }

      if (e.key === 'Escape') {
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onDelete, onUndo, onRedo, onCopy, onPaste, onEscape])
} 