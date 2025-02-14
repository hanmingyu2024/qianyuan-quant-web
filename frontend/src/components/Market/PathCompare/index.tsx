import React from 'react'
import { Card, Space, Button, Select, Divider, List, Tag, Tooltip } from 'antd'
import {
  CompareOutlined,
  SwapOutlined,
  MergeCellsOutlined,
  DiffOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { interpolatePath } from '@/utils/pathInterpolation'
import styles from './style.module.css'

const { Option } = Select

interface PathVersion {
  id: string
  name: string
  timestamp: number
  points: any[]
  author: string
}

interface PathCompareProps {
  currentPoints: any[]
  onApply: (points: any[]) => void
}

const PathCompare: React.FC<PathCompareProps> = ({
  currentPoints,
  onApply,
}) => {
  const [versions, setVersions] = React.useState<PathVersion[]>([])
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([])
  const [differences, setDifferences] = React.useState<any[]>([])

  React.useEffect(() => {
    // 模拟历史版本
    const mockVersions: PathVersion[] = [
      {
        id: '1',
        name: '初始版本',
        timestamp: Date.now() - 86400000 * 3,
        points: currentPoints.map(p => ({ ...p, x: p.x * 0.8, y: p.y * 0.8 })),
        author: '用户A',
      },
      {
        id: '2',
        name: '优化版本',
        timestamp: Date.now() - 86400000 * 2,
        points: currentPoints.map(p => ({ ...p, time: p.time * 1.2 })),
        author: '用户B',
      },
    ]
    setVersions(mockVersions)
  }, [currentPoints])

  const compareVersions = () => {
    if (selectedVersions.length !== 2) return

    const version1 = versions.find(v => v.id === selectedVersions[0])
    const version2 = versions.find(v => v.id === selectedVersions[1])
    if (!version1 || !version2) return

    const diffs = []
    const maxPoints = Math.max(version1.points.length, version2.points.length)

    for (let i = 0; i < maxPoints; i++) {
      const point1 = version1.points[i]
      const point2 = version2.points[i]

      if (!point1 || !point2) {
        diffs.push({
          type: !point1 ? '新增点' : '删除点',
          index: i + 1,
          point: !point1 ? point2 : point1,
        })
        continue
      }

      if (
        point1.x !== point2.x ||
        point1.y !== point2.y ||
        point1.time !== point2.time ||
        point1.easing !== point2.easing
      ) {
        diffs.push({
          type: '修改点',
          index: i + 1,
          from: point1,
          to: point2,
        })
      }
    }

    setDifferences(diffs)
  }

  const getCompareOption = () => {
    if (selectedVersions.length !== 2) return {}

    const version1 = versions.find(v => v.id === selectedVersions[0])
    const version2 = versions.find(v => v.id === selectedVersions[1])
    if (!version1 || !version2) return {}

    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '4%',
        containLabel: true,
      },
      legend: {
        data: [version1.name, version2.name],
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
          name: version1.name,
          type: 'line',
          data: interpolatePath(version1.points, 50).map(p => [p.x, p.y]),
          smooth: true,
          lineStyle: { color: '#1890ff' },
        },
        {
          name: version2.name,
          type: 'line',
          data: interpolatePath(version2.points, 50).map(p => [p.x, p.y]),
          smooth: true,
          lineStyle: { color: '#52c41a' },
        },
      ],
    }
  }

  return (
    <Card title="路径对比" className={styles.compare}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Select
            mode="multiple"
            placeholder="选择要对比的版本"
            value={selectedVersions}
            onChange={setSelectedVersions}
            style={{ width: 300 }}
            maxTagCount={2}
          >
            {versions.map(version => (
              <Option key={version.id} value={version.id}>
                {version.name} ({new Date(version.timestamp).toLocaleDateString()})
              </Option>
            ))}
          </Select>
          <Button
            icon={<CompareOutlined />}
            onClick={compareVersions}
            disabled={selectedVersions.length !== 2}
          >
            对比
          </Button>
          <Button
            icon={<SwapOutlined />}
            onClick={() => setSelectedVersions([...selectedVersions].reverse())}
            disabled={selectedVersions.length !== 2}
          >
            交换
          </Button>
        </Space>

        {selectedVersions.length === 2 && (
          <>
            <ReactECharts
              option={getCompareOption()}
              style={{ height: '300px' }}
            />

            <Divider>差异对比</Divider>

            <List
              className={styles.diffList}
              dataSource={differences}
              renderItem={diff => (
                <List.Item
                  className={styles.diffItem}
                  actions={[
                    diff.type === '修改点' && (
                      <Button
                        key="apply"
                        size="small"
                        onClick={() => onApply([diff.to])}
                      >
                        应用更改
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={
                          diff.type === '新增点' ? 'green' :
                          diff.type === '删除点' ? 'red' : 'blue'
                        }>
                          {diff.type}
                        </Tag>
                        <span>点 {diff.index}</span>
                      </Space>
                    }
                    description={
                      diff.type === '修改点' ? (
                        <Space direction="vertical">
                          <div>从: x={diff.from.x}, y={diff.from.y}, time={diff.from.time}</div>
                          <div>到: x={diff.to.x}, y={diff.to.y}, time={diff.to.time}</div>
                        </Space>
                      ) : (
                        <div>x={diff.point.x}, y={diff.point.y}, time={diff.point.time}</div>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Space>
    </Card>
  )
}

export default PathCompare 