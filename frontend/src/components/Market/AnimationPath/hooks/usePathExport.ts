import { useCallback } from 'react'
import { PathPoint } from '../types'

interface ExportOptions {
  format: 'json' | 'svg' | 'css' | 'js'
  pretty?: boolean
  includeMetadata?: boolean
}

export const usePathExport = () => {
  const generateSVGPath = useCallback((points: PathPoint[]) => {
    if (points.length < 2) return ''
    
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    return path
  }, [])

  const generateCSSKeyframes = useCallback((points: PathPoint[]) => {
    const totalDuration = points.reduce((sum, p) => sum + p.time, 0)
    let css = '@keyframes pathAnimation {\n'
    
    points.forEach((point, index) => {
      const progress = points
        .slice(0, index)
        .reduce((sum, p) => sum + p.time, 0) / totalDuration * 100
      
      css += `  ${progress.toFixed(2)}% {\n`
      css += `    transform: translate(${point.x}px, ${point.y}px);\n`
      css += `    animation-timing-function: ${point.easing};\n`
      css += '  }\n'
    })
    
    css += '}'
    return css
  }, [])

  const generateJSCode = useCallback((points: PathPoint[]) => {
    return `
const path = {
  points: ${JSON.stringify(points, null, 2)},
  duration: ${points.reduce((sum, p) => sum + p.time, 0)},
  getPointAtTime: (time) => {
    // 实现插值计算
    const totalTime = path.duration
    const progress = time / totalTime
    // ...
  }
}`
  }, [])

  const exportPath = useCallback((points: PathPoint[], options: ExportOptions) => {
    const metadata = options.includeMetadata ? {
      version: '1.0.0',
      timestamp: Date.now(),
      pointCount: points.length,
      totalDuration: points.reduce((sum, p) => sum + p.time, 0),
    } : null

    switch (options.format) {
      case 'json':
        return JSON.stringify(
          { points, ...(metadata && { metadata }) },
          null,
          options.pretty ? 2 : 0
        )
      case 'svg':
        return `<path d="${generateSVGPath(points)}" />`
      case 'css':
        return generateCSSKeyframes(points)
      case 'js':
        return generateJSCode(points)
      default:
        throw new Error(`Unsupported format: ${options.format}`)
    }
  }, [generateSVGPath, generateCSSKeyframes, generateJSCode])

  const downloadPath = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  return {
    exportPath,
    downloadPath,
    generateSVGPath,
    generateCSSKeyframes,
    generateJSCode,
  }
} 