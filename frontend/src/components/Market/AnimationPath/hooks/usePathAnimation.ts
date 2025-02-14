import { useState, useRef, useCallback, useEffect } from 'react'
import { PathPoint } from '../types'
import { getPointAtProgress } from '../utils/animation'
import { PERFORMANCE_CONFIG } from '../performance'

interface UsePathAnimationProps {
  points: PathPoint[]
  duration?: number
  loop?: boolean
  autoPlay?: boolean
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export function usePathAnimation({
  points,
  duration = 5000,
  loop = false,
  autoPlay = false,
  onProgress,
  onComplete,
}: UsePathAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [progress, setProgress] = useState(0)
  const [currentPoint, setCurrentPoint] = useState<PathPoint | null>(null)
  
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>()

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const elapsed = timestamp - startTimeRef.current
    const newProgress = Math.min(elapsed / duration, 1)

    // 性能优化：使用节流控制更新频率
    if (!lastFrameTimeRef.current || 
        timestamp - lastFrameTimeRef.current >= PERFORMANCE_CONFIG.THROTTLE_DELAY.PREVIEW_UPDATE) {
      setProgress(newProgress)
      setCurrentPoint(getPointAtProgress(points, newProgress))
      onProgress?.(newProgress)
      lastFrameTimeRef.current = timestamp
    }

    if (newProgress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (loop) {
        startTimeRef.current = timestamp
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
        onComplete?.()
      }
    }
  }, [points, duration, loop, onProgress, onComplete])

  const play = useCallback(() => {
    setIsPlaying(true)
    startTimeRef.current = undefined
    lastFrameTimeRef.current = undefined
    animationRef.current = requestAnimationFrame(animate)
  }, [animate])

  const pause = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsPlaying(false)
    setProgress(0)
    setCurrentPoint(points[0] || null)
  }, [points])

  const seekTo = useCallback((targetProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, targetProgress))
    setProgress(clampedProgress)
    setCurrentPoint(getPointAtProgress(points, clampedProgress))
    startTimeRef.current = performance.now() - clampedProgress * duration
  }, [points, duration])

  useEffect(() => {
    if (autoPlay) {
      play()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [autoPlay, play])

  // 当点发生变化时重置动画
  useEffect(() => {
    stop()
  }, [points, stop])

  return {
    isPlaying,
    progress,
    currentPoint,
    play,
    pause,
    stop,
    seekTo,
  }
} 