import React from 'react'
import { Space, InputNumber, ColorPicker, Select, Button, Tooltip } from 'antd'
import { DeleteOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons'
import type { Color } from 'antd/es/color-picker'
import styles from './style.module.css'
import DrawingPresets from '../DrawingPresets'

const { Option } = Select

interface DrawingStylerProps {
  drawing: any
  onStyleChange: (style: any) => void
  onDelete: (id: string) => void
  onCopy: (drawing: any) => void
  onPaste: () => void
  canPaste: boolean
}

const DrawingStyler: React.FC<DrawingStylerProps> = ({
  drawing,
  onStyleChange,
  onDelete,
  onCopy,
  onPaste,
  canPaste,
}) => {
  if (!drawing) return null

  const handleColorChange = (color: Color) => {
    onStyleChange({ color: color.toRgbString() })
  }

  const handleLineWidthChange = (width: number | null) => {
    if (width) onStyleChange({ lineWidth: width })
  }

  const handleFontSizeChange = (size: number | null) => {
    if (size) onStyleChange({ fontSize: size })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onStyleChange({ text: e.target.value })
  }

  return (
    <div className={styles.styler}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <ColorPicker
            value={drawing.style?.color || '#ff4d4f'}
            onChange={handleColorChange}
          />
          {drawing.tool !== 'text' && (
            <InputNumber
              min={1}
              max={10}
              value={drawing.style?.lineWidth || 1}
              onChange={handleLineWidthChange}
              addonAfter="线宽"
            />
          )}
          {drawing.tool === 'text' && (
            <>
              <InputNumber
                min={12}
                max={48}
                value={drawing.style?.fontSize || 14}
                onChange={handleFontSizeChange}
                addonAfter="字号"
              />
              <textarea
                value={drawing.style?.text || ''}
                onChange={handleTextChange}
                className={styles.textArea}
                placeholder="输入文字"
              />
            </>
          )}
          <DrawingPresets
            currentStyle={drawing.style}
            onApplyPreset={onStyleChange}
            onSavePreset={style => {
              localStorage.setItem(
                'lastDrawingStyle',
                JSON.stringify(style)
              )
            }}
          />
          <Tooltip title="复制">
            <Button
              icon={<CopyOutlined />}
              onClick={() => onCopy(drawing)}
            />
          </Tooltip>
          <Tooltip title="粘贴">
            <Button
              icon={<SnippetsOutlined />}
              onClick={onPaste}
              disabled={!canPaste}
            />
          </Tooltip>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(drawing.id)}
          />
        </Space>
      </Space>
    </div>
  )
}

export default DrawingStyler 