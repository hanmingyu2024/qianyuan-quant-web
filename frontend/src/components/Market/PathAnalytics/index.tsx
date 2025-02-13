import React from 'react'
import { Card, Space, Row, Col, Statistic, Progress, List, Tag } from 'antd'
import {
  LineChartOutlined,
  FieldTimeOutlined,
  NodeIndexOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { interpolatePath } from '@/utils/pathInterpolation'
import styles from './style.module.css'

interface PathAnalyticsProps {
  points: any[]
}

const PathAnalytics: React.FC<PathAnalyticsProps> = ({
  points,
}) => {
  const getPathStats = () => {
    if (!points.length) return null

    const totalDistance = points.reduce((sum, point, i) => {
      if (i === 0) return 0
      const prev = points[i - 1]
      const dx = point.x - prev.x
      const dy = point.y - prev.y
      return sum + Math.sqrt(dx * dx + dy * dy)
    }, 0)

    const totalTime = points.reduce((sum, p) => sum + p.time, 0)
    const avgSpeed = totalDistance / totalTime

    const easings = points.map(p => p.easing)
    const uniqueEasings = new Set(easings)

    return {
      totalDistance: Math.round(totalDistance),
      totalTime,
      avgSpeed: Math.round(avgSpeed * 100) / 100,
      pointCount: points.length,
      easingCount: uniqueEasings.size,
    }
  }

  const getSpeedChart = () => {
    const interpolated = interpolatePath(points, 100)
    const speeds = interpolated.map((point, i) => {
      if (i === 0) return 0
      const prev = interpolated[i - 1]
      const dx = point.x - prev.x
      const dy = point.y - prev.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance / point.time
    })

    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '4%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: speeds.map((_, i) => i),
        name: '时间点',
      },
      yAxis: {
        type: 'value',
        name: '速度',
      },
      series: [
        {
          data: speeds,
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3,
          },
        },
      ],
    }
  }

  const stats = getPathStats()

  return (
    <Card title="路径分析" className={styles.analytics}>
      {stats && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="总路程"
                value={stats.totalDistance}
                prefix={<LineChartOutlined />}
                suffix="px"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="总时间"
                value={stats.totalTime}
                prefix={<FieldTimeOutlined />}
                suffix="s"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="平均速度"
                value={stats.avgSpeed}
                prefix={<DashboardOutlined />}
                suffix="px/s"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="点数分布" size="small">
                <Progress
                  type="circle"
                  percent={Math.min(stats.pointCount * 10, 100)}
                  format={() => `${stats.pointCount}个点`}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="缓动函数" size="small">
                <Progress
                  type="circle"
                  percent={Math.min(stats.easingCount * 20, 100)}
                  format={() => `${stats.easingCount}种`}
                />
              </Card>
            </Col>
          </Row>

          <Card title="速度变化" size="small">
            <ReactECharts
              option={getSpeedChart()}
              style={{ height: '200px' }}
            />
          </Card>

          <List
            size="small"
            header="路径特征"
            dataSource={[
              { label: '复杂度', value: stats.pointCount > 10 ? '高' : '低' },
              { label: '平滑度', value: stats.easingCount > 2 ? '变化多' : '平滑' },
              { label: '速度特征', value: stats.avgSpeed > 100 ? '快速' : '平缓' },
            ]}
            renderItem={item => (
              <List.Item>
                <Space>
                  <span>{item.label}:</span>
                  <Tag color={
                    item.value === '高' || item.value === '变化多' || item.value === '快速'
                      ? 'orange'
                      : 'green'
                  }>
                    {item.value}
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
        </Space>
      )}
    </Card>
  )
}

export default PathAnalytics 