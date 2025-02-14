import React from 'react'
import { Card, Button, Slider, Space, Switch, Tooltip } from 'antd'
import { PathPoint } from '../types'
import { smoothPath } from '../utils/animation'
import styles from '../style.module.css'

interface PathOptimizerProps {
  points: PathPoint[]
  onPointsChange: (points: PathPoint[]) => void
}

export const PathOptimizer: React.FC<PathOptimizerProps> = ({
  points,
  onPointsChange,
}) => {
  const [smoothness, setSmoothness] = React.useState(0.5)
  const [autoOptimize, setAutoOptimize] = React.useState(false)

  const handleSmooth = () => {
    const smoothedPoints = smoothPath(points, smoothness)
    onPointsChange(smoothedPoints)
  }

  const handleSimplify = () => {
    // 实现路径简化算法
    const simplified = points.filter((_, index) => index % 2 === 0)
    onPointsChange(simplified)
  }

  React.useEffect(() => {
    if (autoOptimize && points.length > 2) {
      handleSmooth()
    }
  }, [points, autoOptimize])

  return (
    <Card title="路径优化" className={styles.optimizer}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <label>平滑度</label>
          <Slider
            value={smoothness}
            onChange={setSmoothness}
            min={0}
            max={1}
            step={0.1}
          />
        </div>

        <Space>
          <Tooltip title="平滑路径">
            <Button onClick={handleSmooth}>平滑</Button>
          </Tooltip>
          
          <Tooltip title="简化路径">
            <Button onClick={handleSimplify}>简化</Button>
          </Tooltip>
        </Space>

        <div>
          <Switch
            checked={autoOptimize}
            onChange={setAutoOptimize}
          />
          <span style={{ marginLeft: 8 }}>自动优化</span>
        </div>
      </Space>
    </Card>
  )
} 