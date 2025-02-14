import { useState, useCallback } from 'react'

export const useZoom = (initialScale = 1) => {
  const [scale, setScale] = useState(initialScale)
  const [center, setCenter] = useState<[number, number]>([0, 0])

  const handleZoom = useCallback((delta: number, x: number, y: number) => {
    setScale(prev => {
      const newScale = Math.max(0.1, Math.min(10, prev + delta))
      return newScale
    })
    setCenter([x, y])
  }, [])

  const resetZoom = useCallback(() => {
    setScale(initialScale)
    setCenter([0, 0])
  }, [initialScale])

  return {
    scale,
    center,
    handleZoom,
    resetZoom,
  }
} 