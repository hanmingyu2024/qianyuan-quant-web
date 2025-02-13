import {
  validatePoint,
  validatePath,
  getDistance,
  createPathError,
} from '../utils'
import {
  generateCSSKeyframes,
  generateSVGPath,
  generateJSAnimation,
  generateReactComponent,
  exportToJSON,
} from '../utils/export'
import {
  calculatePathLength,
  getPointAtProgress,
  smoothPath,
  getPathBounds,
} from '../utils/animation'
import { PathPoint } from '../types'

const testPoints: PathPoint[] = [
  { id: '1', x: 0, y: 0, time: 0, easing: 'linear' },
  { id: '2', x: 100, y: 100, time: 1000, easing: 'easeInOut' },
]

describe('Path Utilities', () => {
  describe('Validation', () => {
    it('validates points correctly', () => {
      expect(() => validatePoint(testPoints[0])).not.toThrow()
      expect(() => validatePoint({ ...testPoints[0], x: NaN })).toThrow()
    })

    it('validates paths correctly', () => {
      const errors = validatePath(testPoints)
      expect(errors).toHaveLength(0)
    })
  })

  describe('Math Utils', () => {
    it('calculates distance correctly', () => {
      const distance = getDistance(testPoints[0], testPoints[1])
      expect(distance).toBe(Math.sqrt(20000)) // sqrt(100^2 + 100^2)
    })

    it('calculates path length correctly', () => {
      const length = calculatePathLength(testPoints)
      expect(length).toBe(Math.sqrt(20000))
    })
  })

  describe('Export Utils', () => {
    it('generates CSS keyframes correctly', () => {
      const css = generateCSSKeyframes(testPoints)
      expect(css).toContain('@keyframes')
      expect(css).toContain('transform: translate')
    })

    it('generates SVG path correctly', () => {
      const svg = generateSVGPath(testPoints)
      expect(svg).toBe('M 0 0 L 100 100')
    })

    it('generates JS animation correctly', () => {
      const js = generateJSAnimation(testPoints)
      expect(js).toContain('function animate')
      expect(js).toContain('requestAnimationFrame')
    })

    it('generates React component correctly', () => {
      const react = generateReactComponent(testPoints)
      expect(react).toContain('export const PathAnimation')
      expect(react).toContain('useEffect')
    })

    it('exports to JSON correctly', () => {
      const json = exportToJSON(testPoints)
      const parsed = JSON.parse(json)
      expect(parsed.points).toHaveLength(2)
      expect(parsed.version).toBe('1.0.0')
    })
  })

  describe('Animation Utils', () => {
    it('gets point at progress correctly', () => {
      const point = getPointAtProgress(testPoints, 0.5)
      expect(point.x).toBe(50)
      expect(point.y).toBe(50)
    })

    it('smooths path correctly', () => {
      const smoothed = smoothPath(testPoints)
      expect(smoothed).toHaveLength(testPoints.length)
    })

    it('calculates bounds correctly', () => {
      const bounds = getPathBounds(testPoints)
      expect(bounds.minX).toBe(0)
      expect(bounds.maxX).toBe(100)
      expect(bounds.width).toBe(100)
      expect(bounds.height).toBe(100)
    })
  })
}) 