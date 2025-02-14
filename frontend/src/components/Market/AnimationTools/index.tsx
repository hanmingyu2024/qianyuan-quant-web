import React from 'react'
import { Space, Button, InputNumber, Select, Tooltip } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select

interface AnimationToolsProps {
  onAnimate: (config: any) => void
  onAutoLayout: (type: string) => void
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  duration: number
  onDurationChange: (value: number) => void
  easing: string
  onEasingChange: (value: string) => void
}

const AnimationTools: React.FC<AnimationToolsProps> = ({
  onAnimate,
  onAutoLayout,
  isPlaying,
  onPlayPause,
  onReset,
  duration,
  onDurationChange,
  easing,
  onEasingChange,
}) => {
  const easingOptions = [
    { value: 'linear', label: '线性' },
    { value: 'quadraticIn', label: '二次加速' },
    { value: 'quadraticOut', label: '二次减速' },
    { value: 'bounceOut', label: '弹跳' },
  ]

  const layoutOptions = [
    { value: 'circular', label: '圆形布局' },
    { value: 'force', label: '力导向布局' },
    { value: 'grid', label: '网格布局' },
  ]

  return (
    <div className={styles.tools}>
      <Space>
        <Tooltip title={isPlaying ? '暂停' : '播放'}>
          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={onPlayPause}
          />
        </Tooltip>
        <Tooltip title="重置">
          <Button icon={<ReloadOutlined />} onClick={onReset} />
        </Tooltip>
        <span>动画时长:</span>
        <InputNumber
          min={0.1}
          max={10}
          step={0.1}
          value={duration}
          onChange={value => value && onDurationChange(value)}
          formatter={value => `${value}s`}
        />
        <span>缓动函数:</span>
        <Select value={easing} onChange={onEasingChange} style={{ width: 120 }}>
          {easingOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        <Tooltip title="自动布局">
          <Select
            placeholder="选择布局"
            style={{ width: 120 }}
            onChange={onAutoLayout}
            allowClear
          >
            {layoutOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Tooltip>
      </Space>
    </div>
  )
}

export default AnimationTools 