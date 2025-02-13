import React from 'react'
import { Space, Button, Upload, message, Card, List, Popconfirm } from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface PathHistory {
  id: string
  name: string
  points: any[]
  timestamp: number
}

interface PathManagerProps {
  points: any[]
  onImport: (points: any[]) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

const PathManager: React.FC<PathManagerProps> = ({
  points,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [savedPaths, setSavedPaths] = React.useState<PathHistory[]>(() => {
    const saved = localStorage.getItem('savedPaths')
    return saved ? JSON.parse(saved) : []
  })

  const handleExport = () => {
    const data = JSON.stringify(points, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `path-${new Date().toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('导出成功')
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedPoints = JSON.parse(content)
        onImport(importedPoints)
        message.success('导入成功')
      } catch (error) {
        message.error('导入失败：文件格式错误')
      }
    }
    reader.readAsText(file)
    return false
  }

  const handleSavePath = () => {
    const newPath: PathHistory = {
      id: Date.now().toString(),
      name: `路径 ${savedPaths.length + 1}`,
      points,
      timestamp: Date.now(),
    }
    const updatedPaths = [...savedPaths, newPath]
    setSavedPaths(updatedPaths)
    localStorage.setItem('savedPaths', JSON.stringify(updatedPaths))
    message.success('保存成功')
  }

  const handleDeletePath = (id: string) => {
    const updatedPaths = savedPaths.filter(p => p.id !== id)
    setSavedPaths(updatedPaths)
    localStorage.setItem('savedPaths', JSON.stringify(updatedPaths))
    message.success('删除成功')
  }

  const handleApplyPath = (path: PathHistory) => {
    onImport(path.points)
    message.success('应用成功')
  }

  return (
    <Card title="路径管理" className={styles.manager}>
      <Space direction="vertical" style={{ width: '100%' }}>
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
            disabled={!points.length}
          >
            导出
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
          >
            撤销
          </Button>
          <Button
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
          >
            重做
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSavePath}
            disabled={!points.length}
          >
            保存
          </Button>
        </Space>

        <List
          dataSource={savedPaths}
          renderItem={path => (
            <List.Item
              className={styles.pathItem}
              actions={[
                <Button
                  key="apply"
                  onClick={() => handleApplyPath(path)}
                >
                  应用
                </Button>,
                <Popconfirm
                  key="delete"
                  title="确定要删除此路径吗？"
                  onConfirm={() => handleDeletePath(path.id)}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={path.name}
                description={`${path.points.length} 个点 · ${new Date(path.timestamp).toLocaleString()}`}
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  )
}

export default PathManager 