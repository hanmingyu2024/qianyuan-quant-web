import React from 'react'
import { Space, Switch, InputNumber, Tooltip } from 'antd'
import { MagnetOutlined } from '@ant-design/icons'
import styles from './style.module.css'

interface SnapToolsProps {
  enabled: boolean
  onToggle: (checked: boolean) => void
  threshold: number
  onThresholdChange: (value: number) => void
}

const SnapTools: React.FC<SnapToolsProps> = ({
  enabled,
  onToggle,
  threshold,
  onThresholdChange,
}) => {
  return (
    <div className={styles.snapTools}>
      <Space>
        <Tooltip title="吸附功能">
          <Switch
            checkedChildren={<MagnetOutlined />}
            unCheckedChildren={<MagnetOutlined />}
            checked={enabled}
            onChange={onToggle}
          />
        </Tooltip>
        <span>吸附阈值:</span>
        <InputNumber
          min={1}
          max={20}
          value={threshold}
          onChange={value => value && onThresholdChange(value)}
          disabled={!enabled}
        />
      </Space>
    </div>
  )
}

export default SnapTools 