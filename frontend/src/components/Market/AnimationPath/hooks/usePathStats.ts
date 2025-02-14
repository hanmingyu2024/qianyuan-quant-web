import { useMemo } from 'react'
import { PathPoint } from '../types'

interface PathStats {
  totalDistance: number
  totalDuration: number
  averageSpeed: number
  pointCount: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export const usePathStats = (points: PathPoint[]) => {
  const stats = useMemo<PathStats>(() => {
    if (!points.length) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        averageSpeed: 0,
        pointCount: 0,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
      }
    }

    let totalDistance = 0
    let totalDuration = 0
    let minX = points[0].x
    let minY = points[0].y
    let maxX = points[0].x
    let maxY = points[0].y

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      
      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      totalDistance += Math.sqrt(dx * dx + dy * dy)
      totalDuration += curr.time

      minX = Math.min(minX, curr.x)
      minY = Math.min(minY, curr.y)
      maxX = Math.max(maxX, curr.x)
      maxY = Math.max(maxY, curr.y)
    }

    return {
      totalDistance,
      totalDuration,
      averageSpeed: totalDistance / totalDuration,
      pointCount: points.length,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    }
  }, [points])

  return stats
} 