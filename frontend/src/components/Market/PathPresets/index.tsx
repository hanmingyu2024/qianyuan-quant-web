import React from 'react'
import { Space, Button, Select, InputNumber, Card } from 'antd'
import {
  BorderOuterOutlined,
  FieldTimeOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select

interface PathPreset {
  id: string
  name: string
  generator: (params: any) => any[]
}

interface PathPresetsProps {
  onApplyPreset: (points: any[]) => void
  selectedDrawing: any
}

const PathPresets: React.FC<PathPresetsProps> = ({
  onApplyPreset,
  selectedDrawing,
}) => {
  const [radius, setRadius] = React.useState(100)
  const [cycles, setCycles] = React.useState(2)
  const [points, setPoints] = React.useState(8)

  const presets: PathPreset[] = [
    {
      id: 'circle',
      name: '圆形路径',
      generator: ({ radius, points }) => {
        const center = selectedDrawing.points[0]
        return Array.from({ length: points }).map((_, i) => {
          const angle = (i / points) * Math.PI * 2
          return {
            id: `point-${i}`,
            x: center[0] + Math.cos(angle) * radius,
            y: center[1] + Math.sin(angle) * radius,
            time: 1,
            easing: 'easeInOut',
          }
        })
      },
    },
    {
      id: 'spiral',
      name: '螺旋路径',
      generator: ({ radius, cycles, points }) => {
        const center = selectedDrawing.points[0]
        return Array.from({ length: points }).map((_, i) => {
          const angle = (i / points) * Math.PI * 2 * cycles
          const r = (radius * i) / points
          return {
            id: `point-${i}`,
            x: center[0] + Math.cos(angle) * r,
            y: center[1] + Math.sin(angle) * r,
            time: 1,
            easing: 'easeInOut',
          }
        })
      },
    },
    {
      id: 'wave',
      name: '波浪路径',
      generator: ({ radius, cycles, points }) => {
        const start = selectedDrawing.points[0]
        return Array.from({ length: points }).map((_, i) => {
          const x = start[0] + (i / (points - 1)) * radius * 2
          const y = start[1] + Math.sin((i / points) * Math.PI * 2 * cycles) * radius
          return {
            id: `point-${i}`,
            x,
            y,
            time: 1,
            easing: 'easeInOut',
          }
        })
      },
    },
  ]

  const handleApplyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    const generatedPoints = preset.generator({
      radius,
      cycles,
      points,
    })
    onApplyPreset(generatedPoints)
  }

  return (
    <Card title="路径预设" className={styles.presets}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <span>半径:</span>
          <InputNumber
            value={radius}
            onChange={value => value && setRadius(value)}
            min={10}
            max={500}
          />
          <span>周期:</span>
          <InputNumber
            value={cycles}
            onChange={value => value && setCycles(value)}
            min={1}
            max={10}
          />
          <span>点数:</span>
          <InputNumber
            value={points}
            onChange={value => value && setPoints(value)}
            min={4}
            max={50}
          />
        </Space>

        <Space>
          {presets.map(preset => (
            <Button
              key={preset.id}
              icon={<BorderOuterOutlined />}
              onClick={() => handleApplyPreset(preset.id)}
            >
              {preset.name}
            </Button>
          ))}
        </Space>
      </Space>
    </Card>
  )
}

export default PathPresets 