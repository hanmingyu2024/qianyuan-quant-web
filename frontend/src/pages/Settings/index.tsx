import React from 'react'
import { Card, Form, Input, Button, Divider, Switch, message } from 'antd'
import { useUserStore } from '@/store/useUserStore'
import TwoFactorAuth from '@/components/TwoFactorAuth'
import styles from './style.module.css'

interface SecuritySettings {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const Settings: React.FC = () => {
  const { userInfo } = useUserStore()
  const [securityForm] = Form.useForm<SecuritySettings>()
  const [twoFactorVisible, setTwoFactorVisible] = React.useState(false)

  const handlePasswordChange = async (values: SecuritySettings) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      // TODO: 调用修改密码API
      message.success('密码修改成功')
      securityForm.resetFields()
    } catch (error) {
      message.error('密码修改失败')
    }
  }

  return (
    <div className={styles.container}>
      <Card title="个人信息" className={styles.card}>
        <Form layout="vertical">
          <Form.Item label="用户名">
            <Input value={userInfo?.username} disabled />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input value={userInfo?.email} disabled />
          </Form.Item>
        </Form>
      </Card>

      <Card title="安全设置" className={styles.card}>
        <Form
          form={securityForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="当前密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            rules={[{ required: true, message: '请确认新密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              修改密码
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Form layout="vertical">
          <Form.Item label="二次验证">
            <Switch onChange={(checked) => checked && setTwoFactorVisible(true)} />
          </Form.Item>
          <Form.Item label="交易通知">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Card>

      <TwoFactorAuth
        visible={twoFactorVisible}
        onClose={() => setTwoFactorVisible(false)}
      />
    </div>
  )
}

export default Settings 