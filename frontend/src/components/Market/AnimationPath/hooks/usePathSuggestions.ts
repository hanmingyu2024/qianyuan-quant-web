import { useCallback, useMemo } from 'react'
import { PathPoint } from '../types'

interface Suggestion {
  id: string
  type: 'optimize' | 'improve' | 'warning'
  message: string
  priority: number
  action?: () => void
}

export const usePathSuggestions = (points: PathPoint[]) => {
  const analyzePath = useCallback(() => {
    const suggestions: Suggestion[] = []
    
    // 检查路径长度
    if (points.length < 2) {
      suggestions.push({
        id: 'min-points',
        type: 'warning',
        message: '路径至少需要2个点才能形成有效动画',
        priority: 1,
      })
    }
    
    // 检查点分布
    if (points.length >= 2) {
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
      const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length
      
      if (variance > avgDistance * 2) {
        suggestions.push({
          id: 'uneven-distribution',
          type: 'improve',
          message: '点的分布不均匀，建议调整点的间距使其更加均匀',
          priority: 2,
        })
      }
    }
    
    // 检查速度变化
    if (points.length >= 2) {
      const speeds: number[] = []
      
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
        const speed = distance / p2.time
        speeds.push(speed)
      }
      
      const maxSpeed = Math.max(...speeds)
      const minSpeed = Math.min(...speeds)
      
      if (maxSpeed / minSpeed > 3) {
        suggestions.push({
          id: 'speed-variation',
          type: 'improve',
          message: '速度变化过大，建议平滑速度曲线',
          priority: 3,
        })
      }
    }
    
    // 检查转角
    if (points.length >= 3) {
      let sharpTurns = 0
      
      for (let i = 1; i < points.length - 1; i++) {
        const p1 = points[i - 1]
        const p2 = points[i]
        const p3 = points[i + 1]
        
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
        let angleDiff = Math.abs((angle2 - angle1) * 180 / Math.PI)
        
        if (angleDiff > 180) {
          angleDiff = 360 - angleDiff
        }
        
        if (angleDiff > 90) {
          sharpTurns++
        }
      }
      
      if (sharpTurns > points.length / 4) {
        suggestions.push({
          id: 'sharp-turns',
          type: 'improve',
          message: '存在较多急转弯，建议增加过渡点使路径更平滑',
          priority: 4,
        })
      }
    }
    
    // 检查路径闭合性
    if (points.length >= 3) {
      const firstPoint = points[0]
      const lastPoint = points[points.length - 1]
      const distance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + 
        Math.pow(lastPoint.y - firstPoint.y, 2)
      )
      
      if (distance < 10) {
        suggestions.push({
          id: 'almost-closed',
          type: 'optimize',
          message: '路径几乎闭合，建议将终点与起点重合形成闭合路径',
          priority: 5,
        })
      }
    }
    
    return suggestions
  }, [points])
  
  const suggestions = useMemo(() => analyzePath(), [analyzePath])
  
  const getSuggestionsByType = useCallback((type: 'optimize' | 'improve' | 'warning') => {
    return suggestions.filter(s => s.type === type)
  }, [suggestions])
  
  const getHighPrioritySuggestions = useCallback(() => {
    return suggestions.filter(s => s.priority <= 3)
  }, [suggestions])
  
  return {
    suggestions,
    getSuggestionsByType,
    getHighPrioritySuggestions,
  }
} 