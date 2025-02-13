import React from 'react'
import styles from '../style.module.css'

interface PathGridProps {
  width: number
  height: number
  gridSize: number
  visible: boolean
}

export const PathGrid: React.FC<PathGridProps> = ({
  width,
  height,
  gridSize,
  visible,
}) => {
  if (!visible) return null

  const lines = []
  
  // 垂直线
  for (let x = gridSize; x < width; x += gridSize) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        className={styles.gridLine}
      />
    )
  }

  // 水平线
  for (let y = gridSize; y < height; y += gridSize) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        className={styles.gridLine}
      />
    )
  }

  return (
    <svg
      width={width}
      height={height}
      className={styles.grid}
    >
      {lines}
    </svg>
  )
}