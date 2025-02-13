import { useCallback } from 'react'
import { PathPoint } from '../types'

interface OptimizeOptions {
  simplifyTolerance: number
  smoothingFactor: number
  removeRedundant: boolean
}

export const usePathOptimizer = () => {
  const simplifyPath = useCallback((points: PathPoint[], tolerance: number) => {
    // 实现 Douglas-Peucker 算法
    if (points.length <= 2) return points

    const findFurthest = (start: PathPoint, end: PathPoint, points: PathPoint[]) => {
      let maxDistance = 0
      let index = 0

      for (let i = 1; i < points.length - 1; i++) {
        const distance = pointToLineDistance(points[i], start, end)
        if (distance > maxDistance) {
          maxDistance = distance
          index = i
        }
      }

      return { maxDistance, index }
    }

    const result: PathPoint[] = []
    const stack: [number, number][] = [[0, points.length - 1]]

    while (stack.length) {
      const [start, end] = stack.pop()!
      const { maxDistance, index } = findFurthest(points[start], points[end], points.slice(start, end + 1))

      if (maxDistance > tolerance) {
        stack.push([start, index])
        stack.push([index, end])
      } else {
        if (!result.includes(points[start])) result.push(points[start])
        if (!result.includes(points[end])) result.push(points[end])
      }
    }

    return result.sort((a, b) => points.indexOf(a) - points.indexOf(b))
  }, [])

  const smoothPath = useCallback((points: PathPoint[], factor: number) => {
    const result = [...points]
    for (let i = 1; i < points.length - 1; i++) {
      result[i] = {
        ...points[i],
        x: points[i].x * (1 - factor) + (points[i - 1].x + points[i + 1].x) / 2 * factor,
        y: points[i].y * (1 - factor) + (points[i - 1].y + points[i + 1].y) / 2 * factor,
      }
    }
    return result
  }, [])

  const optimizePath = useCallback((points: PathPoint[], options: OptimizeOptions) => {
    let result = [...points]

    if (options.removeRedundant) {
      result = result.filter((point, index, array) => {
        if (index === 0) return true
        const prev = array[index - 1]
        return !(point.x === prev.x && point.y === prev.y)
      })
    }

    if (options.simplifyTolerance > 0) {
      result = simplifyPath(result, options.simplifyTolerance)
    }

    if (options.smoothingFactor > 0) {
      result = smoothPath(result, options.smoothingFactor)
    }

    return result
  }, [simplifyPath, smoothPath])

  return {
    optimizePath,
    simplifyPath,
    smoothPath,
  }
}

// 辅助函数：计算点到线段的距离
function pointToLineDistance(point: PathPoint, lineStart: PathPoint, lineEnd: PathPoint) {
  const A = point.x - lineStart.x
  const B = point.y - lineStart.y
  const C = lineEnd.x - lineStart.x
  const D = lineEnd.y - lineStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) {
    param = dot / lenSq
  }

  let xx, yy

  if (param < 0) {
    xx = lineStart.x
    yy = lineStart.y
  } else if (param > 1) {
    xx = lineEnd.x
    yy = lineEnd.y
  } else {
    xx = lineStart.x + param * C
    yy = lineStart.y + param * D
  }

  const dx = point.x - xx
  const dy = point.y - yy

  return Math.sqrt(dx * dx + dy * dy)
} 