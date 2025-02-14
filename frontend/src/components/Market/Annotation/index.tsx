import React from 'react'
import { Input, Space, Button, Tooltip } from 'antd'
import {
  PushpinOutlined,
  DeleteOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface AnnotationProps {
  drawing: any
  onUpdate: (updates: any) => void
  onDelete: () => void
}

const Annotation: React.FC<AnnotationProps> = ({
  drawing,
  onUpdate,
  onDelete,
}) => {
  const [note, setNote] = React.useState(drawing.annotation?.text || '')
  const [rotation, setRotation] = React.useState(drawing.rotation || 0)

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setNote(text)
    onUpdate({ annotation: { text } })
  }

  const handleRotate = (angle: number) => {
    const newRotation = (rotation + angle) % 360
    setRotation(newRotation)
    onUpdate({ rotation: newRotation })
  }

  return (
    <div className={styles.annotation}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Tooltip title="向左旋转">
            <Button
              icon={<RotateLeftOutlined />}
              onClick={() => handleRotate(-45)}
            />
          </Tooltip>
          <Tooltip title="向右旋转">
            <Button
              icon={<RotateRightOutlined />}
              onClick={() => handleRotate(45)}
            />
          </Tooltip>
          <span>旋转角度: {rotation}°</span>
        </Space>
        <Input.TextArea
          value={note}
          onChange={handleNoteChange}
          placeholder="添加标注..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          prefix={<PushpinOutlined />}
        />
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={onDelete}
        >
          删除标注
        </Button>
      </Space>
    </div>
  )
}

export default Annotation 