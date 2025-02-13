import { useCallback, useRef, useState } from 'react'
import { PathPoint } from '../types'
import { getDistance, calculatePathLength } from '../utils/animation'

interface PathStats {
  totalPoints: number
  totalLength: number
  totalTime: number
  averageSpeed: number
  complexity: number
  smoothness: number
}

interface PathEvent {
  type: string
  timestamp: number
  details: any
}

export function usePathAnalytics() {
  const [stats, setStats] = useState<PathStats>({
    totalPoints: 0,
    totalLength: 0,
    totalTime: 0,
    averageSpeed: 0,
    complexity: 0,
    smoothness: 0,
  })

  const eventsRef = useRef<PathEvent[]>([])

  // 计算路径统计信息
  const calculateStats = useCallback((points: PathPoint[]): PathStats => {
    if (points.length === 0) {
      return stats
    }

    const totalPoints = points.length
    const totalLength = calculatePathLength(points)
    const totalTime = points[points.length - 1].time - points[0].time

    // 计算平均速度
    const averageSpeed = totalLength / (totalTime || 1)

    // 计算路径复杂度（基于方向变化）
    let complexity = 0
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
      const angleDiff = Math.abs(angle2 - angle1)
      
      complexity += angleDiff
    }
    complexity = complexity / (points.length - 2 || 1)

    // 计算平滑度（基于点之间的距离变化）
    let smoothness = 0
    const distances: number[] = []
    for (let i = 1; i < points.length; i++) {
      distances.push(getDistance(points[i - 1], points[i]))
    }
    
    for (let i = 1; i < distances.length; i++) {
      smoothness += Math.abs(distances[i] - distances[i - 1])
    }
    smoothness = 1 - (smoothness / (totalLength || 1))

    return {
      totalPoints,
      totalLength,
      totalTime,
      averageSpeed,
      complexity,
      smoothness,
    }
  }, [stats])

  // 记录事件
  const logEvent = useCallback((type: string, details: any = {}) => {
    const event: PathEvent = {
      type,
      timestamp: Date.now(),
      details,
    }
    eventsRef.current.push(event)
  }, [])

  // 获取事件历史
  const getEventHistory = useCallback(() => {
    return [...eventsRef.current]
  }, [])

  // 分析路径质量
  const analyzePathQuality = useCallback((points: PathPoint[]) => {
    const currentStats = calculateStats(points)
    
    return {
      efficiency: currentStats.totalLength / (currentStats.complexity || 1),
      consistency: currentStats.smoothness,
      timing: currentStats.averageSpeed,
      suggestions: [
        currentStats.complexity > 2 && '路径过于复杂，建议简化',
        currentStats.smoothness < 0.5 && '路径不够平滑，建议调整',
        currentStats.averageSpeed > 100 && '动画速度可能过快',
      ].filter(Boolean),
    }
  }, [calculateStats])

  // 更新统计信息
  const updateStats = useCallback((points: PathPoint[]) => {
    const newStats = calculateStats(points)
    setStats(newStats)
    logEvent('STATS_UPDATE', newStats)
  }, [calculateStats, logEvent])

  return {
    stats,
    updateStats,
    logEvent,
    getEventHistory,
    analyzePathQuality,
  }
} 