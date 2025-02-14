import React from 'react'
import { PathPoint } from '../types'
import styles from '../style.module.css'

interface PathGuidesProps {
  points: PathPoint[]
  selectedPoint: PathPoint | null
  visible: boolean
}

export const PathGuides: React.FC<PathGuidesProps> = ({
  points,
  selectedPoint,
  visible,
}) => {
  if (!visible || !selectedPoint) return null

  const guides = []
  
  // 垂直对齐线
  points.forEach(point => {
    if (point.id === selectedPoint.id) return
    
    if (Math.abs(point.x - selectedPoint.x) < 5) {
      guides.push(
        <line
          key={`v-${point.id}`}
          x1={point.x}
          y1={0}
          x2={point.x}
          y2="100%"
          className={styles.guideLine}
        />
      )
    }
  })

  // 水平对齐线
  points.forEach(point => {
    if (point.id === selectedPoint.id) return
    
    if (Math.abs(point.y - selectedPoint.y) < 5) {
      guides.push(
        <line
          key={`h-${point.id}`}
          x1={0}
          y1={point.y}
          x2="100%"
          y2={point.y}
          className={styles.guideLine}
        />
      )
    }
  })

  return (
    <svg
      width="100%"
      height="100%"
      className={styles.guides}
      style={{ pointerEvents: 'none' }}
    >
      {guides}
    </svg>
  )
}