import React from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import { PathPoint } from '../types'
import { calculatePathLength } from '../utils/animation'

interface PathStatsProps {
  points: PathPoint[]
}

export const PathStats: React.FC<PathStatsProps> = ({ points }) => {
  const totalLength = React.useMemo(() => 
    calculatePathLength(points), [points]
  )

  const totalTime = React.useMemo(() => 
    points.length > 0 ? points[points.length - 1].time : 0, 
    [points]
  )

  const averageSpeed = React.useMemo(() => 
    totalTime > 0 ? totalLength / totalTime : 0,
    [totalLength, totalTime]
  )

  return (
    <Card title="路径统计">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="点数"
            value={points.length}
            suffix="个"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="总长度"
            value={totalLength.toFixed(2)}
            suffix="px"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="总时间"
            value={totalTime}
            suffix="ms"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="平均速度"
            value={averageSpeed.toFixed(2)}
            suffix="px/ms"
          />
        </Col>
      </Row>
    </Card>
  )
} 