import { useCallback, useState, useEffect } from 'react'
import { PathPoint } from '../types'

interface Rule {
  id: string
  type: 'distance' | 'angle' | 'speed' | 'area' | 'custom'
  params: Record<string, number>
  enabled: boolean
  priority: number
}

interface RuleViolation {
  ruleId: string
  pointIds: string[]
  message: string
  severity: 'warning' | 'error'
}

export const usePathRules = () => {
  const [rules, setRules] = useState<Rule[]>([])
  const [violations, setViolations] = useState<RuleViolation[]>([])

  const defaultRules: Rule[] = [
    {
      id: 'min-distance',
      type: 'distance',
      params: { minDistance: 20 },
      enabled: true,
      priority: 1,
    },
    {
      id: 'max-angle',
      type: 'angle',
      params: { maxAngle: 120 },
      enabled: true,
      priority: 2,
    },
    {
      id: 'speed-limit',
      type: 'speed',
      params: { maxSpeed: 100, minSpeed: 10 },
      enabled: true,
      priority: 3,
    },
  ]

  const validatePoints = useCallback((points: PathPoint[]) => {
    const newViolations: RuleViolation[] = []

    rules.filter(r => r.enabled).forEach(rule => {
      switch (rule.type) {
        case 'distance':
          checkDistanceRule(points, rule, newViolations)
          break
        case 'angle':
          checkAngleRule(points, rule, newViolations)
          break
        case 'speed':
          checkSpeedRule(points, rule, newViolations)
          break
        case 'area':
          checkAreaRule(points, rule, newViolations)
          break
      }
    })

    setViolations(newViolations)
    return newViolations.length === 0
  }, [rules])

  const enforceRules = useCallback((points: PathPoint[]): PathPoint[] => {
    let modifiedPoints = [...points]

    rules.filter(r => r.enabled)
         .sort((a, b) => b.priority - a.priority)
         .forEach(rule => {
           switch (rule.type) {
             case 'distance':
               modifiedPoints = enforceDistanceRule(modifiedPoints, rule)
               break
             case 'angle':
               modifiedPoints = enforceAngleRule(modifiedPoints, rule)
               break
             case 'speed':
               modifiedPoints = enforceSpeedRule(modifiedPoints, rule)
               break
             case 'area':
               modifiedPoints = enforceAreaRule(modifiedPoints, rule)
               break
           }
         })

    return modifiedPoints
  }, [rules])

  const addRule = useCallback((rule: Rule) => {
    setRules(prev => [...prev, rule])
  }, [])

  const removeRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId))
  }, [])

  const updateRule = useCallback((ruleId: string, updates: Partial<Rule>) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, ...updates } : r
    ))
  }, [])

  const toggleRule = useCallback((ruleId: string) => {
    setRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ))
  }, [])

  // 在组件挂载时初始化默认规则
  useEffect(() => {
    setRules(defaultRules)
  }, [])

  return {
    rules,
    violations,
    validatePoints,
    enforceRules,
    addRule,
    removeRule,
    updateRule,
    toggleRule,
  }
}

// 辅助函数：规则检查和执行
function checkDistanceRule(points: PathPoint[], rule: Rule, violations: RuleViolation[]) {
  const { minDistance } = rule.params
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    if (distance < minDistance) {
      violations.push({
        ruleId: rule.id,
        pointIds: [p1.id, p2.id],
        message: `点${i + 1}和点${i + 2}之间的距离小于最小距离`,
        severity: 'error',
      })
    }
  }
}

function enforceDistanceRule(points: PathPoint[], rule: Rule): PathPoint[] {
  const { minDistance } = rule.params
  const result = [...points]
  
  for (let i = 0; i < result.length - 1; i++) {
    const p1 = result[i]
    const p2 = result[i + 1]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < minDistance) {
      const scale = minDistance / distance
      result[i + 1] = {
        ...p2,
        x: p1.x + dx * scale,
        y: p1.y + dy * scale,
      }
    }
  }
  
  return result
}

