import { useState, useCallback, useRef } from 'react'
import { PathPoint } from '../types'

interface PreviewConfig {
  speed: number
  loop: boolean
  showTrail: boolean
  trailLength: number
}

export const usePathPreview = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPoint, setCurrentPoint] = useState<[number, number] | null>(null)
  const [trailPoints, setTrailPoints] = useState<[number, number][]>([])
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  const startPreview = useCallback((points: PathPoint[], config: PreviewConfig) => {
    if (points.length < 2 || isPlaying) return

    setIsPlaying(true)
    startTimeRef.current = performance.now()
    const totalDuration = points.reduce((sum, p) => sum + p.time, 0) * 1000 / config.speed

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current
      const progress = config.loop ? (elapsed % totalDuration) / totalDuration : Math.min(elapsed / totalDuration, 1)

      if (progress >= 1 && !config.loop) {
        stopPreview()
        return
      }

      let currentTime = progress * totalDuration
      let currentIndex = 0
      let accumulatedTime = 0

      // 找到当前时间对应的点
      for (let i = 0; i < points.length - 1; i++) {
        const segmentDuration = points[i].time * 1000 / config.speed
        if (accumulatedTime + segmentDuration > currentTime) {
          currentIndex = i
          break
        }
        accumulatedTime += segmentDuration
      }

      // 计算插值位置
      const current = points[currentIndex]
      const next = points[Math.min(currentIndex + 1, points.length - 1)]
      const segmentProgress = (currentTime - accumulatedTime) / (next.time * 1000 / config.speed)
      
      const x = current.x + (next.x - current.x) * segmentProgress
      const y = current.y + (next.y - current.y) * segmentProgress

      setCurrentPoint([x, y])

      if (config.showTrail) {
        setTrailPoints(prev => {
          const newTrail = [...prev, [x, y]]
          return newTrail.slice(-config.trailLength)
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isPlaying])

  const stopPreview = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)
    setCurrentPoint(null)
    setTrailPoints([])
  }, [])

  const pausePreview = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)
  }, [])

  return {
    isPlaying,
    currentPoint,
    trailPoints,
    startPreview,
    stopPreview,
    pausePreview,
  }
} 