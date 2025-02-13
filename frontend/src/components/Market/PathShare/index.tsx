import React from 'react'
import { Card, Space, Button, Input, Modal, List, Tag, message } from 'antd'
import {
  ShareAltOutlined,
  QrcodeOutlined,
  CopyOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons'
import QRCode from 'qrcode.react'
import styles from './style.module.css'

interface SharedPath {
  id: string
  name: string
  points: any[]
  author: string
  tags: string[]
  downloads: number
  timestamp: number
}

interface PathShareProps {
  points: any[]
  onImport: (points: any[]) => void
}

const PathShare: React.FC<PathShareProps> = ({
  points,
  onImport,
}) => {
  const [isShareModalVisible, setIsShareModalVisible] = React.useState(false)
  const [isQRModalVisible, setIsQRModalVisible] = React.useState(false)
  const [sharedPaths, setSharedPaths] = React.useState<SharedPath[]>([])
  const [shareLink, setShareLink] = React.useState('')
  const [pathName, setPathName] = React.useState('')
  const [pathTags, setPathTags] = React.useState<string[]>([])

  const handleShare = () => {
    if (!pathName.trim()) {
      message.error('请输入路径名称')
      return
    }

    const newPath: SharedPath = {
      id: Date.now().toString(),
      name: pathName,
      points,
      author: '当前用户',
      tags: pathTags,
      downloads: 0,
      timestamp: Date.now(),
    }

    // 模拟上传到服务器
    const updatedPaths = [...sharedPaths, newPath]
    setSharedPaths(updatedPaths)
    
    // 生成分享链接
    const shareUrl = `${window.location.origin}/share/${newPath.id}`
    setShareLink(shareUrl)
    setIsShareModalVisible(true)
    message.success('分享成功')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    message.success('链接已复制')
  }

  const handleDownload = (path: SharedPath) => {
    onImport(path.points)
    // 更新下载次数
    const updatedPaths = sharedPaths.map(p => {
      if (p.id === path.id) {
        return { ...p, downloads: p.downloads + 1 }
      }
      return p
    })
    setSharedPaths(updatedPaths)
    message.success('导入成功')
  }

  return (
    <Card title="路径分享" className={styles.share}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input
            placeholder="输入路径名称"
            value={pathName}
            onChange={e => setPathName(e.target.value)}
          />
          <Input
            placeholder="添加标签（用逗号分隔）"
            onChange={e => setPathTags(e.target.value.split(',').map(t => t.trim()))}
          />
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleShare}
            disabled={!points.length}
          >
            分享
          </Button>
          <Button
            icon={<QrcodeOutlined />}
            onClick={() => setIsQRModalVisible(true)}
            disabled={!shareLink}
          >
            二维码
          </Button>
        </Space>

        <List
          dataSource={sharedPaths}
          renderItem={path => (
            <List.Item
              className={styles.pathItem}
              actions={[
                <Button
                  key="download"
                  icon={<CloudDownloadOutlined />}
                  onClick={() => handleDownload(path)}
                >
                  导入 ({path.downloads})
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={path.name}
                description={
                  <Space>
                    <span>{path.author}</span>
                    <span>{new Date(path.timestamp).toLocaleString()}</span>
                    {path.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>

      <Modal
        title="分享链接"
        visible={isShareModalVisible}
        onCancel={() => setIsShareModalVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyLink}>
            复制链接
          </Button>,
        ]}
      >
        <Input value={shareLink} readOnly />
      </Modal>

      <Modal
        title="分享二维码"
        visible={isQRModalVisible}
        onCancel={() => setIsQRModalVisible(false)}
        footer={null}
      >
        <div className={styles.qrcode}>
          <QRCode value={shareLink} size={200} />
        </div>
      </Modal>
    </Card>
  )
}

export default PathShare 