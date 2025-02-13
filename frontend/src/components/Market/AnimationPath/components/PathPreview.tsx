import React, { useRef, useEffect } from 'react'
import { usePathAnimation } from '../hooks/usePathAnimation'
import { usePathConstraints } from '../hooks/usePathConstraints'
import { PathPoint } from '../types'
import styles from './PathPreview.module.css'

interface PathPreviewProps {
  points: PathPoint[]
  width?: number
  height?: number
  showGrid?: boolean
  showGuides?: boolean
}

export const PathPreview: React.FC<PathPreviewProps> = ({
  points,
  width = 400,
  height = 400,
  showGrid = true,
  showGuides = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { currentPoint } = usePathAnimation(points, {
    duration: 5000,
    loop: true,
    autoPlay: true,
  })

  const { guidePoints, updateGuidePoints } = usePathConstraints()

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制网格
    if (showGrid) {
      ctx.strokeStyle = '#eee'
      ctx.lineWidth = 1
      
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    // 绘制参考线
    if (showGuides && guidePoints.length > 0) {
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.3)'
      ctx.lineWidth = 1
      
      guidePoints.forEach(guide => {
        if (guide.type === 'horizontal') {
          ctx.beginPath()
          ctx.moveTo(0, guide.y)
          ctx.lineTo(width, guide.y)
          ctx.stroke()
        } else if (guide.type === 'vertical') {
          ctx.beginPath()
          ctx.moveTo(guide.x, 0)
          ctx.lineTo(guide.x, height)
          ctx.stroke()
        }
      })
    }

    // 绘制路径
    if (points.length > 1) {
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      
      ctx.stroke()
    }

    // 绘制点
    points.forEach((point, index) => {
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // 绘制点的序号
      ctx.fillStyle = '#666'
      ctx.font = '12px Arial'
      ctx.fillText(String(index + 1), point.x + 8, point.y - 8)
    })

    // 绘制当前动画点
    if (currentPoint) {
      ctx.fillStyle = '#f00'
      ctx.beginPath()
      ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2)
      ctx.fill()
    }

  }, [points, currentPoint, width, height, showGrid, showGuides, guidePoints])

  // 更新参考点
  useEffect(() => {
    updateGuidePoints(points)
  }, [points, updateGuidePoints])

  return (
    <div className={styles.previewContainer}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.previewCanvas}
      />
    </div>
  )
}
