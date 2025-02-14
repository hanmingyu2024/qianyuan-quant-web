import { useCallback, useRef } from 'react'
import { PathPoint } from '../types'
import { generateId } from '../utils'
import { PERFORMANCE_CONFIG } from '../performance'

interface PathEventHandlers {
  onPointAdd?: (point: PathPoint) => void
  onPointUpdate?: (id: string, updates: Partial<PathPoint>) => void
  onPointDelete?: (id: string) => void
  onPointSelect?: (id: string) => void
  onPointDragStart?: (id: string, x: number, y: number) => void
  onPointDragMove?: (id: string, x: number, y: number) => void
  onPointDragEnd?: (id: string, x: number, y: number) => void
  onPlayStart?: () => void
  onPlayPause?: () => void
  onPlayStop?: () => void
  onTimeUpdate?: (time: number) => void
  onZoomChange?: (scale: number) => void
  onPanChange?: (x: number, y: number) => void
  onError?: (error: string) => void
  onPathChange?: (points: PathPoint[]) => void
}

interface UsePathEventsProps {
  onPointAdd?: (point: PathPoint) => void
  onPointUpdate?: (point: PathPoint) => void
  onPointDelete?: (pointId: string) => void
  onPointSelect?: (pointId: string) => void
  onPointDragStart?: (pointId: string) => void
  onPointDragEnd?: (pointId: string) => void
  onPathChange?: (points: PathPoint[]) => void
}

export function usePathEvents({
  onPointAdd,
  onPointUpdate,
  onPointDelete,
  onPointSelect,
  onPointDragStart,
  onPointDragEnd,
  onPathChange,
}: UsePathEventsProps = {}) {
  const dragStateRef = useRef<{
    isDragging: boolean
    startX: number
    startY: number
    pointId: string | null
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    pointId: null,
  })

  // 处理点击添加点
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (dragStateRef.current.isDragging) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newPoint: PathPoint = {
      id: generateId(),
      x,
      y,
      time: Date.now(),
      easing: 'linear',
    }

    onPointAdd?.(newPoint)
  }, [onPointAdd])

  // 处理点的选择
  const handlePointSelect = useCallback((pointId: string) => {
    onPointSelect?.(pointId)
  }, [onPointSelect])

  // 处理拖拽开始
  const handleDragStart = useCallback((
    event: React.MouseEvent,
    pointId: string
  ) => {
    event.stopPropagation()
    
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      pointId,
    }

    onPointDragStart?.(pointId)
  }, [onPointDragStart])

  // 处理拖拽
  const handleDrag = useCallback((
    event: React.MouseEvent,
    point: PathPoint,
    containerRect: DOMRect
  ) => {
    if (!dragStateRef.current.isDragging) return

    const deltaX = event.clientX - dragStateRef.current.startX
    const deltaY = event.clientY - dragStateRef.current.startY

    const updatedPoint: PathPoint = {
      ...point,
      x: Math.max(0, Math.min(containerRect.width, point.x + deltaX)),
      y: Math.max(0, Math.min(containerRect.height, point.y + deltaY)),
    }

    dragStateRef.current.startX = event.clientX
    dragStateRef.current.startY = event.clientY

    onPointUpdate?.(updatedPoint)
  }, [onPointUpdate])

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    if (!dragStateRef.current.isDragging) return

    const pointId = dragStateRef.current.pointId
    dragStateRef.current = {
      isDragging: false,
      startX: 0,
      startY: 0,
      pointId: null,
    }

    if (pointId) {
      onPointDragEnd?.(pointId)
    }
  }, [onPointDragEnd])

  // 处理删除点
  const handlePointDelete = useCallback((pointId: string) => {
    onPointDelete?.(pointId)
  }, [onPointDelete])

  // 处理路径变化
  const handlePathChange = useCallback((points: PathPoint[]) => {
    onPathChange?.(points)
  }, [onPathChange])

  return {
    handleCanvasClick,
    handlePointSelect,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handlePointDelete,
    handlePathChange,
    isDragging: dragStateRef.current.isDragging,
  }
} 