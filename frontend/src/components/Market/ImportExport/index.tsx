import React from 'react'
import { Space, Button, Upload, message } from 'antd'
import { ImportOutlined, ExportOutlined } from '@ant-design/icons'
import styles from './style.module.css'

interface ImportExportProps {
  drawings: any[]
  onImport: (drawings: any[]) => void
}

const ImportExport: React.FC<ImportExportProps> = ({
  drawings,
  onImport,
}) => {
  const handleExport = () => {
    const data = JSON.stringify(drawings, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `drawings-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        onImport(data)
        message.success('导入成功')
      } catch (error) {
        message.error('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
    return false
  }

  return (
    <div className={styles.tools}>
      <Space>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <Button icon={<ImportOutlined />}>导入</Button>
        </Upload>
        <Button
          icon={<ExportOutlined />}
          onClick={handleExport}
          disabled={drawings.length === 0}
        >
          导出
        </Button>
      </Space>
    </div>
  )
}

export default ImportExport 