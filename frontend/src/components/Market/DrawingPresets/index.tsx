import React from 'react'
import { Space, Button, Tooltip, Popover } from 'antd'
import { SaveOutlined, ImportOutlined } from '@ant-design/icons'
import styles from './style.module.css'

interface Preset {
  id: string
  name: string
  style: any
}

interface DrawingPresetsProps {
  onApplyPreset: (style: any) => void
  onSavePreset: (style: any) => void
  currentStyle: any
}

const DrawingPresets: React.FC<DrawingPresetsProps> = ({
  onApplyPreset,
  onSavePreset,
  currentStyle,
}) => {
  const [presets, setPresets] = React.useState<Preset[]>(() => {
    const saved = localStorage.getItem('drawingPresets')
    return saved ? JSON.parse(saved) : []
  })

  const handleSavePreset = () => {
    const name = prompt('请输入预设名称')
    if (!name) return

    const newPreset = {
      id: Date.now().toString(),
      name,
      style: currentStyle,
    }
    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem('drawingPresets', JSON.stringify(updatedPresets))
  }

  const presetContent = (
    <div className={styles.presetList}>
      {presets.map(preset => (
        <div
          key={preset.id}
          className={styles.presetItem}
          onClick={() => onApplyPreset(preset.style)}
        >
          <span>{preset.name}</span>
          <div
            className={styles.presetColor}
            style={{ backgroundColor: preset.style.color }}
          />
        </div>
      ))}
      {presets.length === 0 && <div>暂无预设样式</div>}
    </div>
  )

  return (
    <Space>
      <Tooltip title="保存当前样式">
        <Button
          icon={<SaveOutlined />}
          onClick={handleSavePreset}
        />
      </Tooltip>
      <Popover
        content={presetContent}
        title="样式预设"
        trigger="click"
        placement="bottom"
      >
        <Button icon={<ImportOutlined />} />
      </Popover>
    </Space>
  )
}

export default DrawingPresets 