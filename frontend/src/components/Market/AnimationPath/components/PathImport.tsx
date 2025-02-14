import React from 'react'
import { Modal, Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { PathPoint } from '../types'

const { Dragger } = Upload

interface PathImportProps {
  visible: boolean
  onClose: () => void
  onImport: (points: PathPoint[]) => void
}

export const PathImport: React.FC<PathImportProps> = ({
  visible,
  onClose,
  onImport,
}) => {
  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      const points = JSON.parse(text)
      
      // 验证导入的数据
      if (!Array.isArray(points)) {
        throw new Error('无效的数据格式')
      }
      
      points.forEach(point => {
        if (
          typeof point.x !== 'number' ||
          typeof point.y !== 'number' ||
          typeof point.time !== 'number' ||
          !point.id ||
          !point.easing
        ) {
          throw new Error('无效的点数据')
        }
      })

      onImport(points)
      message.success('导入成功')
      onClose()
    } catch (error) {
      message.error('导入失败：' + (error as Error).message)
    }
  }

  return (
    <Modal
      title="导入路径"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Dragger
        accept=".json"
        beforeUpload={(file) => {
          handleImport(file)
          return false
        }}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          点击或拖拽文件到此区域
        </p>
        <p className="ant-upload-hint">
          支持导入 JSON 格式的路径数据
        </p>
      </Dragger>
    </Modal>
  )
}