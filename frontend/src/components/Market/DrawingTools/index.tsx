import React from 'react'
import { Space, Button, Tooltip, Dropdown } from 'antd'
import {
  LineOutlined,
  DashOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  FontSizeOutlined,
  EditOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface DrawingToolsProps {
  onToolSelect: (tool: string) => void
  onClear: () => void
  onThemeChange: (theme: 'light' | 'dark') => void
  onEditMode: () => void
  currentTool: string
  theme: 'light' | 'dark'
  isEditMode: boolean
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  onToolSelect,
  onClear,
  onThemeChange,
  onEditMode,
  currentTool,
  theme,
  isEditMode,
}) => {
  const tools = [
    { key: 'line', icon: <LineOutlined />, title: '直线' },
    { key: 'horizontalLine', icon: <DashOutlined rotate={90} />, title: '水平线' },
    { key: 'verticalLine', icon: <DashOutlined />, title: '垂直线' },
    { key: 'arrow', icon: <ArrowUpOutlined />, title: '箭头' },
    { key: 'rectangle', icon: <BorderOutlined />, title: '矩形' },
    { key: 'circle', icon: <RadiusSettingOutlined />, title: '圆形' },
    { key: 'text', icon: <FontSizeOutlined />, title: '文字' },
  ]

  const themeItems = [
    { key: 'light', label: '浅色主题' },
    { key: 'dark', label: '深色主题' },
  ]

  return (
    <div className={styles.tools}>
      <Space>
        {tools.map(tool => (
          <Tooltip key={tool.key} title={tool.title}>
            <Button
              icon={tool.icon}
              type={currentTool === tool.key ? 'primary' : 'default'}
              onClick={() => onToolSelect(tool.key)}
            />
          </Tooltip>
        ))}
        <Tooltip title="编辑模式">
          <Button
            icon={<EditOutlined />}
            type={isEditMode ? 'primary' : 'default'}
            onClick={onEditMode}
          />
        </Tooltip>
        <Tooltip title="清除所有">
          <Button icon={<DeleteOutlined />} onClick={onClear} />
        </Tooltip>
        <Dropdown
          menu={{
            items: themeItems,
            onClick: ({ key }) => onThemeChange(key as 'light' | 'dark'),
          }}
          placement="bottomRight"
        >
          <Button icon={<BgColorsOutlined />} />
        </Dropdown>
      </Space>
    </div>
  )
}

export default DrawingTools 