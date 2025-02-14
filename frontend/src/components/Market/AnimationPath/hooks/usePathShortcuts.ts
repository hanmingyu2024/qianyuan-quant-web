import { useEffect, useCallback } from 'react'
import { message } from 'antd'
import { SHORTCUTS } from '../config'

interface ShortcutConfig {
  enabled: boolean
  showHints: boolean
}

interface ShortcutHandlers {
  onAddPoint?: () => void
  onDeletePoint?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onPreview?: () => void
  onToggleGrid?: () => void
  onToggleSnap?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetView?: () => void
  onSelectAll?: () => void
}

export function usePathShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onSave,
  onPreview,
  onToggleGrid,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSelectAll,
}: ShortcutHandlers = {}) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略输入框中的快捷键
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event
    const cmd = ctrlKey || metaKey

    // 撤销/重做
    if (cmd && !altKey && key.toLowerCase() === 'z') {
      if (shiftKey) {
        event.preventDefault()
        onRedo?.()
      } else {
        event.preventDefault()
        onUndo?.()
      }
    }

    // 复制/粘贴
    if (cmd && !altKey && !shiftKey) {
      if (key.toLowerCase() === 'c') {
        event.preventDefault()
        onCopy?.()
      } else if (key.toLowerCase() === 'v') {
        event.preventDefault()
        onPaste?.()
      }
    }

    // 删除
    if (key === 'Delete' || key === 'Backspace') {
      if (!cmd && !altKey && !shiftKey) {
        event.preventDefault()
        onDelete?.()
      }
    }

    // 保存
    if (cmd && !altKey && !shiftKey && key.toLowerCase() === 's') {
      event.preventDefault()
      onSave?.()
    }

    // 预览
    if (key === ' ' && !cmd && !altKey && !shiftKey) {
      event.preventDefault()
      onPreview?.()
    }

    // 网格和对齐
    if (!cmd && !altKey && !shiftKey) {
      if (key.toLowerCase() === 'g') {
        event.preventDefault()
        onToggleGrid?.()
      } else if (key.toLowerCase() === 's') {
        event.preventDefault()
        onToggleSnap?.()
      }
    }

    // 缩放控制
    if (cmd && !altKey) {
      if (key === '=' || key === '+') {
        event.preventDefault()
        onZoomIn?.()
      } else if (key === '-' || key === '_') {
        event.preventDefault()
        onZoomOut?.()
      } else if (key === '0') {
        event.preventDefault()
        onResetView?.()
      }
    }

    // 全选
    if (cmd && !altKey && !shiftKey && key.toLowerCase() === 'a') {
      event.preventDefault()
      onSelectAll?.()
    }
  }, [
    onUndo,
    onRedo,
    onDelete,
    onCopy,
    onPaste,
    onSave,
    onPreview,
    onToggleGrid,
    onToggleSnap,
    onZoomIn,
    onZoomOut,
    onResetView,
    onSelectAll,
  ])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts: SHORTCUTS,
  }
} 