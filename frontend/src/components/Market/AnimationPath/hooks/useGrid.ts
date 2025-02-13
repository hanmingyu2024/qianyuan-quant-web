import { useState, useCallback } from 'react'

interface GridSettings {
  enabled: boolean
  size: number
  snap: boolean
  color: string
  opacity: number
}

export const useGrid = () => {
  const [settings, setSettings] = useState<GridSettings>({
    enabled: true,
    size: 20,
    snap: true,
    color: '#ddd',
    opacity: 0.5,
  })

  const snapToGrid = useCallback((value: number) => {
    if (!settings.snap) return value
    return Math.round(value / settings.size) * settings.size
  }, [settings.snap, settings.size])

  const toggleGrid = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
  }, [])

  const toggleSnap = useCallback(() => {
    setSettings(prev => ({ ...prev, snap: !prev.snap }))
  }, [])

  const updateGridSize = useCallback((size: number) => {
    setSettings(prev => ({ ...prev, size }))
  }, [])

  return {
    settings,
    snapToGrid,
    toggleGrid,
    toggleSnap,
    updateGridSize,
  }
} 