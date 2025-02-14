import React from 'react'
import { Card, List, Button, Tag, Space, Rate, Empty, Skeleton } from 'antd'
import {
  ThunderboltOutlined,
  StarOutlined,
  DownloadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface RecommendedPath {
  id: string
  name: string
  author: string
  tags: string[]
  rating: number
  downloads: number
  similarity: number
  points: any[]
}

interface PathRecommendProps {
  currentPoints: any[]
  onSelect: (points: any[]) => void
}

const PathRecommend: React.FC<PathRecommendProps> = ({
  currentPoints,
  onSelect,
}) => {
  const [loading, setLoading] = React.useState(false)
  const [recommendations, setRecommendations] = React.useState<RecommendedPath[]>([])

  React.useEffect(() => {
    if (!currentPoints.length) return

    setLoading(true)
    // 模拟API请求获取推荐路径
    setTimeout(() => {
      const mockRecommendations: RecommendedPath[] = [
        {
          id: '1',
          name: '相似路径A',
          author: '用户A',
          tags: ['平滑', '快速'],
          rating: 4.5,
          downloads: 120,
          similarity: 0.85,
          points: currentPoints.map(p => ({
            ...p,
            x: p.x * 1.2,
            y: p.y * 1.2,
          })),
        },
        {
          id: '2',
          name: '相似路径B',
          author: '用户B',
          tags: ['复杂', '精确'],
          rating: 4.2,
          downloads: 90,
          similarity: 0.75,
          points: currentPoints.map(p => ({
            ...p,
            time: p.time * 0.8,
          })),
        },
      ]
      setRecommendations(mockRecommendations)
      setLoading(false)
    }, 1000)
  }, [currentPoints])

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return '#52c41a'
    if (similarity >= 0.6) return '#faad14'
    return '#ff4d4f'
  }

  return (
    <Card
      title="路径推荐"
      className={styles.recommend}
      extra={
        <Tag icon={<ThunderboltOutlined />} color="blue">
          基于当前路径
        </Tag>
      }
    >
      {loading ? (
        <Skeleton active />
      ) : recommendations.length > 0 ? (
        <List
          className={styles.recommendList}
          dataSource={recommendations}
          renderItem={path => (
            <List.Item
              className={styles.recommendItem}
              actions={[
                <Button
                  key="select"
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => onSelect(path.points)}
                >
                  使用
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{path.name}</span>
                    <Tag
                      color={getSimilarityColor(path.similarity)}
                    >
                      相似度: {Math.round(path.similarity * 100)}%
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Space>
                      <UserOutlined /> {path.author}
                      <StarOutlined /> <Rate disabled value={path.rating} />
                      <span>下载: {path.downloads}</span>
                    </Space>
                    <Space>
                      {path.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无推荐路径" />
      )}
    </Card>
  )
}

export default PathRecommend 