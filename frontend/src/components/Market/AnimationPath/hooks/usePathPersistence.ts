import { useCallback } from 'react'
import { PathPoint } from '../types'

interface StorageConfig {
  key: string
  version: string
  compress?: boolean
}

export const usePathPersistence = (config: StorageConfig) => {
  const savePath = useCallback(async (points: PathPoint[]) => {
    try {
      const data = {
        version: config.version,
        timestamp: Date.now(),
        points: config.compress ? compressPoints(points) : points,
      }
      
      localStorage.setItem(config.key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save path:', error)
      return false
    }
  }, [config])

  const loadPath = useCallback(() => {
    try {
      const data = localStorage.getItem(config.key)
      if (!data) return null

      const parsed = JSON.parse(data)
      if (parsed.version !== config.version) {
        console.warn('Path version mismatch')
        return null
      }

      return config.compress ? decompressPoints(parsed.points) : parsed.points
    } catch (error) {
      console.error('Failed to load path:', error)
      return null
    }
  }, [config])

  const clearSavedPath = useCallback(() => {
    try {
      localStorage.removeItem(config.key)
      return true
    } catch (error) {
      console.error('Failed to clear path:', error)
      return false
    }
  }, [config])

  return {
    savePath,
    loadPath,
    clearSavedPath,
  }
}

// 辅助函数：压缩点数据
function compressPoints(points: PathPoint[]): any {
  return points.map(p => [
    p.id,
    Math.round(p.x * 100) / 100,
    Math.round(p.y * 100) / 100,
    Math.round(p.time * 100) / 100,
    p.easing,
  ])
}

// 辅助函数：解压点数据
function decompressPoints(compressed: any[]): PathPoint[] {
  return compressed.map(p => ({
    id: p[0],
    x: p[1],
    y: p[2],
    time: p[3],
    easing: p[4],
  }))
} 