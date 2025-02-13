import { useCallback, useRef } from 'react'
import { PathPoint } from '../types'
import { PERFORMANCE_CONFIG } from '../performance'

interface CacheItem {
  points: PathPoint[]
  timestamp: number
}

interface CacheMap {
  [key: string]: CacheItem
}

export function usePathCache() {
  const cacheRef = useRef<CacheMap>({})
  const cacheSize = useRef(0)

  // 生成缓存键
  const generateCacheKey = useCallback((points: PathPoint[]): string => {
    return points.map(p => `${p.id}-${p.x}-${p.y}-${p.time}`).join('|')
  }, [])

  // 清理过期缓存
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now()
    const { MAX_SIZE, TTL } = PERFORMANCE_CONFIG.CACHE
    
    Object.entries(cacheRef.current).forEach(([key, item]) => {
      if (now - item.timestamp > TTL) {
        delete cacheRef.current[key]
        cacheSize.current--
      }
    })

    // 如果缓存仍然太大，删除最旧的条目
    if (cacheSize.current > MAX_SIZE) {
      const sortedEntries = Object.entries(cacheRef.current)
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      
      const entriesToRemove = sortedEntries.slice(0, cacheSize.current - MAX_SIZE)
      entriesToRemove.forEach(([key]) => {
        delete cacheRef.current[key]
        cacheSize.current--
      })
    }
  }, [])

  // 添加到缓存
  const addToCache = useCallback((points: PathPoint[]) => {
    cleanExpiredCache()
    
    const key = generateCacheKey(points)
    if (!cacheRef.current[key]) {
      cacheRef.current[key] = {
        points: [...points],
        timestamp: Date.now(),
      }
      cacheSize.current++
    }
  }, [generateCacheKey, cleanExpiredCache])

  // 从缓存获取
  const getFromCache = useCallback((points: PathPoint[]): PathPoint[] | null => {
    const key = generateCacheKey(points)
    const cached = cacheRef.current[key]
    
    if (cached) {
      cached.timestamp = Date.now() // 更新访问时间
      return [...cached.points]
    }
    
    return null
  }, [generateCacheKey])

  // 清除缓存
  const clearCache = useCallback(() => {
    cacheRef.current = {}
    cacheSize.current = 0
  }, [])

  // 获取缓存统计信息
  const getCacheStats = useCallback(() => {
    return {
      size: cacheSize.current,
      keys: Object.keys(cacheRef.current),
      oldestTimestamp: Math.min(...Object.values(cacheRef.current).map(item => item.timestamp)),
      newestTimestamp: Math.max(...Object.values(cacheRef.current).map(item => item.timestamp)),
    }
  }, [])

  return {
    addToCache,
    getFromCache,
    clearCache,
    getCacheStats,
  }
} 