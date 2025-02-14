import React from 'react'
import { Space, Button, List, Input, Tooltip, Popconfirm } from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

interface AnimationStep {
  id: string
  effect: string
  config: any
  duration: number
}

interface AnimationSequenceProps {
  onPlaySequence: (steps: AnimationStep[]) => void
  selectedDrawing: any
}

const AnimationSequence: React.FC<AnimationSequenceProps> = ({
  onPlaySequence,
  selectedDrawing,
}) => {
  const [steps, setSteps] = React.useState<AnimationStep[]>([])
  const [newStepName, setNewStepName] = React.useState('')

  const handleAddStep = () => {
    if (!newStepName.trim()) return

    const newStep: AnimationStep = {
      id: Date.now().toString(),
      effect: 'move',
      config: {
        x: 100,
        y: 100,
      },
      duration: 1,
    }

    setSteps([...steps, newStep])
    setNewStepName('')
  }

  const handleDeleteStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id))
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= steps.length) return

    const newSteps = [...steps]
    const [removed] = newSteps.splice(index, 1)
    newSteps.splice(newIndex, 0, removed)
    setSteps(newSteps)
  }

  const handlePlayAll = () => {
    onPlaySequence(steps)
  }

  return (
    <div className={styles.sequence}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input
            placeholder="输入动画步骤名称"
            value={newStepName}
            onChange={e => setNewStepName(e.target.value)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddStep}
          >
            添加步骤
          </Button>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={handlePlayAll}
            disabled={steps.length === 0}
          >
            播放序列
          </Button>
        </Space>

        <List
          dataSource={steps}
          renderItem={(step, index) => (
            <List.Item
              className={styles.step}
              actions={[
                <Tooltip key="up" title="上移">
                  <Button
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => handleMoveStep(index, 'up')}
                  />
                </Tooltip>,
                <Tooltip key="down" title="下移">
                  <Button
                    icon={<ArrowDownOutlined />}
                    disabled={index === steps.length - 1}
                    onClick={() => handleMoveStep(index, 'down')}
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="确定要删除此步骤吗？"
                  onConfirm={() => handleDeleteStep(step.id)}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={`步骤 ${index + 1}`}
                description={`效果: ${step.effect}, 持续时间: ${step.duration}s`}
              />
            </List.Item>
          )}
        />
      </Space>
    </div>
  )
}

export default AnimationSequence 