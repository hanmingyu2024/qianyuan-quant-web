import React from 'react'
import { Modal, Radio, Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PathPoint } from '../types'

interface PathExportProps {
  visible: boolean
  onClose: () => void
  points: PathPoint[]
}

export const PathExport: React.FC<PathExportProps> = ({
  visible,
  onClose,
  points,
}) => {
  const [format, setFormat] = React.useState<'json' | 'svg'>('json')

  const handleExport = () => {
    try {
      let content: string
      let filename: string
      let type: string

      if (format === 'json') {
        content = JSON.stringify(points, null, 2)
        filename = 'animation-path.json'
        type = 'application/json'
      } else {
        // SVG 格式导出
        const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
        content = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
            <path d="${pathData}" fill="none" stroke="black" />
          </svg>
        `
        filename = 'animation-path.svg'
        type = 'image/svg+xml'
      }

      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      message.success('导出成功')
      onClose()
    } catch (error) {
      message.error('导出失败')
    }
  }

  return (
    <Modal
      title="导出路径"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          导出
        </Button>,
      ]}
    >
      <Radio.Group value={format} onChange={e => setFormat(e.target.value)}>
        <Radio.Button value="json">JSON</Radio.Button>
        <Radio.Button value="svg">SVG</Radio.Button>
      </Radio.Group>
    </Modal>
  )
}