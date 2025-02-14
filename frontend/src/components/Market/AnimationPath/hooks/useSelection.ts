import { useState, useCallback } from 'react'

export const useSelection = () => {
  const [selectedPoints, setSelectedPoints] = useState<string[]>([])

  const togglePointSelection = useCallback((pointId: string) => {
    setSelectedPoints(prev => {
      if (prev.includes(pointId)) {
        return prev.filter(id => id !== pointId)
      }
      return [...prev, pointId]
    })
  }, [])

  const selectAll = useCallback((pointIds: string[]) => {
    setSelectedPoints(pointIds)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPoints([])
  }, [])

  return {
    selectedPoints,
    togglePointSelection,
    selectAll,
    clearSelection,
  }
} 