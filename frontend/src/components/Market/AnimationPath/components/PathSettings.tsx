import React from 'react'
import { Form, Input, Switch, InputNumber, Select, Divider, Card } from 'antd'
import styles from './PathSettings.module.css'
import { PathSettings } from '../types'
import { DEFAULT_CONFIG } from '../config'

interface PathSettingsProps {
  settings: Partial<PathSettings>
  onSettingsChange: (settings: Partial<PathSettings>) => void
}

export const PathSettings: React.FC<PathSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [form] = Form.useForm()

  const handleValuesChange = (_: any, allValues: any) => {
    onSettingsChange(allValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ ...DEFAULT_CONFIG, ...settings }}
      onValuesChange={handleValuesChange}
    >
      <Form.Item label="动画设置" style={{ marginBottom: 0 }}>
        <Form.Item
          name={['animation', 'duration']}
          label="持续时间(ms)"
        >
          <InputNumber min={0} max={60000} />
        </Form.Item>
        <Form.Item
          name={['animation', 'loop']}
          valuePropName="checked"
          label="循环播放"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name={['animation', 'easing']}
          label="缓动函数"
        >
          <Select>
            <Select.Option value="linear">线性</Select.Option>
            <Select.Option value="easeIn">缓入</Select.Option>
            <Select.Option value="easeOut">缓出</Select.Option>
            <Select.Option value="easeInOut">缓入缓出</Select.Option>
          </Select>
        </Form.Item>
      </Form.Item>

      <Form.Item label="约束设置" style={{ marginBottom: 0 }}>
        <Form.Item
          name={['constraints', 'gridSize']}
          label="网格大小"
        >
          <InputNumber min={1} max={100} />
        </Form.Item>
        <Form.Item
          name={['constraints', 'snapToGrid']}
          valuePropName="checked"
          label="对齐网格"
        >
          <Switch />
        </Form.Item>
      </Form.Item>

      <Form.Item label="显示设置" style={{ marginBottom: 0 }}>
        <Form.Item
          name={['display', 'showGrid']}
          valuePropName="checked"
          label="显示网格"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name={['display', 'pathColor']}
          label="路径颜色"
        >
          <Input type="color" />
        </Form.Item>
      </Form.Item>
    </Form>
  )
} 