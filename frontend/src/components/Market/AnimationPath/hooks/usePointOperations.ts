import { useCallback } from 'react'
import { PathPoint } from '../types'

interface UsePointOperationsProps {
  points: PathPoint[]
  setPoints: (points: PathPoint[]) => void
  onPathChange: (points: PathPoint[]) => void
  addToHistory: (points: PathPoint[]) => void
  selectedDrawing: {
    points: [number, number][]
  }
}

export const usePointOperations = ({
  points,
  setPoints,
  onPathChange,
  addToHistory,
  selectedDrawing,
}: UsePointOperationsProps) => {
  const handleAddPoint = useCallback(() => {
    const newPoint: PathPoint = {
      id: Date.now().toString(),
      x: selectedDrawing.points[0][0] + 100,
      y: selectedDrawing.points[0][1] + 100,
      time: 1,
      easing: 'linear',
    }
    const newPoints = [...points, newPoint]
    setPoints(newPoints)
    onPathChange(newPoints)
    addToHistory(newPoints)
  }, [points, selectedDrawing.points, onPathChange, addToHistory, setPoints])

  const handleUpdatePoint = useCallback((id: string, updates: Partial<PathPoint>) => {
    const newPoints = points.map(p => {
      if (p.id === id) {
        return { ...p, ...updates }
      }
      return p
    })
    setPoints(newPoints)
    onPathChange(newPoints)
    addToHistory(newPoints)
  }, [points, onPathChange, addToHistory, setPoints])

  const handleDeletePoint = useCallback((id: string) => {
    const newPoints = points.filter(p => p.id !== id)
    setPoints(newPoints)
    onPathChange(newPoints)
    addToHistory(newPoints)
  }, [points, onPathChange, addToHistory, setPoints])

  const handlePointDrag = useCallback((id: string, x: number, y: number) => {
    handleUpdatePoint(id, { x, y })
  }, [handleUpdatePoint])

  return {
    handleAddPoint,
    handleUpdatePoint,
    handleDeletePoint,
    handlePointDrag,
  }
} 