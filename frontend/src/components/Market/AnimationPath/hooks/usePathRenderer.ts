import { useCallback, useMemo } from 'react'
import { PathPoint } from '../types'

interface RenderConfig {
  showGuides: boolean
  showHandles: boolean
  showGrid: boolean
  quality: 'low' | 'medium' | 'high'
}

export const usePathRenderer = () => {
  const getPathSegments = useCallback((points: PathPoint[], quality: string) => {
    const segments: { start: PathPoint; end: PathPoint; control?: PathPoint }[] = []
    const interpolationSteps = quality === 'high' ? 60 : quality === 'medium' ? 30 : 15

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]
      
      // 根据缓动函数生成控制点
      if (end.easing !== 'linear') {
        const control = {
          id: `control-${start.id}-${end.id}`,
          x: (start.x + end.x) / 2,
          y: end.easing === 'easeInOut'
            ? start.y + (end.y - start.y) * 0.25
            : start.y + (end.y - start.y) * 0.75,
          time: (start.time + end.time) / 2,
          easing: 'linear',
        }
        segments.push({ start, end, control })
      } else {
        segments.push({ start, end })
      }
    }

    return segments
  }, [])

  const getPathCommands = useMemo(() => {
    return (points: PathPoint[], config: RenderConfig) => {
      if (points.length < 2) return ''

      const segments = getPathSegments(points, config.quality)
      let commands = `M ${points[0].x} ${points[0].y}`

      segments.forEach(({ start, end, control }) => {
        if (control) {
          commands += ` Q ${control.x} ${control.y}, ${end.x} ${end.y}`
        } else {
          commands += ` L ${end.x} ${end.y}`
        }
      })

      return commands
    }
  }, [getPathSegments])

  const getGuideElements = useCallback((points: PathPoint[], config: RenderConfig) => {
    if (!config.showGuides) return []

    return points.map((point, index) => ({
      type: 'guide',
      key: `guide-${point.id}`,
      x: point.x,
      y: point.y,
      label: `${index + 1}`,
    }))
  }, [])

  return {
    getPathSegments,
    getPathCommands,
    getGuideElements,
  }
} 