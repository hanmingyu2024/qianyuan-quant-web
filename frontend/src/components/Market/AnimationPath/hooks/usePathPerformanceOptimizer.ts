import { useCallback, useRef, useEffect } from 'react'
import { PathPoint } from '../types'

export const usePathPerformanceOptimizer = () => {
  const fpsRef = useRef<number>(60)
  const frameTimeRef = useRef<number[]>([])
  
  const optimizeForPerformance = useCallback((points: PathPoint[], targetFps: number = 60) => {
    // 根据FPS动态调整路径质量
    const currentFps = fpsRef.current
    if (currentFps < targetFps * 0.8) {
      // 降低质量
      return simplifyPathForPerformance(points)
    }
    return points
  }, [])

  const measurePerformance = useCallback(() => {
    const now = performance.now()
    const frameTimes = frameTimeRef.current
    
    if (frameTimes.length > 60) {
      frameTimes.shift()
    }
    
    frameTimes.push(now)
    
    if (frameTimes.length > 1) {
      const fps = 1000 / ((frameTimes[frameTimes.length - 1] - frameTimes[0]) / frameTimes.length)
      fpsRef.current = fps
    }
  }, [])

  useEffect(() => {
    let rafId: number
    const measure = () => {
      measurePerformance()
      rafId = requestAnimationFrame(measure)
    }
    rafId = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(rafId)
  }, [measurePerformance])

  return {
    optimizeForPerformance,
    getCurrentFps: () => fpsRef.current
  }
}

function simplifyPathForPerformance(points: PathPoint[]): PathPoint[] {
  // 简化路径点，每隔一个点采样
  return points.filter((_, index) => index % 2 === 0)
} 