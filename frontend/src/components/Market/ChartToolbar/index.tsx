import React from 'react'
import { Space, Button, Select, Tooltip } from 'antd'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select

interface ChartToolbarProps {
  onTimeframeChange: (timeframe: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFullscreen: () => void
  timeframe: string
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  onTimeframeChange,
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  timeframe,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className={styles.toolbar}>
      <Space>
        <Select value={timeframe} onChange={onTimeframeChange} style={{ width: 100 }}>
          <Option value="1m">1分钟</Option>
          <Option value="5m">5分钟</Option>
          <Option value="15m">15分钟</Option>
          <Option value="1h">1小时</Option>
          <Option value="4h">4小时</Option>
          <Option value="1d">日线</Option>
          <Option value="1w">周线</Option>
        </Select>
        <Tooltip title="放大">
          <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
        </Tooltip>
        <Tooltip title="缩小">
          <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
        </Tooltip>
        <Tooltip title="重置">
          <Button icon={<ReloadOutlined />} onClick={onReset} />
        </Tooltip>
        <Tooltip title="全屏">
          <Button icon={<FullscreenOutlined />} onClick={onFullscreen} />
        </Tooltip>
        <Tooltip title="撤销">
          <Button
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
          />
        </Tooltip>
        <Tooltip title="重做">
          <Button
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
          />
        </Tooltip>
      </Space>
    </div>
  )
}

export default ChartToolbar 