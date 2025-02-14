import { useCallback } from 'react'
import { PathPoint } from '../types'
import { getDistance } from '../utils'
import { LIMITS } from '../config'

interface ConstraintsConfig {
  gridSize?: number
  snapToGrid?: boolean
  snapToPoints?: boolean
  snapToAngles?: boolean
  angleStep?: number
  minDistance?: number
  maxDistance?: number
}

export function usePathConstraints(config: ConstraintsConfig = {}) {
  const {
    gridSize = 20,
    snapToGrid = true,
    snapToPoints = true,
    snapToAngles = true,
    angleStep = 45,
    minDistance = LIMITS.MIN_DISTANCE,
    maxDistance = LIMITS.MAX_DISTANCE,
  } = config

  // 网格对齐
  const snapToGridPoint = useCallback((x: number, y: number): [number, number] => {
    if (!snapToGrid) return [x, y]
    return [
      Math.round(x / gridSize) * gridSize,
      Math.round(y / gridSize) * gridSize,
    ]
  }, [snapToGrid, gridSize])

  // 点对齐
  const snapToNearbyPoint = useCallback((x: number, y: number, points: PathPoint[]): [number, number] => {
    if (!snapToPoints) return [x, y]
    
    const snapDistance = gridSize / 2
    for (const point of points) {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2))
      if (distance < snapDistance) {
        return [point.x, point.y]
      }
    }
    return [x, y]
  }, [snapToPoints, gridSize])

  // 角度对齐
  const snapToAngle = useCallback((x: number, y: number, startX: number, startY: number): [number, number] => {
    if (!snapToAngles) return [x, y]

    const dx = x - startX
    const dy = y - startY
    const angle = Math.atan2(dy, dx)
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 将角度转换为度数并对齐到最近的步进值
    const degrees = angle * (180 / Math.PI)
    const snappedDegrees = Math.round(degrees / angleStep) * angleStep
    const snappedAngle = snappedDegrees * (Math.PI / 180)
    
    return [
      startX + Math.cos(snappedAngle) * distance,
      startY + Math.sin(snappedAngle) * distance,
    ]
  }, [snapToAngles, angleStep])

  // 距离约束
  const constrainDistance = useCallback((x: number, y: number, startX: number, startY: number): [number, number] => {
    const distance = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))
    
    if (distance < minDistance) {
      const ratio = minDistance / distance
      return [
        startX + (x - startX) * ratio,
        startY + (y - startY) * ratio,
      ]
    }
    
    if (maxDistance && distance > maxDistance) {
      const ratio = maxDistance / distance
      return [
        startX + (x - startX) * ratio,
        startY + (y - startY) * ratio,
      ]
    }
    
    return [x, y]
  }, [minDistance, maxDistance])

  // 应用所有约束
  const applyConstraints = useCallback((
    point: PathPoint,
    otherPoints: PathPoint[],
    startPoint?: PathPoint
  ): PathPoint => {
    let [x, y] = [point.x, point.y]

    // 应用网格对齐
    [x, y] = snapToGridPoint(x, y)

    // 应用点对齐
    [x, y] = snapToNearbyPoint(x, y, otherPoints)

    // 如果有起始点，应用角度和距离约束
    if (startPoint) {
      [x, y] = snapToAngle(x, y, startPoint.x, startPoint.y)
      [x, y] = constrainDistance(x, y, startPoint.x, startPoint.y)
    }

    return {
      ...point,
      x,
      y,
    }
  }, [snapToGridPoint, snapToNearbyPoint, snapToAngle, constrainDistance])

  return {
    applyConstraints,
    snapToGridPoint,
    snapToNearbyPoint,
    snapToAngle,
    constrainDistance,
  }
} 