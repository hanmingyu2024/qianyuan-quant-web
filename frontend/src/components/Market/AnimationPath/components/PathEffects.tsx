import React from 'react'
import { Card, Select, InputNumber, Switch, Space } from 'antd'
import styles from '../style.module.css'

interface Effect {
  type: 'trail' | 'glow' | 'dash' | 'particle'
  enabled: boolean
  params: Record<string, number>
}

interface PathEffectsProps {
  onEffectChange: (effects: Effect[]) => void
}

export const PathEffects: React.FC<PathEffectsProps> = ({
  onEffectChange,
}) => {
  const [effects, setEffects] = React.useState<Effect[]>([
    {
      type: 'trail',
      enabled: false,
      params: { length: 10, opacity: 0.5 }
    },
    {
      type: 'glow',
      enabled: false,
      params: { radius: 10, intensity: 0.5 }
    },
  ])

  const handleEffectToggle = (index: number, enabled: boolean) => {
    const newEffects = [...effects]
    newEffects[index].enabled = enabled
    setEffects(newEffects)
    onEffectChange(newEffects)
  }

  const handleParamChange = (index: number, param: string, value: number) => {
    const newEffects = [...effects]
    newEffects[index].params[param] = value
    setEffects(newEffects)
    onEffectChange(newEffects)
  }

  return (
    <Card title="动画效果" className={styles.effects}>
      {effects.map((effect, index) => (
        <div key={effect.type} className={styles.effect}>
          <Space>
            <Switch
              checked={effect.enabled}
              onChange={(enabled) => handleEffectToggle(index, enabled)}
            />
            <span>{effect.type}</span>
          </Space>
          
          {effect.enabled && (
            <div className={styles.params}>
              {Object.entries(effect.params).map(([param, value]) => (
                <div key={param}>
                  <label>{param}</label>
                  <InputNumber
                    value={value}
                    onChange={(v) => handleParamChange(index, param, v || 0)}
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </Card>
  )
} 