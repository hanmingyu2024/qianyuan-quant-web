import { useCallback, useState } from 'react'
import { PathPoint } from '../types'

interface OptimizationConfig {
  smoothness: number
  simplification: number
  evenSpacing: boolean
  balanceSpeed: boolean
  autoClose: boolean
}

interface OptimizationResult {
  points: PathPoint[]
  changes: {
    type: string
    count: number
    description: string
  }[]
  metrics: {
    smoothnessImprovement: number
    speedVariationReduction: number
    pointsReduction: number
  }
}

export const usePathAutoOptimizer = () => {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null)

  const optimizePath = useCallback((points: PathPoint[], config: OptimizationConfig): OptimizationResult => {
    let optimizedPoints = [...points]
    const changes: OptimizationResult['changes'] = []
    
    // 1. 简化路径 - 移除冗余点
    if (config.simplification > 0) {
      const originalCount = optimizedPoints.length
      optimizedPoints = simplifyPath(optimizedPoints, config.simplification)
      const removedCount = originalCount - optimizedPoints.length
      
      if (removedCount > 0) {
        changes.push({
          type: 'simplify',
          count: removedCount,
          description: `移除了${removedCount}个冗余点`,
        })
      }
    }

    // 2. 平滑路径
    if (config.smoothness > 0) {
      const originalAngles = calculateTotalAngles(optimizedPoints)
      optimizedPoints = smoothPath(optimizedPoints, config.smoothness)
      const newAngles = calculateTotalAngles(optimizedPoints)
      
      if (newAngles < originalAngles) {
        changes.push({
          type: 'smooth',
          count: Math.round(originalAngles - newAngles),
          description: '优化了路径平滑度',
        })
      }
    }

    // 3. 均匀分布点
    if (config.evenSpacing) {
      const originalVariance = calculateSpacingVariance(optimizedPoints)
      optimizedPoints = redistributePoints(optimizedPoints)
      const newVariance = calculateSpacingVariance(optimizedPoints)
      
      if (newVariance < originalVariance) {
        changes.push({
          type: 'redistribute',
          count: optimizedPoints.length,
          description: '重新分布点以获得更均匀的间距',
        })
      }
    }

    // 4. 平衡速度
    if (config.balanceSpeed) {
      const originalSpeedVar = calculateSpeedVariance(optimizedPoints)
      optimizedPoints = balanceSpeeds(optimizedPoints)
      const newSpeedVar = calculateSpeedVariance(optimizedPoints)
      
      if (newSpeedVar < originalSpeedVar) {
        changes.push({
          type: 'balance-speed',
          count: optimizedPoints.length - 1,
          description: '平衡了路径段速度',
        })
      }
    }

    // 5. 自动闭合路径
    if (config.autoClose) {
      const firstPoint = optimizedPoints[0]
      const lastPoint = optimizedPoints[optimizedPoints.length - 1]
      const distance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + 
        Math.pow(lastPoint.y - firstPoint.y, 2)
      )
      
      if (distance < 20) {
        optimizedPoints[optimizedPoints.length - 1] = {
          ...lastPoint,
          x: firstPoint.x,
          y: firstPoint.y,
        }
        changes.push({
          type: 'close',
          count: 1,
          description: '自动闭合了路径',
        })
      }
    }

    const result = {
      points: optimizedPoints,
      changes,
      metrics: {
        smoothnessImprovement: calculateSmoothnessImprovement(points, optimizedPoints),
        speedVariationReduction: calculateSpeedVariationReduction(points, optimizedPoints),
        pointsReduction: points.length - optimizedPoints.length,
      },
    }

    setLastResult(result)
    return result
  }, [])

  const autoOptimize = useCallback(async (points: PathPoint[], config: OptimizationConfig) => {
    setIsOptimizing(true)
    try {
      return optimizePath(points, config)
    } finally {
      setIsOptimizing(false)
    }
  }, [optimizePath])

  return {
    autoOptimize,
    isOptimizing,
    lastResult,
  }
}

// 辅助函数
function simplifyPath(points: PathPoint[], tolerance: number): PathPoint[] {
  // 实现Douglas-Peucker算法
  if (points.length <= 2) return points
  
  let maxDistance = 0
  let maxIndex = 0
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], firstPoint, lastPoint)
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }
  
  if (maxDistance > tolerance) {
    const firstHalf = simplifyPath(points.slice(0, maxIndex + 1), tolerance)
    const secondHalf = simplifyPath(points.slice(maxIndex), tolerance)
    return [...firstHalf.slice(0, -1), ...secondHalf]
  }
  
  return [firstPoint, lastPoint]
}

function smoothPath(points: PathPoint[], factor: number): PathPoint[] {
  const result = [...points]
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    
    result[i] = {
      ...curr,
      x: curr.x + (prev.x + next.x - 2 * curr.x) * factor,
      y: curr.y + (prev.y + next.y - 2 * curr.y) * factor,
    }
  }
  
  return result
}

