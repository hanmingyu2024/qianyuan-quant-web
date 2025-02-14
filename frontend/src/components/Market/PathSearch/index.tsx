import React from 'react'
import { Card, Input, Select, List, Tag, Button, Space, Empty } from 'antd'
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select

interface PathSearchProps {
  onSelect: (points: any[]) => void
}

interface SearchResult {
  id: string
  name: string
  author: string
  tags: string[]
  rating: number
  downloads: number
  timestamp: number
  points: any[]
}

const PathSearch: React.FC<PathSearchProps> = ({
  onSelect,
}) => {
  const [keyword, setKeyword] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'rating' | 'downloads' | 'time'>('rating')
  const [filterTags, setFilterTags] = React.useState<string[]>([])
  const [results, setResults] = React.useState<SearchResult[]>([])

  // 模拟搜索结果
  const searchPaths = () => {
    const mockResults: SearchResult[] = [
      {
        id: '1',
        name: '圆形路径模板',
        author: '用户A',
        tags: ['圆形', '平滑'],
        rating: 4.5,
        downloads: 100,
        timestamp: Date.now() - 86400000,
        points: [],
      },
      {
        id: '2',
        name: '波浪动画路径',
        author: '用户B',
        tags: ['波浪', '动态'],
        rating: 4.8,
        downloads: 80,
        timestamp: Date.now() - 172800000,
        points: [],
      },
    ]

    let filtered = mockResults
    if (keyword) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(keyword.toLowerCase()) ||
        r.author.toLowerCase().includes(keyword.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()))
      )
    }

    if (filterTags.length) {
      filtered = filtered.filter(r =>
        filterTags.every(tag => r.tags.includes(tag))
      )
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return b.downloads - a.downloads
        case 'time':
          return b.timestamp - a.timestamp
        default:
          return 0
      }
    })

    setResults(filtered)
  }

  React.useEffect(() => {
    searchPaths()
  }, [keyword, sortBy, filterTags])

  const allTags = ['圆形', '波浪', '平滑', '动态', '复杂', '简单']

  return (
    <Card title="路径搜索" className={styles.search}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input
            placeholder="搜索路径..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            mode="multiple"
            placeholder="选择标签"
            value={filterTags}
            onChange={setFilterTags}
            style={{ width: 200 }}
          >
            {allTags.map(tag => (
              <Option key={tag} value={tag}>{tag}</Option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 120 }}
          >
            <Option value="rating">按评分</Option>
            <Option value="downloads">按下载量</Option>
            <Option value="time">按时间</Option>
          </Select>
        </Space>

        {results.length > 0 ? (
          <List
            className={styles.resultList}
            dataSource={results}
            renderItem={result => (
              <List.Item
                className={styles.resultItem}
                actions={[
                  <Button
                    key="select"
                    type="primary"
                    onClick={() => onSelect(result.points)}
                  >
                    使用
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={result.name}
                  description={
                    <Space>
                      <span>{result.author}</span>
                      <span>评分: {result.rating}</span>
                      <span>下载: {result.downloads}</span>
                      {result.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无搜索结果" />
        )}
      </Space>
    </Card>
  )
}

export default PathSearch 