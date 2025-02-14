import { useCallback } from 'react'
import { PathPoint } from '../types'

interface InterpolationConfig {
  method: 'linear' | 'bezier' | 'catmullRom' | 'bSpline' | 'hermite'
  tension?: number
  resolution?: number
  preserveTiming?: boolean
}

export const usePathInterpolation = () => {
  const interpolatePath = useCallback((
    points: PathPoint[], 
    config: InterpolationConfig & { method: 'linear' | 'bezier' | 'catmullRom' | 'bSpline' | 'hermite' }
  ): PathPoint[] => {
    if (points.length < 2) return points
    
    switch (config.method) {
      case 'bezier':
        return interpolateBezier(points, config)
      case 'catmullRom':
        return interpolateCatmullRom(points, config)
      case 'bSpline':
        return interpolateBSpline(points, config)
      case 'hermite':
        return interpolateHermite(points, config)
      case 'linear':
      default:
        return interpolateLinear(points, config)
    }
  }, [])

  return { interpolatePath }
}

function interpolateLinear(points: PathPoint[], config: InterpolationConfig): PathPoint[] {
  const resolution = config.resolution || 10
  const result: PathPoint[] = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    
    for (let j = 0; j <= resolution; j++) {
      const t = j / resolution
      const newPoint: PathPoint = {
        id: `interpolated-${i}-${j}`,
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
        time: config.preserveTiming ? 
          p1.time + (p2.time - p1.time) * t : 
          p2.time / resolution,
        easing: p1.easing,
      }
      
      if (j < resolution || i === points.length - 2) {
        result.push(newPoint)
      }
    }
  }
  
  return result
}

function interpolateBezier(points: PathPoint[], config: InterpolationConfig): PathPoint[] {
  const resolution = config.resolution || 10
  const result: PathPoint[] = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    
    // 计算控制点
    let cp1x, cp1y, cp2x, cp2y
    if (i === 0) {
      // 第一段
      cp1x = p1.x + (p2.x - p1.x) / 3
      cp1y = p1.y + (p2.y - p1.y) / 3
      cp2x = p1.x + 2 * (p2.x - p1.x) / 3
      cp2y = p1.y + 2 * (p2.y - p1.y) / 3
    } else if (i === points.length - 2) {
      // 最后一段
      cp1x = p1.x + (p2.x - points[i - 1].x) / 3
      cp1y = p1.y + (p2.y - points[i - 1].y) / 3
      cp2x = p2.x - (p2.x - p1.x) / 3
      cp2y = p2.y - (p2.y - p1.y) / 3
    } else {
      // 中间段
      const prev = points[i - 1]
      const next = points[i + 2]
      cp1x = p1.x + (p2.x - prev.x) / 3
      cp1y = p1.y + (p2.y - prev.y) / 3
      cp2x = p2.x - (next.x - p1.x) / 3
      cp2y = p2.y - (next.y - p1.y) / 3
    }
    
    // 生成贝塞尔曲线点
    for (let j = 0; j <= resolution; j++) {
      const t = j / resolution
      const newPoint: PathPoint = {
        id: `bezier-${i}-${j}`,
        x: cubicBezier(p1.x, cp1x, cp2x, p2.x, t),
        y: cubicBezier(p1.y, cp1y, cp2y, p2.y, t),
        time: config.preserveTiming ? 
          p1.time + (p2.time - p1.time) * t : 
          p2.time / resolution,
        easing: p1.easing,
      }
      
      if (j < resolution || i === points.length - 2) {
        result.push(newPoint)
      }
    }
  }
  
  return result
}

function interpolateCatmullRom(points: PathPoint[], config: InterpolationConfig): PathPoint[] {
  const tension = config.tension || 0.5
  const resolution = config.resolution || 10
  const result: PathPoint[] = []
  
  // 添加虚拟端点以处理边界条件
  const extendedPoints = [
    { ...points[0], x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y },
    ...points,
    { ...points[points.length - 1], 
      x: 2 * points[points.length - 1].x - points[points.length - 2].x,
      y: 2 * points[points.length - 1].y - points[points.length - 2].y },
  ]
  
  for (let i = 1; i < extendedPoints.length - 2; i++) {
    const p0 = extendedPoints[i - 1]
    const p1 = extendedPoints[i]
    const p2 = extendedPoints[i + 1]
    const p3 = extendedPoints[i + 2]
    
    for (let j = 0; j <= resolution; j++) {
      const t = j / resolution
      const newPoint: PathPoint = {
        id: `catmull-${i}-${j}`,
        x: catmullRom(p0.x, p1.x, p2.x, p3.x, t, tension),
        y: catmullRom(p0.y, p1.y, p2.y, p3.y, t, tension),
        time: config.preserveTiming ? 
          p1.time + (p2.time - p1.time) * t : 
          p2.time / resolution,
        easing: p1.easing,
      }
      
      if (j < resolution || i === extendedPoints.length - 3) {
        result.push(newPoint)
      }
    }
  }
  
  return result
}

