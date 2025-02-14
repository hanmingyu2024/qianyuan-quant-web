import React from 'react'
import { Card, List, Button, Tooltip, Modal } from 'antd'
import { PathPoint } from '../types'
import styles from '../style.module.css'

interface Template {
  id: string
  name: string
  description: string
  points: PathPoint[]
  thumbnail?: string
}

const PRESET_TEMPLATES: Template[] = [
  {
    id: 'circle',
    name: '圆形',
    description: '平滑的圆形运动路径',
    points: Array.from({ length: 12 }).map((_, i) => ({
      id: `circle-${i}`,
      x: 400 + Math.cos(i * Math.PI / 6) * 100,
      y: 300 + Math.sin(i * Math.PI / 6) * 100,
      time: i * 500,
      easing: 'linear',
    })),
  },
  {
    id: 'wave',
    name: '波浪',
    description: '正弦波运动路径',
    points: Array.from({ length: 10 }).map((_, i) => ({
      id: `wave-${i}`,
      x: 100 + i * 80,
      y: 300 + Math.sin(i * Math.PI / 5) * 50,
      time: i * 500,
      easing: 'easeInOut',
    })),
  },
]

interface PathTemplatesProps {
  onApplyTemplate: (points: PathPoint[]) => void
}

export const PathTemplates: React.FC<PathTemplatesProps> = ({
  onApplyTemplate,
}) => {
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null)

  return (
    <>
      <Card title="预设模板" className={styles.templates}>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={PRESET_TEMPLATES}
          renderItem={template => (
            <List.Item>
              <Card
                size="small"
                title={template.name}
                actions={[
                  <Tooltip title="预览">
                    <Button 
                      type="link" 
                      onClick={() => setPreviewTemplate(template)}
                    >
                      预览
                    </Button>
                  </Tooltip>,
                  <Tooltip title="应用">
                    <Button
                      type="link"
                      onClick={() => onApplyTemplate(template.points)}
                    >
                      应用
                    </Button>
                  </Tooltip>,
                ]}
              >
                <Card.Meta
                  description={template.description}
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={`预览 - ${previewTemplate?.name}`}
        open={!!previewTemplate}
        onCancel={() => setPreviewTemplate(null)}
        footer={null}
      >
        {previewTemplate && (
          <div className={styles.preview}>
            <svg width="100%" height="200">
              <path
                d={`M ${previewTemplate.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#1890ff"
                strokeWidth={2}
              />
            </svg>
          </div>
        )}
      </Modal>
    </>
  )
}