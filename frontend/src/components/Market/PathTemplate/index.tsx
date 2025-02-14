import React from 'react'
import { Card, List, Button, Tag, Space, Modal, Input, Upload, message } from 'antd'
import {
  AppstoreOutlined,
  UploadOutlined,
  DownloadOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons'
import styles from './style.module.css'

interface PathTemplate {
  id: string
  name: string
  category: string
  tags: string[]
  preview: string // base64 image
  points: any[]
  downloads: number
  favorites: number
  isStarred?: boolean
}

interface PathTemplateProps {
  onApply: (points: any[]) => void
}

const PathTemplate: React.FC<PathTemplateProps> = ({
  onApply,
}) => {
  const [templates, setTemplates] = React.useState<PathTemplate[]>([])
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [searchText, setSearchText] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')

  React.useEffect(() => {
    // 模拟加载模板数据
    const mockTemplates: PathTemplate[] = [
      {
        id: '1',
        name: '弹跳动画',
        category: '基础动画',
        tags: ['弹性', '循环'],
        preview: '',
        points: [],
        downloads: 120,
        favorites: 45,
      },
      {
        id: '2',
        name: '波浪效果',
        category: '特效动画',
        tags: ['波动', '平滑'],
        preview: '',
        points: [],
        downloads: 89,
        favorites: 32,
      },
    ]
    setTemplates(mockTemplates)
  }, [])

  const handleStar = (templateId: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        return {
          ...t,
          isStarred: !t.isStarred,
          favorites: t.favorites + (t.isStarred ? -1 : 1),
        }
      }
      return t
    }))
  }

  const handleUpload = (file: File) => {
    // 模拟上传模板
    message.success('模板上传成功')
    return false
  }

  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchText.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchSearch && matchCategory
  })

  const categories = ['all', ...new Set(templates.map(t => t.category))]

  return (
    <Card
      title="模板库"
      className={styles.template}
      extra={
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>
            上传模板
          </Button>
        </Upload>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input.Search
            placeholder="搜索模板..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 120 }}
          >
            {categories.map(c => (
              <Select.Option key={c} value={c}>
                {c === 'all' ? '全部分类' : c}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={filteredTemplates}
          renderItem={template => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div className={styles.preview}>
                    {template.preview ? (
                      <img src={template.preview} alt={template.name} />
                    ) : (
                      <AppstoreOutlined style={{ fontSize: 48 }} />
                    )}
                  </div>
                }
                actions={[
                  <Button
                    key="apply"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => onApply(template.points)}
                  >
                    使用
                  </Button>,
                  <Button
                    key="star"
                    icon={template.isStarred ? <StarFilled /> : <StarOutlined />}
                    onClick={() => handleStar(template.id)}
                  >
                    {template.favorites}
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={template.name}
                  description={
                    <Space direction="vertical" size={4}>
                      <Space>
                        <Tag color="blue">{template.category}</Tag>
                        <span>下载: {template.downloads}</span>
                      </Space>
                      <Space>
                        {template.tags.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  )
}

export default PathTemplate 