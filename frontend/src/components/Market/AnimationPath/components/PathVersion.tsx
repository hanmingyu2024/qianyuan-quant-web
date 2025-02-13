import React from 'react'
import { Card, List, Tag, Button, Tooltip, Modal, Timeline } from 'antd'
import { ClockCircleOutlined, RollbackOutlined } from '@ant-design/icons'
import { PathPoint } from '../types'
import styles from '../style.module.css'

interface Version {
  id: string
  timestamp: number
  points: PathPoint[]
  description: string
  author: string
}

interface PathVersionProps {
  versions: Version[]
  currentVersion: string
  onRestore: (version: Version) => void
  onCompare: (v1: Version, v2: Version) => void
}

export const PathVersion: React.FC<PathVersionProps> = ({
  versions,
  currentVersion,
  onRestore,
  onCompare,
}) => {
  const [compareMode, setCompareMode] = React.useState(false)
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([])

  const handleVersionSelect = (versionId: string) => {
    if (compareMode) {
      setSelectedVersions(prev => {
        if (prev.includes(versionId)) {
          return prev.filter(id => id !== versionId)
        }
        if (prev.length < 2) {
          return [...prev, versionId]
        }
        return [prev[1], versionId]
      })
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length !== 2) return
    
    const v1 = versions.find(v => v.id === selectedVersions[0])
    const v2 = versions.find(v => v.id === selectedVersions[1])
    
    if (v1 && v2) {
      onCompare(v1, v2)
    }
  }

  return (
    <Card 
      title="版本历史"
      extra={
        <Button
          type={compareMode ? 'primary' : 'default'}
          onClick={() => {
            setCompareMode(!compareMode)
            setSelectedVersions([])
          }}
        >
          对比模式
        </Button>
      }
      className={styles.version}
    >
      <Timeline>
        {versions.map(version => (
          <Timeline.Item
            key={version.id}
            dot={<ClockCircleOutlined />}
            color={version.id === currentVersion ? 'blue' : 'gray'}
          >
            <div className={styles.versionItem}>
              <div>
                <span>{new Date(version.timestamp).toLocaleString()}</span>
                <Tag color="blue">{version.author}</Tag>
              </div>
              <p>{version.description}</p>
              <div className={styles.versionActions}>
                {compareMode ? (
                  <Checkbox
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => handleVersionSelect(version.id)}
                    disabled={
                      selectedVersions.length === 2 && 
                      !selectedVersions.includes(version.id)
                    }
                  />
                ) : (
                  <Tooltip title="恢复到此版本">
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={() => onRestore(version)}
                      size="small"
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>

      {compareMode && selectedVersions.length === 2 && (
        <Button
          type="primary"
          onClick={handleCompare}
          style={{ marginTop: 16 }}
        >
          对比选中版本
        </Button>
      )}
    </Card>
  )
}