import React from 'react'
import { Form, Input, Button, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'
import styles from './style.module.css'

interface LoginForm {
  username: string
  password: string
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, loading } = useUserStore()
  const [form] = Form.useForm<LoginForm>()

  const handleSubmit = async (values: LoginForm) => {
    try {
      await login(values.username, values.password)
      navigate('/')
    } catch (error) {
      // 错误已在 store 中处理
    }
  }

  return (
    <div className={styles.container}>
      <Card title="登录" className={styles.card}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login 