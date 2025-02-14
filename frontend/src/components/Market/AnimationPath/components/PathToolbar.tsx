import React from 'react'
import { Button, Space, Tooltip, Divider } from 'antd'
import {
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  CopyOutlined,
  ScissorOutlined,
} from '@ant-design/icons'
import styles from '../style.module.css'

interface PathToolbarProps {
  onSave?: () => void
  onExport?: () => void
  onImport?: () => void
  onClear?: () => void
  onPreview?: () => void
  onSettings?: () => void
  onCopy?: () => void
  onCut?: () => void
  disabled?: boolean
}

export const PathToolbar: React.FC<PathToolbarProps> = ({
  onSave,
  onExport,
  onImport,
  onClear,
  onPreview,
  onSettings,
  onCopy,
  onCut,
  disabled = false,
}) => {
  return (
    <div className={styles.toolbar}>
      <Space split={<Divider type="vertical" />}>
        <Space>
          {onSave && (
            <Tooltip title="保存">
              <Button
                icon={<SaveOutlined />}
                onClick={onSave}
                disabled={disabled}
              />
            </Tooltip>
          )}

          {onExport && (
            <Tooltip title="导出">
              <Button
                icon={<DownloadOutlined />}
                onClick={onExport}
                disabled={disabled}
              />
            </Tooltip>
          )}

          {onImport && (
            <Tooltip title="导入">
              <Button
                icon={<UploadOutlined />}
                onClick={onImport}
                disabled={disabled}
              />
            </Tooltip>
          )}
        </Space>

        <Space>
          {onCopy && (
            <Tooltip title="复制">
              <Button
                icon={<CopyOutlined />}
                onClick={onCopy}
                disabled={disabled}
              />
            </Tooltip>
          )}

          {onCut && (
            <Tooltip title="剪切">
              <Button
                icon={<ScissorOutlined />}
                onClick={onCut}
                disabled={disabled}
              />
            </Tooltip>
          )}

          {onClear && (
            <Tooltip title="清空">
              <Button
                icon={<DeleteOutlined />}
                onClick={onClear}
                disabled={disabled}
              />
            </Tooltip>
          )}
        </Space>

        <Space>
          {onPreview && (
            <Tooltip title="预览">
              <Button
                icon={<EyeOutlined />}
                onClick={onPreview}
                disabled={disabled}
              />
            </Tooltip>
          )}

          {onSettings && (
            <Tooltip title="设置">
              <Button
                icon={<SettingOutlined />}
                onClick={onSettings}
                disabled={disabled}
              />
            </Tooltip>
          )}
        </Space>
      </Space>
    </div>
  )
} 