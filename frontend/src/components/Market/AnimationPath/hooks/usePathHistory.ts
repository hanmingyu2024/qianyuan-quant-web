import { useState, useCallback } from 'react'
import { PathPoint } from '../types'

export const usePathHistory = () => {
  const [history, setHistory] = useState<PathPoint[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const addToHistory = useCallback((points: PathPoint[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(points)
      return newHistory
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      return history[historyIndex - 1]
    }
    return null
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      return history[historyIndex + 1]
    }
    return null
  }, [history, historyIndex])

  return {
    addToHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  }
} 