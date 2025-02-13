import React from 'react'
import { Card, List, Button, Space, Tooltip } from 'antd'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface LayerManagerProps {
  drawings: any[]
  onDrawingsChange: (drawings: any[]) => void
  onSelect: (drawing: any) => void
  selectedDrawing: any | null
}

const LayerManager: React.FC<LayerManagerProps> = ({
  drawings,
  onDrawingsChange,
  onSelect,
  selectedDrawing,
}) => {
  const handleToggleVisibility = (id: string) => {
    const updatedDrawings = drawings.map(d => {
      if (d.id === id) {
        return { ...d, visible: !d.visible }
      }
      return d
    })
    onDrawingsChange(updatedDrawings)
  }

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= drawings.length) return

    const updatedDrawings = [...drawings]
    const [removed] = updatedDrawings.splice(index, 1)
    updatedDrawings.splice(newIndex, 0, removed)
    onDrawingsChange(updatedDrawings)
  }

  const handleDelete = (id: string) => {
    onDrawingsChange(drawings.filter(d => d.id !== id))
  }

  return (
    <Card title="图层管理" className={styles.card}>
      <List
        dataSource={drawings}
        renderItem={(drawing, index) => (
          <List.Item
            className={`${styles.layerItem} ${
              selectedDrawing?.id === drawing.id ? styles.selected : ''
            }`}
            onClick={() => onSelect(drawing)}
          >
            <div className={styles.layerInfo}>
              <span>{drawing.tool}</span>
              <Space>
                <Tooltip title={drawing.visible ? '隐藏' : '显示'}>
                  <Button
                    type="text"
                    icon={drawing.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(drawing.id)
                    }}
                  />
                </Tooltip>
                <Tooltip title="上移">
                  <Button
                    type="text"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveLayer(index, 'up')
                    }}
                  />
                </Tooltip>
                <Tooltip title="下移">
                  <Button
                    type="text"
                    icon={<ArrowDownOutlined />}
                    disabled={index === drawings.length - 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveLayer(index, 'down')
                    }}
                  />
                </Tooltip>
                <Tooltip title="删除">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(drawing.id)
                    }}
                  />
                </Tooltip>
              </Space>
            </div>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default LayerManager 