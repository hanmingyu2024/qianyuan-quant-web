import { PathPoint } from '../types'
import { PERFORMANCE_CONFIG } from '../performance'

// 缓动函数
export const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
  },
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  }
}

export const getDistance = (point1: PathPoint, point2: PathPoint): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  )
}

export const calculatePathLength = (points: PathPoint[]): number => {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    length += getDistance(points[i - 1], points[i])
  }
  return length
}

export const getPointAtProgress = (
  points: PathPoint[], 
  progress: number
): PathPoint | null => {
  if (points.length < 2) return null
  
  const totalLength = calculatePathLength(points)
  const targetLength = totalLength * progress
  
  let currentLength = 0
  for (let i = 1; i < points.length; i++) {
    const segmentLength = getDistance(points[i - 1], points[i])
    if (currentLength + segmentLength >= targetLength) {
      const segmentProgress = (targetLength - currentLength) / segmentLength
      return {
        id: `interpolated-${i}`,
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * segmentProgress,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * segmentProgress,
        time: points[i - 1].time + (points[i].time - points[i - 1].time) * segmentProgress,
        easing: points[i - 1].easing,
      }
    }
    currentLength += segmentLength
  }
  
  return points[points.length - 1]
}

// 生成路径预览点
export function generatePreviewPoints(points: PathPoint[], steps: number = 100): PathPoint[] {
  const previewPoints: PathPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    previewPoints.push(getPointAtProgress(points, progress) as PathPoint)
  }
  return previewPoints
}

// 平滑路径
export function smoothPath(points: PathPoint[], tension: number = 0.5): PathPoint[] {
  if (points.length < 3) return points

  const smoothed: PathPoint[] = [points[0]]
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    
    smoothed.push({
      ...curr,
      x: curr.x + (next.x - prev.x) * tension * 0.5,
      y: curr.y + (next.y - prev.y) * tension * 0.5,
    })
  }
  
  smoothed.push(points[points.length - 1])
  return smoothed
}

// 计算路径的边界框
export function getPathBounds(points: PathPoint[]) {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
  }

  const bounds = points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y),
    }),
    {
      minX: points[0].x,
      maxX: points[0].x,
      minY: points[0].y,
      maxY: points[0].y,
    }
  )

  return {
    ...bounds,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  }
} 