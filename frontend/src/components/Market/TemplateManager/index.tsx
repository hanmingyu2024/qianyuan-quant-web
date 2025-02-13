import React from 'react'
import { Space, Button, Input, Card, List, Popconfirm, message } from 'antd'
import {
  SaveOutlined,
  FolderOpenOutlined,
  DeleteOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import html2canvas from 'html2canvas'
import styles from './style.module.css'

interface Template {
  id: string
  name: string
  drawings: any[]
}

interface TemplateManagerProps {
  drawings: any[]
  onApplyTemplate: (drawings: any[]) => void
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  drawings,
  onApplyTemplate,
}) => {
  const [templates, setTemplates] = React.useState<Template[]>(() => {
    const saved = localStorage.getItem('drawingTemplates')
    return saved ? JSON.parse(saved) : []
  })
  const [templateName, setTemplateName] = React.useState('')

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      message.error('请输入模板名称')
      return
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      drawings,
    }
    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)
    localStorage.setItem('drawingTemplates', JSON.stringify(updatedTemplates))
    setTemplateName('')
    message.success('保存成功')
  }

  const handleDeleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id)
    setTemplates(updatedTemplates)
    localStorage.setItem('drawingTemplates', JSON.stringify(updatedTemplates))
    message.success('删除成功')
  }

  const handleExportImage = async () => {
    const element = document.querySelector('.echarts-for-react')
    if (!element) return

    try {
      const canvas = await html2canvas(element as HTMLElement)
      const link = document.createElement('a')
      link.download = `chart-${new Date().toISOString()}.png`
      link.href = canvas.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  return (
    <Card title="模板管理" className={styles.card}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input
            placeholder="输入模板名称"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveTemplate}
            disabled={!drawings.length}
          >
            保存模板
          </Button>
          <Button
            icon={<CameraOutlined />}
            onClick={handleExportImage}
          >
            导出图片
          </Button>
        </Space>

        <List
          dataSource={templates}
          renderItem={template => (
            <List.Item
              className={styles.templateItem}
              actions={[
                <Button
                  key="apply"
                  icon={<FolderOpenOutlined />}
                  onClick={() => onApplyTemplate(template.drawings)}
                >
                  应用
                </Button>,
                <Popconfirm
                  key="delete"
                  title="确定要删除此模板吗？"
                  onConfirm={() => handleDeleteTemplate(template.id)}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={template.name}
                description={`${template.drawings.length} 个图形`}
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  )
}

export default TemplateManager 