function checkAngleRule(points: PathPoint[], rule: Rule, violations: RuleViolation[]) {
  const { maxAngle } = rule.params
  
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]
    const p3 = points[i + 1]
    
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
    let angleDiff = Math.abs((angle2 - angle1) * 180 / Math.PI)
    
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff
    }
    
    if (angleDiff > maxAngle) {
      violations.push({
        ruleId: rule.id,
        pointIds: [p1.id, p2.id, p3.id],
        message: `点${i}处的转角(${angleDiff.toFixed(1)}°)超过最大限制(${maxAngle}°)`,
        severity: 'warning',
      })
    }
  }
}

function enforceAngleRule(points: PathPoint[], rule: Rule): PathPoint[] {
  const { maxAngle } = rule.params
  const result = [...points]
  
  for (let i = 1; i < result.length - 1; i++) {
    const p1 = result[i - 1]
    const p2 = result[i]
    const p3 = result[i + 1]
    
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
    let angleDiff = Math.abs((angle2 - angle1) * 180 / Math.PI)
    
    if (angleDiff > 180) {
      angleDiff = 360 - angleDiff
    }
    
    if (angleDiff > maxAngle) {
      // 计算新的位置以满足角度限制
      const targetAngle = angle1 + (maxAngle * Math.PI / 180) * Math.sign(angle2 - angle1)
      const distance = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2))
      
      result[i + 1] = {
        ...p3,
        x: p2.x + distance * Math.cos(targetAngle),
        y: p2.y + distance * Math.sin(targetAngle),
      }
    }
  }
  
  return result
}

function checkSpeedRule(points: PathPoint[], rule: Rule, violations: RuleViolation[]) {
  const { maxSpeed, minSpeed } = rule.params
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    const speed = distance / p2.time
    
    if (speed > maxSpeed) {
      violations.push({
        ruleId: rule.id,
        pointIds: [p1.id, p2.id],
        message: `点${i + 1}到点${i + 2}的速度(${speed.toFixed(1)})超过最大限制(${maxSpeed})`,
        severity: 'error',
      })
    }
    
    if (speed < minSpeed) {
      violations.push({
        ruleId: rule.id,
        pointIds: [p1.id, p2.id],
        message: `点${i + 1}到点${i + 2}的速度(${speed.toFixed(1)})低于最小限制(${minSpeed})`,
        severity: 'warning',
      })
    }
  }
}

function enforceSpeedRule(points: PathPoint[], rule: Rule): PathPoint[] {
  const { maxSpeed, minSpeed } = rule.params
  const result = [...points]
  
  for (let i = 0; i < result.length - 1; i++) {
    const p1 = result[i]
    const p2 = result[i + 1]
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    const speed = distance / p2.time
    
    if (speed > maxSpeed) {
      // 调整时间以满足最大速度限制
      result[i + 1] = {
        ...p2,
        time: distance / maxSpeed,
      }
    } else if (speed < minSpeed) {
      // 调整时间以满足最小速度限制
      result[i + 1] = {
        ...p2,
        time: distance / minSpeed,
      }
    }
  }
  
  return result
}

function checkAreaRule(points: PathPoint[], rule: Rule, violations: RuleViolation[]) {
  const { minX = 0, maxX = 1000, minY = 0, maxY = 1000 } = rule.params
  
  points.forEach((point, index) => {
    if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
      violations.push({
        ruleId: rule.id,
        pointIds: [point.id],
        message: `点${index + 1}超出允许区域范围`,
        severity: 'error',
      })
    }
  })
}

function enforceAreaRule(points: PathPoint[], rule: Rule): PathPoint[] {
  const { minX = 0, maxX = 1000, minY = 0, maxY = 1000 } = rule.params
  
  return points.map(point => ({
    ...point,
    x: Math.max(minX, Math.min(maxX, point.x)),
    y: Math.max(minY, Math.min(maxY, point.y)),
  }))
} 