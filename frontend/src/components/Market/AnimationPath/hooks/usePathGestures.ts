import { useCallback, useRef } from 'react'
import { PathPoint } from '../types'
import { PERFORMANCE_CONFIG } from '../performance'

interface UsePathGesturesProps {
  onPan?: (deltaX: number, deltaY: number) => void
  onZoom?: (scale: number, center: { x: number, y: number }) => void
  onRotate?: (angle: number, center: { x: number, y: number }) => void
  onPinchStart?: () => void
  onPinchEnd?: () => void
}

interface GestureState {
  isPanning: boolean
  isPinching: boolean
  startX: number
  startY: number
  lastX: number
  lastY: number
  startDistance: number
  startAngle: number
  scale: number
}

export function usePathGestures({
  onPan,
  onZoom,
  onRotate,
  onPinchStart,
  onPinchEnd,
}: UsePathGesturesProps = {}) {
  const gestureStateRef = useRef<GestureState>({
    isPanning: false,
    isPinching: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startDistance: 0,
    startAngle: 0,
    scale: 1,
  })

  // 计算两个触摸点之间的距离
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // 计算两个触摸点形成的角度
  const getAngle = useCallback((touch1: Touch, touch2: Touch): number => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    )
  }, [])

  // 处理触摸开始
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]

      gestureStateRef.current = {
        ...gestureStateRef.current,
        isPinching: true,
        startDistance: getDistance(touch1, touch2),
        startAngle: getAngle(touch1, touch2),
      }

      onPinchStart?.()
    } else if (event.touches.length === 1) {
      const touch = event.touches[0]
      gestureStateRef.current = {
        ...gestureStateRef.current,
        isPanning: true,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastY: touch.clientY,
      }
    }
  }, [getDistance, getAngle, onPinchStart])

  // 处理触摸移动
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2 && gestureStateRef.current.isPinching) {
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      const currentDistance = getDistance(touch1, touch2)
      const currentAngle = getAngle(touch1, touch2)

      // 计算缩放
      const scale = currentDistance / gestureStateRef.current.startDistance
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }
      onZoom?.(scale, center)

      // 计算旋转
      const angleDelta = currentAngle - gestureStateRef.current.startAngle
      onRotate?.(angleDelta, center)

    } else if (event.touches.length === 1 && gestureStateRef.current.isPanning) {
      const touch = event.touches[0]
      const deltaX = touch.clientX - gestureStateRef.current.lastX
      const deltaY = touch.clientY - gestureStateRef.current.lastY

      onPan?.(deltaX, deltaY)

      gestureStateRef.current.lastX = touch.clientX
      gestureStateRef.current.lastY = touch.clientY
    }
  }, [getDistance, getAngle, onZoom, onRotate, onPan])

  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    if (gestureStateRef.current.isPinching) {
      onPinchEnd?.()
    }

    gestureStateRef.current = {
      ...gestureStateRef.current,
      isPanning: false,
      isPinching: false,
    }
  }, [onPinchEnd])

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isPanning: gestureStateRef.current.isPanning,
    isPinching: gestureStateRef.current.isPinching,
  }
} 