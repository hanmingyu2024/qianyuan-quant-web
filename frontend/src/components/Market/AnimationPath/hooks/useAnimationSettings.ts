import { useState, useCallback } from 'react'

interface AnimationSettings {
  duration: number
  delay: number
  loop: boolean
  autoplay: boolean
  easingFunction: string
}

export const useAnimationSettings = () => {
  const [settings, setSettings] = useState<AnimationSettings>({
    duration: 1000,
    delay: 0,
    loop: false,
    autoplay: false,
    easingFunction: 'easeInOut',
  })

  const updateSettings = useCallback((updates: Partial<AnimationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings({
      duration: 1000,
      delay: 0,
      loop: false,
      autoplay: false,
      easingFunction: 'easeInOut',
    })
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
} 