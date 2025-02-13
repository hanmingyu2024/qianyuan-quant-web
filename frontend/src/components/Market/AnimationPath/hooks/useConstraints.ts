import { useState, useCallback } from 'react'
import { PathPoint } from '../types'

interface Constraints {
  minDistance: number
  maxDistance: number
  angleSnap: number
  boundingBox: {
    enabled: boolean
    x: number
    y: number
    width: number
    height: number
  }
}

export const useConstraints = () => {
  const [constraints, setConstraints] = useState<Constraints>({
    minDistance: 10,
    maxDistance: 500,
    angleSnap: 15,
    boundingBox: {
      enabled: false,
      x: 0,
      y: 0,
      width: 1000,
      height: 1000,
    },
  })

  const applyConstraints = useCallback((point: PathPoint, prevPoint?: PathPoint) => {
    let { x, y } = point

    // 应用边界框约束
    if (constraints.boundingBox.enabled) {
      x = Math.max(constraints.boundingBox.x, Math.min(x, constraints.boundingBox.x + constraints.boundingBox.width))
      y = Math.max(constraints.boundingBox.y, Math.min(y, constraints.boundingBox.y + constraints.boundingBox.height))
    }

    // 应用距离约束
    if (prevPoint) {
      const dx = x - prevPoint.x
      const dy = y - prevPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < constraints.minDistance) {
        const scale = constraints.minDistance / distance
        x = prevPoint.x + dx * scale
        y = prevPoint.y + dy * scale
      } else if (distance > constraints.maxDistance) {
        const scale = constraints.maxDistance / distance
        x = prevPoint.x + dx * scale
        y = prevPoint.y + dy * scale
      }
    }

    return { ...point, x, y }
  }, [constraints])

  return {
    constraints,
    setConstraints,
    applyConstraints,
  }
} 