import React from 'react'
import { Space, Button, Select, Tooltip, InputNumber } from 'antd'
import {
  ThunderboltOutlined,
  AimOutlined,
  RadiusSettingOutlined,
} from '@ant-design/icons'
import styles from './style.module.css'

const { Option } = Select

interface AnimationEffectsProps {
  onApplyEffect: (effect: string, config: any) => void
  selectedEffect: string
  onEffectChange: (effect: string) => void
  amplitude: number
  onAmplitudeChange: (value: number) => void
  frequency: number
  onFrequencyChange: (value: number) => void
}

const AnimationEffects: React.FC<AnimationEffectsProps> = ({
  onApplyEffect,
  selectedEffect,
  onEffectChange,
  amplitude,
  onAmplitudeChange,
  frequency,
  onFrequencyChange,
}) => {
  const effects = [
    { value: 'wave', label: '波浪', icon: <ThunderboltOutlined /> },
    { value: 'spiral', label: '螺旋', icon: <RadiusSettingOutlined /> },
    { value: 'shake', label: '震动', icon: <AimOutlined /> },
  ]

  return (
    <div className={styles.effects}>
      <Space>
        <span>动画效果:</span>
        <Select
          value={selectedEffect}
          onChange={onEffectChange}
          style={{ width: 120 }}
        >
          {effects.map(effect => (
            <Option key={effect.value} value={effect.value}>
              <Space>
                {effect.icon}
                {effect.label}
              </Space>
            </Option>
          ))}
        </Select>
        <span>振幅:</span>
        <InputNumber
          min={1}
          max={100}
          value={amplitude}
          onChange={value => value && onAmplitudeChange(value)}
        />
        <span>频率:</span>
        <InputNumber
          min={0.1}
          max={10}
          step={0.1}
          value={frequency}
          onChange={value => value && onFrequencyChange(value)}
        />
        <Button
          type="primary"
          onClick={() => onApplyEffect(selectedEffect, { amplitude, frequency })}
        >
          应用效果
        </Button>
      </Space>
    </div>
  )
}

export default AnimationEffects 