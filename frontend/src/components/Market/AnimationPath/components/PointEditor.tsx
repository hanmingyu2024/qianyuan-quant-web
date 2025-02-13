import React from 'react'
import { Space, InputNumber, Select, Button, Tooltip } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { PathPoint } from '../types'
import styles from '../style.module.css'

const { Option } = Select

interface PointEditorProps {
  point: PathPoint
  index: number
  isEditing: boolean
  onUpdate: (id: string, updates: Partial<PathPoint>) => void
  onDelete: (id: string) => void
}

const PointEditor: React.FC<PointEditorProps> = React.memo(({
  point,
  index,
  isEditing,
  onUpdate,
  onDelete,
}) => (
  <div className={styles.point}>
    <Space>
      <span>点 {index + 1}:</span>
      <InputNumber
        value={point.x}
        onChange={value => value && onUpdate(point.id, { x: value })}
        disabled={!isEditing}
        addonBefore="X"
      />
      <InputNumber
        value={point.y}
        onChange={value => value && onUpdate(point.id, { y: value })}
        disabled={!isEditing}
        addonBefore="Y"
      />
      <InputNumber
        value={point.time}
        onChange={value => value && onUpdate(point.id, { time: value })}
        disabled={!isEditing}
        addonBefore="时间"
        min={0.1}
        step={0.1}
      />
      <Select
        value={point.easing}
        onChange={value => onUpdate(point.id, { easing: value })}
        disabled={!isEditing}
        style={{ width: 120 }}
      >
        <Option value="linear">线性</Option>
        <Option value="easeInOut">缓入缓出</Option>
        <Option value="bounce">弹跳</Option>
      </Select>
      <Tooltip title="删除">
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => onDelete(point.id)}
          disabled={!isEditing}
        />
      </Tooltip>
    </Space>
  </div>
))

PointEditor.displayName = 'PointEditor'

export default PointEditor 