function interpolateBSpline(points: PathPoint[], config: InterpolationConfig): PathPoint[] {
  if (points.length < 4) return points
  
  const resolution = config.resolution || 10
  const result: PathPoint[] = []
  const degree = 3 // 三次B样条
  
  // 计算节点向量
  const n = points.length - 1
  const m = n + degree + 1
  const knots: number[] = []
  
  for (let i = 0; i <= m; i++) {
    if (i < degree) knots[i] = 0
    else if (i <= n) knots[i] = i - degree
    else knots[i] = n - degree + 1
  }
  
  // 生成B样条曲线点
  for (let i = degree; i <= n; i++) {
    for (let j = 0; j <= resolution; j++) {
      const t = knots[i] + (j / resolution) * (knots[i + 1] - knots[i])
      const newPoint: PathPoint = {
        id: `bspline-${i}-${j}`,
        x: bsplinePoint(points.map(p => p.x), degree, t, knots),
        y: bsplinePoint(points.map(p => p.y), degree, t, knots),
        time: config.preserveTiming ?
          points[i].time * (j / resolution) :
          points[i].time / resolution,
        easing: points[i].easing,
      }
      
      if (j < resolution || i === n) {
        result.push(newPoint)
      }
    }
  }
  
  return result
}

// B样条基函数
function bsplineBasis(i: number, k: number, t: number, knots: number[]): number {
  if (k === 0) {
    return t >= knots[i] && t < knots[i + 1] ? 1 : 0
  }
  
  const d1 = knots[i + k] - knots[i]
  const d2 = knots[i + k + 1] - knots[i + 1]
  
  let c1 = 0
  let c2 = 0
  
  if (d1 > 0) {
    c1 = ((t - knots[i]) / d1) * bsplineBasis(i, k - 1, t, knots)
  }
  if (d2 > 0) {
    c2 = ((knots[i + k + 1] - t) / d2) * bsplineBasis(i + 1, k - 1, t, knots)
  }
  
  return c1 + c2
}

// 计算B样条曲线上的点
function bsplinePoint(coords: number[], degree: number, t: number, knots: number[]): number {
  let result = 0
  
  for (let i = 0; i < coords.length; i++) {
    result += coords[i] * bsplineBasis(i, degree, t, knots)
  }
  
  return result
}

// 添加新的插值方法：Hermite插值
function interpolateHermite(points: PathPoint[], config: InterpolationConfig): PathPoint[] {
  const resolution = config.resolution || 10
  const tension = config.tension || 0.5
  const result: PathPoint[] = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    
    // 计算切线
    const m1 = getTangent(points, i, tension)
    const m2 = getTangent(points, i + 1, tension)
    
    for (let j = 0; j <= resolution; j++) {
      const t = j / resolution
      const h1 = 2 * t * t * t - 3 * t * t + 1
      const h2 = -2 * t * t * t + 3 * t * t
      const h3 = t * t * t - 2 * t * t + t
      const h4 = t * t * t - t * t
      
      const newPoint: PathPoint = {
        id: `hermite-${i}-${j}`,
        x: h1 * p1.x + h2 * p2.x + h3 * m1.x + h4 * m2.x,
        y: h1 * p1.y + h2 * p2.y + h3 * m1.y + h4 * m2.y,
        time: config.preserveTiming ? 
          p1.time + (p2.time - p1.time) * t : 
          p2.time / resolution,
        easing: p1.easing,
      }
      
      if (j < resolution || i === points.length - 2) {
        result.push(newPoint)
      }
    }
  }
  
  return result
}

// 计算切线
function getTangent(points: PathPoint[], index: number, tension: number): { x: number; y: number } {
  if (points.length < 2) return { x: 0, y: 0 }
  
  if (index === 0) {
    return {
      x: tension * (points[1].x - points[0].x),
      y: tension * (points[1].y - points[0].y),
    }
  }
  
  if (index === points.length - 1) {
    return {
      x: tension * (points[index].x - points[index - 1].x),
      y: tension * (points[index].y - points[index - 1].y),
    }
  }
  
  return {
    x: tension * (points[index + 1].x - points[index - 1].x) / 2,
    y: tension * (points[index + 1].y - points[index - 1].y) / 2,
  }
}

// 辅助函数
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t
  return mt * mt * mt * p0 + 
         3 * mt * mt * t * p1 + 
         3 * mt * t * t * p2 + 
         t * t * t * p3
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number, tension: number): number {
  const t2 = t * t
  const t3 = t2 * t
  
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  ) * tension
} 