import { useState, useCallback } from 'react'
import { PathPoint } from '../types'

interface UseDragStateProps {
  onPointDrag: (id: string, x: number, y: number) => void
}

export const useDragState = ({ onPointDrag }: UseDragStateProps) => {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleDragStart = useCallback((pointId: string, startX: number, startY: number) => {
    setDraggedPoint(pointId)
    setDragOffset({ x: startX, y: startY })
  }, [])

  const handleDragMove = useCallback((x: number, y: number) => {
    if (draggedPoint) {
      onPointDrag(draggedPoint, x - dragOffset.x, y - dragOffset.y)
    }
  }, [draggedPoint, dragOffset, onPointDrag])

  const handleDragEnd = useCallback(() => {
    setDraggedPoint(null)
  }, [])

  return {
    draggedPoint,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
} 