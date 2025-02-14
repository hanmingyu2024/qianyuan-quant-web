import React from 'react'
import { Card, Tree, Button, Input, Modal, Form, Tag, Space, message } from 'antd'
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { DataNode } from 'antd/es/tree'
import styles from './style.module.css'

interface PathCategoryProps {
  onSelect: (category: string) => void
  currentPoints: any[]
}

const PathCategory: React.FC<PathCategoryProps> = ({
  onSelect,
  currentPoints,
}) => {
  const [categories, setCategories] = React.useState<DataNode[]>([])
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [editingKey, setEditingKey] = React.useState<string | null>(null)
  const [form] = Form.useForm()

  React.useEffect(() => {
    // 模拟加载分类数据
    const mockCategories: DataNode[] = [
      {
        title: '基础路径',
        key: '1',
        icon: <FolderOutlined />,
        children: [
          {
            title: '直线运动',
            key: '1-1',
            icon: <FileOutlined />,
          },
          {
            title: '曲线运动',
            key: '1-2',
            icon: <FileOutlined />,
          },
        ],
      },
      {
        title: '复杂路径',
        key: '2',
        icon: <FolderOutlined />,
        children: [
          {
            title: '循环动画',
            key: '2-1',
            icon: <FileOutlined />,
          },
          {
            title: '弹性动画',
            key: '2-2',
            icon: <FileOutlined />,
          },
        ],
      },
    ]
    setCategories(mockCategories)
  }, [])

  const handleAddCategory = (values: any) => {
    const { name, parentKey } = values
    const newKey = Date.now().toString()
    const newNode: DataNode = {
      title: name,
      key: newKey,
      icon: <FolderOutlined />,
      children: [],
    }

    if (parentKey) {
      setCategories(prev => {
        const updateTree = (nodes: DataNode[]): DataNode[] => {
          return nodes.map(node => {
            if (node.key === parentKey) {
              return {
                ...node,
                children: [...(node.children || []), newNode],
              }
            }
            if (node.children) {
              return {
                ...node,
                children: updateTree(node.children),
              }
            }
            return node
          })
        }
        return updateTree(prev)
      })
    } else {
      setCategories(prev => [...prev, newNode])
    }

    setIsModalVisible(false)
    form.resetFields()
    message.success('分类添加成功')
  }

  const handleSaveToCategory = (categoryKey: string) => {
    if (!currentPoints.length) {
      message.error('当前没有可保存的路径')
      return
    }

    // 模拟保存到分类
    message.success('路径已保存到分类')
  }

  const handleDeleteCategory = (key: string) => {
    setCategories(prev => {
      const deleteFromTree = (nodes: DataNode[]): DataNode[] => {
        return nodes.filter(node => {
          if (node.key === key) return false
          if (node.children) {
            node.children = deleteFromTree(node.children)
          }
          return true
        })
      }
      return deleteFromTree(prev)
    })
    message.success('分类删除成功')
  }

  return (
    <Card
      title="路径分类"
      className={styles.category}
      extra={
        <Button
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          添加分类
        </Button>
      }
    >
      <Tree
        showIcon
        defaultExpandAll
        treeData={categories}
        onSelect={(_, { node }) => onSelect(node.key as string)}
        titleRender={node => (
          <Space>
            <span>{node.title}</span>
            <Space size="small" className={styles.actions}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={e => {
                  e.stopPropagation()
                  setEditingKey(node.key as string)
                }}
              />
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={e => {
                  e.stopPropagation()
                  handleDeleteCategory(node.key as string)
                }}
              />
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={e => {
                  e.stopPropagation()
                  handleSaveToCategory(node.key as string)
                }}
              />
            </Space>
          </Space>
        )}
      />

      <Modal
        title="添加分类"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={handleAddCategory}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="parentKey"
            label="父级分类"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default PathCategory 