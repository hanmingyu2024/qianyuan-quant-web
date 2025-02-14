import { useCallback } from 'react'
import { PathPoint } from '../types'
import { PathError } from '../errors'
import { LIMITS } from '../config'
import { getDistance } from '../utils'

interface ValidationOptions {
  minPoints?: number
  maxPoints?: number
  minDistance?: number
  maxDistance?: number
  minTime?: number
  maxTime?: number
  allowDuplicatePoints?: boolean
  allowNegativeTime?: boolean
  validateEasing?: boolean
}

export function usePathValidation(options: ValidationOptions = {}) {
  const {
    minPoints = LIMITS.MIN_POINTS,
    maxPoints = LIMITS.MAX_POINTS,
    minDistance = LIMITS.MIN_DISTANCE,
    maxDistance = LIMITS.MAX_DISTANCE,
    minTime = LIMITS.MIN_TIME,
    maxTime = LIMITS.MAX_TIME,
    allowDuplicatePoints = false,
    allowNegativeTime = false,
    validateEasing = true,
  } = options

  // 验证单个点
  const validatePoint = useCallback((point: PathPoint): void => {
    // 验证坐标
    if (typeof point.x !== 'number' || isNaN(point.x)) {
      throw new PathError('INVALID_POINT', 'Invalid x coordinate')
    }
    if (typeof point.y !== 'number' || isNaN(point.y)) {
      throw new PathError('INVALID_POINT', 'Invalid y coordinate')
    }

    // 验证时间
    if (typeof point.time !== 'number' || isNaN(point.time)) {
      throw new PathError('INVALID_POINT', 'Invalid time value')
    }
    if (!allowNegativeTime && point.time < 0) {
      throw new PathError('INVALID_POINT', 'Negative time is not allowed')
    }
    if (point.time < minTime || point.time > maxTime) {
      throw new PathError('INVALID_POINT', `Time must be between ${minTime} and ${maxTime}`)
    }

    // 验证缓动函数
    if (validateEasing && !['linear', 'easeIn', 'easeOut', 'easeInOut'].includes(point.easing)) {
      throw new PathError('INVALID_POINT', 'Invalid easing function')
    }
  }, [allowNegativeTime, minTime, maxTime, validateEasing])

  // 验证整个路径
  const validatePath = useCallback((points: PathPoint[]): string[] => {
    const errors: string[] = []

    // 验证点的数量
    if (points.length < minPoints) {
      errors.push(`Path must have at least ${minPoints} points`)
    }
    if (points.length > maxPoints) {
      errors.push(`Path cannot have more than ${maxPoints} points`)
    }

    // 验证每个点
    points.forEach((point, index) => {
      try {
        validatePoint(point)
      } catch (error) {
        errors.push(`Point ${index + 1}: ${error instanceof Error ? error.message : 'Invalid point'}`)
      }
    })

    // 验证点之间的距离
    for (let i = 0; i < points.length - 1; i++) {
      const distance = getDistance(points[i], points[i + 1])
      if (distance < minDistance) {
        errors.push(`Distance between points ${i + 1} and ${i + 2} is too small`)
      }
      if (distance > maxDistance) {
        errors.push(`Distance between points ${i + 1} and ${i + 2} is too large`)
      }
    }

    // 验证时间顺序
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].time >= points[i + 1].time) {
        errors.push(`Time must be strictly increasing (point ${i + 1} to ${i + 2})`)
      }
    }

    // 验证重复点
    if (!allowDuplicatePoints) {
      const seen = new Set<string>()
      points.forEach((point, index) => {
        const key = `${point.x},${point.y}`
        if (seen.has(key)) {
          errors.push(`Duplicate point detected at index ${index + 1}`)
        }
        seen.add(key)
      })
    }

    return errors
  }, [
    minPoints,
    maxPoints,
    minDistance,
    maxDistance,
    allowDuplicatePoints,
    validatePoint,
  ])

  return {
    validatePoint,
    validatePath,
  }
} 