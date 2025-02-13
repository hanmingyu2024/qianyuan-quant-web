import React from 'react'
import { Card, Space, Button, Slider, Tooltip } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
} from '@ant-design/icons'
import { interpolatePath } from '@/utils/pathInterpolation'
import styles from './style.module.css'

interface PathPreviewProps {
  points: any[]
  selectedDrawing: any
  onPositionChange: (position: [number, number]) => void
}

const PathPreview: React.FC<PathPreviewProps> = ({
  points,
  selectedDrawing,
  onPositionChange,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [previewTimer, setPreviewTimer] = React.useState<number | null>(null)
  const interpolatedPoints = React.useMemo(() => interpolatePath(points, 100), [points])

  const handlePlayPause = () => {
    if (isPlaying) {
      if (previewTimer) {
        cancelAnimationFrame(previewTimer)
        setPreviewTimer(null)
      }
    } else {
      const startTime = Date.now() - progress * getTotalDuration()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const totalDuration = getTotalDuration()
        const newProgress = Math.min(elapsed / totalDuration, 1)
        
        setProgress(newProgress)
        updatePosition(newProgress)
        
        if (newProgress < 1) {
          setPreviewTimer(requestAnimationFrame(animate))
        } else {
          setIsPlaying(false)
          setPreviewTimer(null)
        }
      }
      animate()
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    if (previewTimer) {
      cancelAnimationFrame(previewTimer)
      setPreviewTimer(null)
    }
    setIsPlaying(false)
    setProgress(0)
    updatePosition(0)
  }

  const handleStep = (forward: boolean) => {
    const step = 0.05
    const newProgress = Math.max(0, Math.min(1, progress + (forward ? step : -step)))
    setProgress(newProgress)
    updatePosition(newProgress)
  }

  const getTotalDuration = () => {
    return points.reduce((sum, p) => sum + p.time * 1000, 0)
  }

  const updatePosition = (progress: number) => {
    const index = Math.min(
      Math.floor(progress * interpolatedPoints.length),
      interpolatedPoints.length - 1
    )
    const point = interpolatedPoints[index]
    onPositionChange([point.x, point.y])
  }

  return (
    <Card title="路径预览" className={styles.preview}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Tooltip title={isPlaying ? '暂停' : '播放'}>
            <Button
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              disabled={!points.length}
            />
          </Tooltip>
          <Tooltip title="重置">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={!points.length}
            />
          </Tooltip>
          <Tooltip title="后退">
            <Button
              icon={<StepBackwardOutlined />}
              onClick={() => handleStep(false)}
              disabled={!points.length || progress <= 0}
            />
          </Tooltip>
          <Tooltip title="前进">
            <Button
              icon={<StepForwardOutlined />}
              onClick={() => handleStep(true)}
              disabled={!points.length || progress >= 1}
            />
          </Tooltip>
        </Space>

        <Slider
          value={progress * 100}
          onChange={value => {
            const newProgress = value / 100
            setProgress(newProgress)
            updatePosition(newProgress)
          }}
          disabled={!points.length}
          tooltipVisible={false}
        />
      </Space>
    </Card>
  )
}

export default PathPreview 