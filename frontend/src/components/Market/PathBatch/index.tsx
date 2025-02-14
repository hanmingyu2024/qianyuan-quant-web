import React from 'react'
import { Card, Space, Button, InputNumber, Select, Checkbox, message } from 'antd'
import {
  ScissorOutlined,
  MergeCellsOutlined,
  SwapOutlined,
  ExpandOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select

interface PathBatchProps {
  points: any[]
  onPointsUpdate: (points: any[]) => void
}

const PathBatch: React.FC<PathBatchProps> = ({
  points,
  onPointsUpdate,
}) => {
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [selectedPoints, setSelectedPoints] = React.useState<string[]>([])
  const [operation, setOperation] = React.useState<'scale' | 'rotate' | 'mirror'>('scale')

  const handleBatchOperation = () => {
    if (!selectedPoints.length) {
      message.warning('请选择要操作的点')
      return
    }

    const newPoints = points.map(point => {
      if (!selectedPoints.includes(point.id)) return point

      switch (operation) {
        case 'scale':
          return {
            ...point,
            x: point.x * scale,
            y: point.y * scale,
          }
        case 'rotate': {
          const rad = (rotation * Math.PI) / 180
          const cos = Math.cos(rad)
          const sin = Math.sin(rad)
          const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
          const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length
          
          const dx = point.x - centerX
          const dy = point.y - centerY
          
          return {
            ...point,
            x: centerX + (dx * cos - dy * sin),
            y: centerY + (dx * sin + dy * cos),
          }
        }
        case 'mirror':
          return {
            ...point,
            x: -point.x,
            y: point.y,
          }
        default:
          return point
      }
    })

    onPointsUpdate(newPoints)
    message.success('批量操作完成')
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPoints(points.map(p => p.id))
    } else {
      setSelectedPoints([])
    }
  }

  const handlePointSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPoints(prev => [...prev, id])
    } else {
      setSelectedPoints(prev => prev.filter(p => p !== id))
    }
  }

  return (
    <Card title="批量操作" className={styles.batch}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Select
            value={operation}
            onChange={setOperation}
            style={{ width: 120 }}
          >
            <Option value="scale">缩放</Option>
            <Option value="rotate">旋转</Option>
            <Option value="mirror">镜像</Option>
          </Select>

          {operation === 'scale' && (
            <InputNumber
              value={scale}
              onChange={value => value && setScale(value)}
              min={0.1}
              max={10}
              step={0.1}
              addonAfter="倍"
            />
          )}

          {operation === 'rotate' && (
            <InputNumber
              value={rotation}
              onChange={value => value && setRotation(value)}
              min={-360}
              max={360}
              step={15}
              addonAfter="度"
            />
          )}

          <Button
            icon={<ExpandOutlined />}
            onClick={handleBatchOperation}
            disabled={!selectedPoints.length}
            type="primary"
          >
            应用
          </Button>
        </Space>

        <div className={styles.pointList}>
          <Checkbox
            onChange={e => handleSelectAll(e.target.checked)}
            indeterminate={selectedPoints.length > 0 && selectedPoints.length < points.length}
            checked={selectedPoints.length === points.length}
          >
            全选
          </Checkbox>

          <Space wrap>
            {points.map((point, index) => (
              <Checkbox
                key={point.id}
                checked={selectedPoints.includes(point.id)}
                onChange={e => handlePointSelect(point.id, e.target.checked)}
              >
                点 {index + 1}
              </Checkbox>
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

export default PathBatch 