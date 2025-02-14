import React, { useRef, useEffect } from 'react'
import { usePathEvents } from '../hooks/usePathEvents'
import { usePathGestures } from '../hooks/usePathGestures'
import { usePathConstraints } from '../hooks/usePathConstraints'
import { PathPoint } from '../types'
import styles from './PathEditor.module.css'

interface PathEditorProps {
  points: PathPoint[]
  onPointsChange: (points: PathPoint[]) => void
  editable?: boolean
  width?: number
  height?: number
}

export const PathEditor: React.FC<PathEditorProps> = ({
  points,
  onPointsChange,
  editable = true,
  width = 400,
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedPointRef = useRef<string | null>(null)
  const { applyConstraints } = usePathConstraints()

  // 事件处理
  const pathEvents = usePathEvents({
    onPointAdd: (point) => {
      onPointsChange([...points, point])
    },
    onPointUpdate: (id, updates) => {
      onPointsChange(points.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ))
    },
    onPointDelete: (id) => {
      onPointsChange(points.filter(p => p.id !== id))
    },
    onPointSelect: (id) => {
      selectedPointRef.current = id
    },
  })

  // 手势处理
  const { attachGestureHandlers } = usePathGestures({
    onPan: (deltaX, deltaY) => {
      if (selectedPointRef.current && editable) {
        const point = points.find(p => p.id === selectedPointRef.current)
        if (point) {
          const updatedPoint = applyConstraints({
            ...point,
            x: point.x + deltaX,
            y: point.y + deltaY,
          }, points)
          
          pathEvents.handlePointUpdate(point.id, {
            x: updatedPoint.x,
            y: updatedPoint.y,
          })
        }
      }
    },
    onDoubleTap: (x, y) => {
      if (editable) {
        const newPoint: PathPoint = {
          id: `point-${Date.now()}`,
          x,
          y,
          time: points.length > 0 ? points[points.length - 1].time + 1000 : 0,
          easing: 'linear',
        }
        pathEvents.handlePointAdd(applyConstraints(newPoint, points))
      }
    },
  })

  // 键盘事件处理
  useEffect(() => {
    if (!editable) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPointRef.current) {
        const point = points.find(p => p.id === selectedPointRef.current)
        if (!point) return

        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            pathEvents.handlePointDelete(point.id)
            selectedPointRef.current = null
            break
          case 'ArrowLeft':
            pathEvents.handlePointUpdate(point.id, { x: point.x - 1 })
            e.preventDefault()
            break
          case 'ArrowRight':
            pathEvents.handlePointUpdate(point.id, { x: point.x + 1 })
            e.preventDefault()
            break
          case 'ArrowUp':
            pathEvents.handlePointUpdate(point.id, { y: point.y - 1 })
            e.preventDefault()
            break
          case 'ArrowDown':
            pathEvents.handlePointUpdate(point.id, { y: point.y + 1 })
            e.preventDefault()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editable, points, pathEvents])

  // 附加手势处理器
  useEffect(() => {
    if (containerRef.current) {
      return attachGestureHandlers(containerRef.current)
    }
  }, [attachGestureHandlers])

  return (
    <div 
      ref={containerRef}
      className={styles.editorContainer}
      style={{ width, height }}
    >
      <svg width={width} height={height} className={styles.editorSvg}>
        {/* 绘制路径线条 */}
        {points.length > 1 && (
          <path
            d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
            className={styles.pathLine}
          />
        )}
        
        {/* 绘制控制点 */}
        {points.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              className={`${styles.controlPoint} ${
                selectedPointRef.current === point.id ? styles.selected : ''
              }`}
              onClick={() => pathEvents.handlePointSelect(point.id)}
            />
            <text
              x={point.x + 10}
              y={point.y - 10}
              className={styles.pointLabel}
            >
              {points.indexOf(point) + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}