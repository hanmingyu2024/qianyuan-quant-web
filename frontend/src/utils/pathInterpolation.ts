interface PathPoint {
  id: string
  x: number
  y: number
  time: number
  easing: string
}

interface InterpolatedPoint {
  x: number
  y: number
  time: number
}

const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  elastic: (t: number) => {
    const p = 0.3
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1
  },
  bounce: (t: number) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },
  back: (t: number) => {
    const s = 1.70158
    return t * t * ((s + 1) * t - s)
  },
  sine: (t: number) => 1 - Math.cos(t * Math.PI / 2),
}

export const interpolatePath = (points: PathPoint[], steps: number): InterpolatedPoint[] => {
  if (points.length < 2) return points.map(p => ({ x: p.x, y: p.y, time: p.time }))

  const result: InterpolatedPoint[] = []
  const totalTime = points.reduce((sum, p) => sum + p.time, 0)
  const stepTime = totalTime / steps

  for (let i = 0; i < steps; i++) {
    const currentTime = i * stepTime
    let accumulatedTime = 0
    let segmentIndex = 0

    // Find the current segment
    while (segmentIndex < points.length - 1 && 
           accumulatedTime + points[segmentIndex].time < currentTime) {
      accumulatedTime += points[segmentIndex].time
      segmentIndex++
    }

    const p1 = points[segmentIndex]
    const p2 = points[segmentIndex + 1]
    const segmentProgress = (currentTime - accumulatedTime) / p1.time
    const t = easingFunctions[p1.easing as keyof typeof easingFunctions](segmentProgress)

    result.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
      time: currentTime,
    })
  }

  return result
} 