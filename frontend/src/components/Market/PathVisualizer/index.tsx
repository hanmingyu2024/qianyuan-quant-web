import React from 'react'
import { Card } from 'antd'
import ReactECharts from 'echarts-for-react'
import { interpolatePath } from '@/utils/pathInterpolation'
import styles from './style.module.css'

interface PathPoint {
  id: string
  x: number
  y: number
  time: number
  easing: string
}

interface PathVisualizerProps {
  points: PathPoint[]
  selectedDrawing: any
  onPointDrag?: (id: string, x: number, y: number) => void
  previewPosition?: [number, number] | null
}

const PathVisualizer: React.FC<PathVisualizerProps> = ({
  points,
  selectedDrawing,
  onPointDrag,
  previewPosition,
}) => {
  const option = {
    animation: false,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '4%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: true },
      splitLine: { show: true },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true },
      splitLine: { show: true },
    },
    series: [
      {
        type: 'line',
        data: interpolatePath(points, 50).map(p => [p.x, p.y]),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#1890ff',
          width: 2,
          opacity: 0.5,
        },
      },
      {
        type: 'scatter',
        data: points.map(p => [p.x, p.y]),
        symbolSize: 10,
        itemStyle: {
          color: '#1890ff',
        },
        draggable: true,
        ondrag: function(this: any, params: any) {
          if (onPointDrag) {
            onPointDrag(points[params.dataIndex].id, params.target.x, params.target.y)
          }
        },
      },
      {
        type: 'scatter',
        data: selectedDrawing.points,
        symbolSize: 12,
        itemStyle: {
          color: '#ff4d4f',
        },
      },
      previewPosition && {
        type: 'scatter',
        data: [previewPosition],
        symbolSize: 15,
        itemStyle: {
          color: '#52c41a',
        },
        symbol: 'pin',
      },
    ].filter(Boolean),
  }

  return (
    <Card title="路径预览" className={styles.visualizer}>
      <ReactECharts
        option={option}
        style={{ height: '300px' }}
      />
    </Card>
  )
}

export default PathVisualizer 