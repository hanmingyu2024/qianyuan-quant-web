import React from 'react'
import { Card, List, Tag, Space, Button, Modal, Input, message, Timeline } from 'antd'
import {
  BranchesOutlined,
  SaveOutlined,
  RollbackOutlined,
  DiffOutlined,
  TagOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface PathVersion {
  id: string
  name: string
  points: any[]
  timestamp: number
  tag?: string
  description?: string
}

interface PathVersionProps {
  currentPoints: any[]
  onRestore: (points: any[]) => void
}

const PathVersion: React.FC<PathVersionProps> = ({
  currentPoints,
  onRestore,
}) => {
  const [versions, setVersions] = React.useState<PathVersion[]>([])
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [versionName, setVersionName] = React.useState('')
  const [versionTag, setVersionTag] = React.useState('')
  const [versionDesc, setVersionDesc] = React.useState('')

  const handleSaveVersion = () => {
    if (!versionName) {
      message.warning('请输入版本名称')
      return
    }

    const newVersion: PathVersion = {
      id: Date.now().toString(),
      name: versionName,
      points: currentPoints,
      timestamp: Date.now(),
      tag: versionTag || undefined,
      description: versionDesc || undefined,
    }

    setVersions([newVersion, ...versions])
    setIsModalVisible(false)
    setVersionName('')
    setVersionTag('')
    setVersionDesc('')
    message.success('版本保存成功')
  }

  const handleRestore = (version: PathVersion) => {
    Modal.confirm({
      title: '恢复版本',
      content: `确定要恢复到版本 "${version.name}" 吗？`,
      onOk: () => {
        onRestore(version.points)
        message.success('版本恢复成功')
      },
    })
  }

  const getTimeDiff = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  return (
    <Card
      title="版本管理"
      className={styles.version}
      extra={
        <Button
          icon={<SaveOutlined />}
          onClick={() => setIsModalVisible(true)}
          disabled={!currentPoints.length}
        >
          保存版本
        </Button>
      }
    >
      <Timeline mode="left">
        {versions.map(version => (
          <Timeline.Item
            key={version.id}
            dot={<BranchesOutlined />}
            color="blue"
          >
            <div className={styles.versionItem}>
              <Space direction="vertical">
                <Space>
                  <span className={styles.versionName}>{version.name}</span>
                  {version.tag && (
                    <Tag color="blue" icon={<TagOutlined />}>
                      {version.tag}
                    </Tag>
                  )}
                  <span className={styles.versionTime}>
                    {getTimeDiff(version.timestamp)}
                  </span>
                </Space>

                {version.description && (
                  <div className={styles.versionDesc}>
                    {version.description}
                  </div>
                )}

                <Space>
                  <Button
                    size="small"
                    icon={<RollbackOutlined />}
                    onClick={() => handleRestore(version)}
                  >
                    恢复
                  </Button>
                  <Button
                    size="small"
                    icon={<DiffOutlined />}
                    onClick={() => {
                      // 可以调用之前的对比功能
                      console.log('Compare with current version')
                    }}
                  >
                    对比
                  </Button>
                </Space>
              </Space>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>

      <Modal
        title="保存版本"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSaveVersion}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="版本名称"
            value={versionName}
            onChange={e => setVersionName(e.target.value)}
          />
          <Input
            placeholder="版本标签（可选）"
            value={versionTag}
            onChange={e => setVersionTag(e.target.value)}
          />
          <Input.TextArea
            placeholder="版本描述（可选）"
            value={versionDesc}
            onChange={e => setVersionDesc(e.target.value)}
            rows={4}
          />
        </Space>
      </Modal>
    </Card>
  )
}

export default PathVersion 