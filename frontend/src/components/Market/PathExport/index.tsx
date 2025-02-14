import React from 'react'
import { Card, Space, Button, Select, Input, Modal, Tabs, message } from 'antd'
import {
  ExportOutlined,
  CodeOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input

interface PathExportProps {
  points: any[]
}

const PathExport: React.FC<PathExportProps> = ({
  points,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [format, setFormat] = React.useState<'json' | 'css' | 'js'>('json')

  const getFormattedCode = () => {
    switch (format) {
      case 'json':
        return JSON.stringify(points, null, 2)
      case 'css':
        return `@keyframes customAnimation {
  ${points.map((p, i) => `
  ${Math.round((i / (points.length - 1)) * 100)}% {
    transform: translate(${p.x}px, ${p.y}px);
    animation-timing-function: ${p.easing};
  }`).join('')}
}`
      case 'js':
        return `const animationPath = {
  points: ${JSON.stringify(points, null, 2)},
  duration: ${points.reduce((sum, p) => sum + p.time, 0)},
  getPosition: (progress) => {
    // 计算当前点位置
    const index = Math.floor(progress * (points.length - 1))
    const nextIndex = Math.min(index + 1, points.length - 1)
    const pointProgress = (progress * (points.length - 1)) % 1
    
    const current = points[index]
    const next = points[nextIndex]
    
    return {
      x: current.x + (next.x - current.x) * pointProgress,
      y: current.y + (next.y - current.y) * pointProgress,
    }
  }
}`
    }
  }

  const handleCopy = () => {
    const code = getFormattedCode()
    navigator.clipboard.writeText(code)
    message.success('代码已复制')
  }

  const handleDownload = () => {
    const code = getFormattedCode()
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `animation-path.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('文件已下载')
  }

  return (
    <Card title="路径导出" className={styles.export}>
      <Space>
        <Select
          value={format}
          onChange={setFormat}
          style={{ width: 120 }}
        >
          <Option value="json">JSON</Option>
          <Option value="css">CSS</Option>
          <Option value="js">JavaScript</Option>
        </Select>
        <Button
          icon={<CodeOutlined />}
          onClick={() => setIsModalVisible(true)}
          disabled={!points.length}
        >
          查看代码
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={!points.length}
        >
          下载文件
        </Button>
      </Space>

      <Modal
        title="导出代码"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={handleCopy}
          >
            复制代码
          </Button>,
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            下载文件
          </Button>,
        ]}
        width={800}
      >
        <Tabs activeKey={format} onChange={key => setFormat(key as any)}>
          <TabPane tab="JSON" key="json">
            <TextArea
              value={getFormattedCode()}
              autoSize={{ minRows: 10, maxRows: 20 }}
              readOnly
            />
          </TabPane>
          <TabPane tab="CSS" key="css">
            <TextArea
              value={getFormattedCode()}
              autoSize={{ minRows: 10, maxRows: 20 }}
              readOnly
            />
          </TabPane>
          <TabPane tab="JavaScript" key="js">
            <TextArea
              value={getFormattedCode()}
              autoSize={{ minRows: 10, maxRows: 20 }}
              readOnly
            />
          </TabPane>
        </Tabs>
      </Modal>
    </Card>
  )
}

export default PathExport 