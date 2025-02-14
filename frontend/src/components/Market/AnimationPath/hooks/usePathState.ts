import { useState, useCallback } from 'react'
import { PathPoint } from '../types'

interface UsePathStateProps {
  onPathChange: (points: PathPoint[]) => void
  addToHistory: (points: PathPoint[]) => void
}

export const usePathState = ({ onPathChange, addToHistory }: UsePathStateProps) => {
  const [points, setPoints] = useState<PathPoint[]>([])
  const [isEditing, setIsEditing] = useState(false)

  const updatePoints = useCallback((newPoints: PathPoint[]) => {
    setPoints(newPoints)
    onPathChange(newPoints)
    addToHistory(newPoints)
  }, [onPathChange, addToHistory])

  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev)
  }, [])

  return {
    points,
    isEditing,
    updatePoints,
    toggleEditing,
  }
} 