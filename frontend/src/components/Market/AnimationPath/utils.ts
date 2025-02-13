import { PathPoint, PathError } from './types'
import { ERROR_CODES, MIN_POINTS, MAX_POINTS, MIN_DISTANCE } from './constants'

export function validatePoint(point: PathPoint): void {
  if (typeof point.x !== 'number' || isNaN(point.x)) {
    throw new Error('Invalid x coordinate')
  }
  if (typeof point.y !== 'number' || isNaN(point.y)) {
    throw new Error('Invalid y coordinate')
  }
  if (typeof point.time !== 'number' || point.time < 0) {
    throw new Error('Invalid time value')
  }
}

export function validatePath(points: PathPoint[]): string[] {
  const errors: string[] = []

  if (points.length < MIN_POINTS) {
    errors.push(`Path must have at least ${MIN_POINTS} points`)
  }
  if (points.length > MAX_POINTS) {
    errors.push(`Path cannot have more than ${MAX_POINTS} points`)
  }

  // 检查点之间的距离
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const distance = getDistance(p1, p2)
    if (distance < MIN_DISTANCE) {
      errors.push(`Points ${i + 1} and ${i + 2} are too close`)
    }
  }

  return errors
}

export function getDistance(p1: PathPoint, p2: PathPoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export function createPathError(code: keyof typeof ERROR_CODES, message: string, details?: any): PathError {
  const error = new Error(message) as PathError
  error.code = ERROR_CODES[code]
  error.details = details
  return error
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func.apply(this, args)
      timeout = null
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function interpolate(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
} 