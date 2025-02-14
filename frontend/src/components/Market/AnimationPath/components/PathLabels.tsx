import React from 'react'
import { Tooltip } from 'antd'
import { PathPoint } from '../types'
import styles from '../style.module.css'

interface PathLabelsProps {
  points: PathPoint[]
  visible: boolean
}

export const PathLabels: React.FC<PathLabelsProps> = ({
  points,
  visible,
}) => {
  if (!visible) return null

  return (
    <div className={styles.labels}>
      {points.map((point, index) => (
        <Tooltip
          key={point.id}
          title={`点 ${index + 1}
x: ${point.x.toFixed(0)}
y: ${point.y.toFixed(0)}
时间: ${point.time}ms
缓动: ${point.easing}`}
        >
          <div
            className={styles.label}
            style={{
              left: point.x,
              top: point.y,
            }}
          >
            {index + 1}
          </div>
        </Tooltip>
      ))}
    </div>
  )
} 