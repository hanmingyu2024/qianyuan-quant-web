import React from 'react'
import { Space, Button, InputNumber, Tooltip } from 'antd'
import {
  RetweetOutlined,
  VerticalAlignMiddleOutlined,
  BorderOutlined,
  TableOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface TransformToolsProps {
  onSkew: (x: number, y: number) => void
  onFlip: (direction: 'horizontal' | 'vertical') => void
  onGridToggle: () => void
  gridEnabled: boolean
  gridSize: number
  onGridSizeChange: (size: number) => void
  skewX: number
  skewY: number
  onSkewXChange: (value: number) => void
  onSkewYChange: (value: number) => void
}

const TransformTools: React.FC<TransformToolsProps> = ({
  onSkew,
  onFlip,
  onGridToggle,
  gridEnabled,
  gridSize,
  onGridSizeChange,
  skewX,
  skewY,
  onSkewXChange,
  onSkewYChange,
}) => {
  return (
    <div className={styles.tools}>
      <Space>
        <span>X倾斜:</span>
        <InputNumber
          value={skewX}
          onChange={value => value !== null && onSkewXChange(value)}
          min={-89}
          max={89}
          formatter={value => `${value}°`}
        />
        <span>Y倾斜:</span>
        <InputNumber
          value={skewY}
          onChange={value => value !== null && onSkewYChange(value)}
          min={-89}
          max={89}
          formatter={value => `${value}°`}
        />
        <Tooltip title="水平翻转">
          <Button
            icon={<RetweetOutlined rotate={90} />}
            onClick={() => onFlip('horizontal')}
          />
        </Tooltip>
        <Tooltip title="垂直翻转">
          <Button
            icon={<RetweetOutlined />}
            onClick={() => onFlip('vertical')}
          />
        </Tooltip>
        <Tooltip title="网格">
          <Button
            icon={<TableOutlined />}
            type={gridEnabled ? 'primary' : 'default'}
            onClick={onGridToggle}
          />
        </Tooltip>
        <span>网格大小:</span>
        <InputNumber
          value={gridSize}
          onChange={value => value && onGridSizeChange(value)}
          min={5}
          max={100}
          step={5}
          disabled={!gridEnabled}
        />
      </Space>
    </div>
  )
}

export default TransformTools 