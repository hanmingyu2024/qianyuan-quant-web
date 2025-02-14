import { useCallback } from 'react'
import { PathPoint } from '../types'

interface UseUndoRedoProps {
  points: PathPoint[]
  updatePoints: (points: PathPoint[]) => void
  undo: () => PathPoint[] | null
  redo: () => PathPoint[] | null
  canUndo: boolean
  canRedo: boolean
}

export const useUndoRedo = ({
  points,
  updatePoints,
  undo,
  redo,
  canUndo,
  canRedo,
}: UseUndoRedoProps) => {
  const handleUndo = useCallback(() => {
    if (canUndo) {
      const prevPoints = undo()
      if (prevPoints) {
        updatePoints(prevPoints)
      }
    }
  }, [canUndo, undo, updatePoints])

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const nextPoints = redo()
      if (nextPoints) {
        updatePoints(nextPoints)
      }
    }
  }, [canRedo, redo, updatePoints])

  return {
    handleUndo,
    handleRedo,
  }
} 