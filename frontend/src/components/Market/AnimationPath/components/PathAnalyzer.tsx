import React from 'react'
import { Card, Progress, Alert, List, Tag } from 'antd'
import { PathPoint } from '../types'
import { calculatePathLength } from '../utils/animation'
import styles from '../style.module.css'

interface PathAnalyzerProps {
  points: PathPoint[]
}

export const PathAnalyzer: React.FC<PathAnalyzerProps> = ({ points }) => {
  const analysis = React.useMemo(() => {
    if (points.length < 2) return null

    const totalLength = calculatePathLength(points)
    const totalTime = points[points.length - 1].time - points[0].time
    const averageSpeed = totalLength / totalTime

    // 计算路径复杂度
    let complexity = 0
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
      complexity += Math.abs(angle2 - angle1)
    }

    return {
      totalLength,
      totalTime,
      averageSpeed,
      complexity: complexity / (points.length - 2),
      suggestions: [
        complexity > 5 && '路径过于复杂，建议简化',
        averageSpeed > 2 && '动画速度可能过快',
        points.length > 20 && '点数过多，可以考虑减少',
      ].filter(Boolean),
    }
  }, [points])

  if (!analysis) {
    return <Alert message="添加更多点以查看分析" type="info" />
  }

  return (
    <Card title="路径分析" className={styles.analyzer}>
      <Progress
        percent={Math.min(100, (analysis.complexity * 20))}
        status={analysis.complexity > 5 ? 'exception' : 'normal'}
        format={() => '复杂度'}
      />
      
      <List
        size="small"
        header="优化建议"
        dataSource={analysis.suggestions}
        renderItem={item => (
          <List.Item>
            <Tag color="blue">{item}</Tag>
          </List.Item>
        )}
      />
    </Card>
  )
}