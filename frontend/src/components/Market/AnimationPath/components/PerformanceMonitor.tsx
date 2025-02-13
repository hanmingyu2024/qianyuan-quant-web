import React from 'react'
import { Card, Statistic, Row, Col, Progress } from 'antd'
import { usePathPerformance } from '../hooks/usePathPerformance'
import styles from '../style.module.css'

interface PerformanceMetrics {
  fps: number
  renderTime: number
  memoryUsage: number
  pointCount: number
}

export const PerformanceMonitor: React.FC<{
  points: PathPoint[]
}> = ({ points }) => {
  const { getMetrics } = usePathPerformance()
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    pointCount: 0,
  })

  React.useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = getMetrics()
      const averageRenderTime = currentMetrics.renderTime.reduce((a, b) => a + b, 0) / currentMetrics.renderTime.length

      setMetrics({
        fps: 1000 / averageRenderTime,
        renderTime: averageRenderTime,
        memoryUsage: performance.memory?.usedJSHeapSize || 0,
        pointCount: points.length,
      })
    }

    const timer = setInterval(updateMetrics, 1000)
    return () => clearInterval(timer)
  }, [points, getMetrics])

  return (
    <Card title="性能监控" className={styles.performanceMonitor}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="FPS"
            value={metrics.fps.toFixed(1)}
            suffix="fps"
          />
          <Progress
            percent={Math.min(100, (metrics.fps / 60) * 100)}
            status={metrics.fps < 30 ? 'exception' : 'normal'}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="渲染时间"
            value={metrics.renderTime.toFixed(2)}
            suffix="ms"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="内存使用"
            value={(metrics.memoryUsage / 1024 / 1024).toFixed(1)}
            suffix="MB"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="点数量"
            value={metrics.pointCount}
          />
        </Col>
      </Row>
    </Card>
  )
}