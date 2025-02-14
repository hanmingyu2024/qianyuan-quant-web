import { PathPoint } from '../types'

export class PerformanceOptimizer {
  private static readonly BATCH_SIZE = 10
  private static readonly DEBOUNCE_DELAY = 16
  private static readonly THROTTLE_DELAY = 32

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = PerformanceOptimizer.DEBOUNCE_DELAY
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        func(...args)
        timeoutId = null
      }, wait)
    }
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = PerformanceOptimizer.THROTTLE_DELAY
  ): (...args: Parameters<T>) => void {
    let waiting = false

    return (...args: Parameters<T>) => {
      if (!waiting) {
        func(...args)
        waiting = true
        setTimeout(() => {
          waiting = false
        }, limit)
      }
    }
  }

  static batchProcess<T>(
    items: T[],
    processor: (item: T) => void,
    batchSize: number = PerformanceOptimizer.BATCH_SIZE
  ): void {
    let index = 0

    function processBatch() {
      const batch = items.slice(index, index + batchSize)
      batch.forEach(processor)
      index += batchSize

      if (index < items.length) {
        requestAnimationFrame(processBatch)
      }
    }

    processBatch()
  }

  static optimizePath(points: PathPoint[]): PathPoint[] {
    // 移除过近的点
    const minDistance = 5
    return points.filter((point, index) => {
      if (index === 0) return true
      const prev = points[index - 1]
      const distance = Math.hypot(point.x - prev.x, point.y - prev.y)
      return distance >= minDistance
    })
  }

  static memoize<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>()

    return ((...args: Parameters<T>) => {
      const key = resolver ? resolver(...args) : JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  }
}

// 使用示例
export const optimizedCalculations = {
  calculatePathLength: PerformanceOptimizer.memoize(
    (points: PathPoint[]) => {
      let length = 0
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x
        const dy = points[i].y - points[i - 1].y
        length += Math.sqrt(dx * dx + dy * dy)
      }
      return length
    },
    points => points.map(p => `${p.x},${p.y}`).join('|')
  ),
}import { PathPoint } from '../types'

export class PerformanceOptimizer {
  private static readonly BATCH_SIZE = 10
  private static readonly DEBOUNCE_DELAY = 16
  private static readonly THROTTLE_DELAY = 32

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = PerformanceOptimizer.DEBOUNCE_DELAY
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        func(...args)
        timeoutId = null
      }, wait)
    }
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = PerformanceOptimizer.THROTTLE_DELAY
  ): (...args: Parameters<T>) => void {
    let waiting = false

    return (...args: Parameters<T>) => {
      if (!waiting) {
        func(...args)
        waiting = true
        setTimeout(() => {
          waiting = false
        }, limit)
      }
    }
  }

  static batchProcess<T>(
    items: T[],
    processor: (item: T) => void,
    batchSize: number = PerformanceOptimizer.BATCH_SIZE
  ): void {
    let index = 0

    function processBatch() {
      const batch = items.slice(index, index + batchSize)
      batch.forEach(processor)
      index += batchSize

      if (index < items.length) {
        requestAnimationFrame(processBatch)
      }
    }

    processBatch()
  }

  static optimizePath(points: PathPoint[]): PathPoint[] {
    // 移除过近的点
    const minDistance = 5
    return points.filter((point, index) => {
      if (index === 0) return true
      const prev = points[index - 1]
      const distance = Math.hypot(point.x - prev.x, point.y - prev.y)
      return distance >= minDistance
    })
  }

  static memoize<T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>()

    return ((...args: Parameters<T>) => {
      const key = resolver ? resolver(...args) : JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  }
}

// 使用示例
export const optimizedCalculations = {
  calculatePathLength: PerformanceOptimizer.memoize(
    (points: PathPoint[]) => {
      let length = 0
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x
        const dy = points[i].y - points[i - 1].y
        length += Math.sqrt(dx * dx + dy * dy)
      }
      return length
    },
    points => points.map(p => `${p.x},${p.y}`).join('|')
  ),
}