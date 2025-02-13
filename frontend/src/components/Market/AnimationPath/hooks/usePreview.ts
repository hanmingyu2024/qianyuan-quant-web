import { useState, useCallback } from 'react'
import { PathPoint } from '../types'
import { interpolatePath } from '@/utils/pathInterpolation'

export const usePreview = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewPosition, setPreviewPosition] = useState<[number, number] | null>(null)
  const [progress, setProgress] = useState(0)
  const [previewTimer, setPreviewTimer] = useState<number | null>(null)

  const startPreview = useCallback((points: PathPoint[]) => {
    if (!points.length) return

    setIsPlaying(true)
    const interpolated = interpolatePath(points, 100)
    const totalDuration = points.reduce((sum, p) => sum + p.time, 0) * 1000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(elapsed / totalDuration, 1)
      setProgress(currentProgress)

      const index = Math.floor(currentProgress * (interpolated.length - 1))
      const point = interpolated[index]
      setPreviewPosition([point.x, point.y])

      if (currentProgress < 1) {
        setPreviewTimer(requestAnimationFrame(animate))
      } else {
        stopPreview()
      }
    }

    animate()
  }, [])

  const stopPreview = useCallback(() => {
    setIsPlaying(false)
    setProgress(0)
    setPreviewPosition(null)
    if (previewTimer) {
      cancelAnimationFrame(previewTimer)
      setPreviewTimer(null)
    }
  }, [previewTimer])

  return {
    isPlaying,
    previewPosition,
    progress,
    startPreview,
    stopPreview,
    setPreviewPosition,
  }
} 