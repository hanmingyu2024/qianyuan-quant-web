import React from 'react'
import { Card, Space, Button, List, Tag, Tooltip, Progress } from 'antd'
import {
  BulbOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface Suggestion {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  score: number
  autoFix?: () => void
}

interface PathOptimizerProps {
  points: any[]
  onPointsUpdate: (points: any[]) => void
}

const PathOptimizer: React.FC<PathOptimizerProps> = ({
  points,
  onPointsUpdate,
}) => {
  const analyzePath = (): Suggestion[] => {
    const suggestions: Suggestion[] = []

    // 检查点的间距
    const checkSpacing = () => {
      if (points.length < 2) return
      
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x
        const dy = points[i].y - points[i-1].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 10) {
          suggestions.push({
            id: `spacing-${i}`,
            type: 'warning',
            title: '点间距过小',
            description: `第${i}个点和第${i+1}个点距离过近，建议调整间距`,
            score: 70,
            autoFix: () => {
              const newPoints = [...points]
              newPoints[i].x += 20
              newPoints[i].y += 20
              onPointsUpdate(newPoints)
            },
          })
        }
      }
    }

    // 检查时间分配
    const checkTiming = () => {
      const totalTime = points.reduce((sum, p) => sum + p.time, 0)
      const avgTime = totalTime / points.length
      
      points.forEach((point, i) => {
        if (Math.abs(point.time - avgTime) > avgTime * 0.5) {
          suggestions.push({
            id: `timing-${i}`,
            type: 'info',
            title: '时间分配不均匀',
            description: `第${i+1}个点的时间与平均时间差异较大`,
            score: 85,
            autoFix: () => {
              const newPoints = [...points]
              newPoints[i].time = avgTime
              onPointsUpdate(newPoints)
            },
          })
        }
      })
    }

    // 检查缓动函数
    const checkEasing = () => {
      const easings = points.map(p => p.easing)
      const uniqueEasings = new Set(easings)
      
      if (uniqueEasings.size > 3) {
        suggestions.push({
          id: 'easing',
          type: 'info',
          title: '缓动函数过多',
          description: '使用了过多不同的缓动函数，可能导致动画不连贯',
          score: 90,
          autoFix: () => {
            const newPoints = points.map(p => ({
              ...p,
              easing: 'easeInOut',
            }))
            onPointsUpdate(newPoints)
          },
        })
      }
    }

    checkSpacing()
    checkTiming()
    checkEasing()

    return suggestions
  }

  const suggestions = React.useMemo(() => analyzePath(), [points])
  const overallScore = Math.round(
    suggestions.reduce((sum, s) => sum + s.score, 0) / Math.max(suggestions.length, 1)
  )

  return (
    <Card 
      title="路径优化" 
      className={styles.optimizer}
      extra={
        <Progress
          type="circle"
          percent={overallScore}
          width={40}
          format={percent => `${percent}分`}
        />
      }
    >
      <List
        dataSource={suggestions}
        renderItem={suggestion => (
          <List.Item
            className={styles.suggestion}
            actions={[
              suggestion.autoFix && (
                <Tooltip title="自动修复">
                  <Button
                    icon={<ThunderboltOutlined />}
                    onClick={suggestion.autoFix}
                  />
                </Tooltip>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={
                <Tag color={
                  suggestion.type === 'warning' ? 'orange' :
                  suggestion.type === 'info' ? 'blue' : 'green'
                }>
                  <BulbOutlined />
                </Tag>
              }
              title={suggestion.title}
              description={suggestion.description}
            />
          </List.Item>
        )}
      />
    </Card>
  )
}

export default PathOptimizer 