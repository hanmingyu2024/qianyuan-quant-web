import { useCallback, useRef } from 'react'
import { PathPoint } from '../types'
import { PERFORMANCE_CONFIG } from '../performance'

export function usePathPerformance() {
  const metricsRef = useRef<{
    renderTime: number[]
    memoryUsage: number[]
    frameDrops: number
  }>({
    renderTime: [],
    memoryUsage: [],
    frameDrops: 0,
  })

  const measurePerformance = useCallback((callback: () => void) => {
    const startTime = performance.now()
    callback()
    const endTime = performance.now()
    
    metricsRef.current.renderTime.push(endTime - startTime)
    if (metricsRef.current.renderTime.length > 100) {
      metricsRef.current.renderTime.shift()
    }
  }, [])

  const optimizePoints = useCallback((points: PathPoint[]) => {
    // 实现点的优化逻辑
    if (points.length <= 2) return points

    // 移除过近的点
    const optimized = points.filter((point, index) => {
      if (index === 0 || index === points.length - 1) return true
      const prev = points[index - 1]
      const next = points[index + 1]
      const distToPrev = Math.hypot(point.x - prev.x, point.y - prev.y)
      const distToNext = Math.hypot(point.x - next.x, point.y - next.y)
      return distToPrev > 5 || distToNext > 5
    })

    return optimized
  }, [])

  return {
    measurePerformance,
    optimizePoints,
    getMetrics: () => ({ ...metricsRef.current }),
  }
} 