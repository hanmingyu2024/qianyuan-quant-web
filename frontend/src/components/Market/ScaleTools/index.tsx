import React from 'react'
import { Space, Button, InputNumber, Tooltip } from 'antd'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface ScaleToolsProps {
  onScale: (x: number, y: number) => void
  onReset: () => void
  scaleX: number
  scaleY: number
  onScaleXChange: (value: number) => void
  onScaleYChange: (value: number) => void
}

const ScaleTools: React.FC<ScaleToolsProps> = ({
  onScale,
  onReset,
  scaleX,
  scaleY,
  onScaleXChange,
  onScaleYChange,
}) => {
  return (
    <div className={styles.tools}>
      <Space>
        <Tooltip title="放大">
          <Button
            icon={<ZoomInOutlined />}
            onClick={() => onScale(1.2, 1.2)}
          />
        </Tooltip>
        <Tooltip title="缩小">
          <Button
            icon={<ZoomOutOutlined />}
            onClick={() => onScale(0.8, 0.8)}
          />
        </Tooltip>
        <Tooltip title="重置">
          <Button
            icon={<CompressOutlined />}
            onClick={onReset}
          />
        </Tooltip>
        <span>X缩放:</span>
        <InputNumber
          value={scaleX}
          onChange={value => value && onScaleXChange(value)}
          min={0.1}
          max={10}
          step={0.1}
        />
        <span>Y缩放:</span>
        <InputNumber
          value={scaleY}
          onChange={value => value && onScaleYChange(value)}
          min={0.1}
          max={10}
          step={0.1}
        />
        <Tooltip title="交换XY缩放">
          <Button
            icon={<SwapOutlined />}
            onClick={() => onScale(scaleY, scaleX)}
          />
        </Tooltip>
      </Space>
    </div>
  )
}

export default ScaleTools 