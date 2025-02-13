import { useCallback, useRef, useState } from 'react'
import { PathPoint } from '../types'
import { PERFORMANCE_CONFIG } from '../performance'

interface PathEffect {
  id: string
  type: 'trail' | 'glow' | 'dash' | 'particle'
  options: any
}

interface UsePathEffectsProps {
  enabled?: boolean
  maxEffects?: number
  onEffectStart?: (effect: PathEffect) => void
  onEffectEnd?: (effectId: string) => void
}

export function usePathEffects({
  enabled = true,
  maxEffects = 10,
  onEffectStart,
  onEffectEnd,
}: UsePathEffectsProps = {}) {
  const [activeEffects, setActiveEffects] = useState<PathEffect[]>([])
  const effectsRef = useRef<Map<string, any>>(new Map())

  // 创建轨迹效果
  const createTrailEffect = useCallback((point: PathPoint, length: number = 10) => {
    const id = `trail-${Date.now()}`
    const effect: PathEffect = {
      id,
      type: 'trail',
      options: {
        points: [point],
        maxLength: length,
        opacity: 0.5,
        color: '#1890ff',
      },
    }
    return effect
  }, [])

  // 创建发光效果
  const createGlowEffect = useCallback((point: PathPoint, radius: number = 20) => {
    const id = `glow-${Date.now()}`
    const effect: PathEffect = {
      id,
      type: 'glow',
      options: {
        x: point.x,
        y: point.y,
        radius,
        color: '#1890ff',
        blur: 15,
      },
    }
    return effect
  }, [])

  // 创建虚线效果
  const createDashEffect = useCallback((points: PathPoint[], dashLength: number = 5) => {
    const id = `dash-${Date.now()}`
    const effect: PathEffect = {
      id,
      type: 'dash',
      options: {
        points,
        dashLength,
        gapLength: 5,
        speed: 1,
        color: '#1890ff',
      },
    }
    return effect
  }, [])

  // 创建粒子效果
  const createParticleEffect = useCallback((point: PathPoint, count: number = 10) => {
    const id = `particle-${Date.now()}`
    const effect: PathEffect = {
      id,
      type: 'particle',
      options: {
        x: point.x,
        y: point.y,
        count,
        speed: 2,
        size: 3,
        color: '#1890ff',
        lifetime: 1000,
      },
    }
    return effect
  }, [])

  // 添加效果
  const addEffect = useCallback((effect: PathEffect) => {
    if (!enabled || effectsRef.current.size >= maxEffects) return

    setActiveEffects(prev => {
      const newEffects = [...prev, effect]
      if (newEffects.length > maxEffects) {
        const [oldestEffect, ...rest] = newEffects
        onEffectEnd?.(oldestEffect.id)
        return rest
      }
      return newEffects
    })

    effectsRef.current.set(effect.id, effect)
    onEffectStart?.(effect)

    return effect.id
  }, [enabled, maxEffects, onEffectStart, onEffectEnd])

  // 移除效果
  const removeEffect = useCallback((effectId: string) => {
    setActiveEffects(prev => prev.filter(effect => effect.id !== effectId))
    effectsRef.current.delete(effectId)
    onEffectEnd?.(effectId)
  }, [onEffectEnd])

  // 更新效果
  const updateEffect = useCallback((effectId: string, updates: Partial<PathEffect>) => {
    const effect = effectsRef.current.get(effectId)
    if (!effect) return

    const updatedEffect = {
      ...effect,
      ...updates,
      options: {
        ...effect.options,
        ...updates.options,
      },
    }

    effectsRef.current.set(effectId, updatedEffect)
    setActiveEffects(prev => 
      prev.map(e => e.id === effectId ? updatedEffect : e)
    )
  }, [])

  // 清除所有效果
  const clearEffects = useCallback(() => {
    const effectIds = Array.from(effectsRef.current.keys())
    effectIds.forEach(id => {
      onEffectEnd?.(id)
    })
    effectsRef.current.clear()
    setActiveEffects([])
  }, [onEffectEnd])

  return {
    activeEffects,
    createTrailEffect,
    createGlowEffect,
    createDashEffect,
    createParticleEffect,
    addEffect,
    removeEffect,
    updateEffect,
    clearEffects,
  }
} 