function redistributePoints(points: PathPoint[]): PathPoint[] {
  if (points.length <= 2) return points
  
  // 计算路径总长度
  let totalLength = 0
  const segments: { length: number; start: PathPoint; end: PathPoint }[] = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2)
    )
    totalLength += length
    segments.push({ length, start, end })
  }
  
  // 计算理想间距
  const idealSpacing = totalLength / (points.length - 1)
  const result: PathPoint[] = [points[0]]
  let currentDist = 0
  let segmentIndex = 0
  
  // 重新分布点
  for (let i = 1; i < points.length - 1; i++) {
    const targetDist = i * idealSpacing
    
    // 找到目标距离所在的段
    while (currentDist + segments[segmentIndex].length < targetDist) {
      currentDist += segments[segmentIndex].length
      segmentIndex++
    }
    
    const segment = segments[segmentIndex]
    const segmentDist = targetDist - currentDist
    const ratio = segmentDist / segment.length
    
    // 插值计算新点位置
    const newPoint: PathPoint = {
      id: `redistributed-${i}`,
      x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
      y: segment.start.y + (segment.end.y - segment.start.y) * ratio,
      time: points[i].time, // 保持原有时间
      easing: points[i].easing, // 保持原有缓动
    }
    
    result.push(newPoint)
  }
  
  result.push(points[points.length - 1])
  return result
}

function balanceSpeeds(points: PathPoint[]): PathPoint[] {
  if (points.length <= 2) return points
  
  const result = [...points]
  const speeds: number[] = []
  
  // 计算当前速度
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    const speed = distance / p2.time
    speeds.push(speed)
  }
  
  // 计算目标速度（使用中位数以避免异常值的影响）
  const sortedSpeeds = [...speeds].sort((a, b) => a - b)
  const targetSpeed = sortedSpeeds[Math.floor(speeds.length / 2)]
  
  // 调整时间以平衡速度
  for (let i = 1; i < result.length; i++) {
    const p1 = result[i - 1]
    const p2 = result[i]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    const currentSpeed = distance / p2.time
    
    // 如果速度差异过大，调整时间
    if (Math.abs(currentSpeed - targetSpeed) / targetSpeed > 0.2) {
      result[i] = {
        ...p2,
        time: distance / targetSpeed,
      }
    }
  }
  
  return result
}

function calculateTotalAngles(points: PathPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]
    const p3 = points[i + 1]
    
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
    let diff = Math.abs(angle2 - angle1)
    if (diff > Math.PI) diff = 2 * Math.PI - diff
    total += diff
  }
  return total
}

function calculateSpacingVariance(points: PathPoint[]): number {
  if (points.length <= 2) return 0
  
  const distances: number[] = []
  let totalDistance = 0
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    distances.push(distance)
    totalDistance += distance
  }
  
  const avgDistance = totalDistance / distances.length
  const variance = distances.reduce(
    (sum, dist) => sum + Math.pow(dist - avgDistance, 2),
    0
  ) / distances.length
  
  return variance
}

function calculateSpeedVariance(points: PathPoint[]): number {
  if (points.length <= 2) return 0
  
  const speeds: number[] = []
  let totalSpeed = 0
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    const speed = distance / p2.time
    speeds.push(speed)
    totalSpeed += speed
  }
  
  const avgSpeed = totalSpeed / speeds.length
  const variance = speeds.reduce(
    (sum, speed) => sum + Math.pow(speed - avgSpeed, 2),
    0
  ) / speeds.length
  
  return variance
}

function calculateSmoothnessImprovement(original: PathPoint[], optimized: PathPoint[]): number {
  const originalAngles = calculateTotalAngles(original)
  const optimizedAngles = calculateTotalAngles(optimized)
  
  if (originalAngles === 0) return 0
  return ((originalAngles - optimizedAngles) / originalAngles) * 100
}

function calculateSpeedVariationReduction(original: PathPoint[], optimized: PathPoint[]): number {
  const originalVar = calculateSpeedVariance(original)
  const optimizedVar = calculateSpeedVariance(optimized)
  
  if (originalVar === 0) return 0
  return ((originalVar - optimizedVar) / originalVar) * 100
}

function perpendicularDistance(point: PathPoint, lineStart: PathPoint, lineEnd: PathPoint): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  
  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + 
      Math.pow(point.y - lineStart.y, 2)
    )
  }
  
  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / 
           (dx * dx + dy * dy)
  
  if (t < 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + 
      Math.pow(point.y - lineStart.y, 2)
    )
  }
  
  if (t > 1) {
    return Math.sqrt(
      Math.pow(point.x - lineEnd.x, 2) + 
      Math.pow(point.y - lineEnd.y, 2)
    )
  }
  
  const projX = lineStart.x + t * dx
  const projY = lineStart.y + t * dy
  
  return Math.sqrt(
    Math.pow(point.x - projX, 2) + 
    Math.pow(point.y - projY, 2)
  )
} 