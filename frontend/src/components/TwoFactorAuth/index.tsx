import React from 'react'
import { Modal, Form, Input, QRCode, Steps, message } from 'antd'
import { enable2FA, verify2FA } from '@/services/user'
import styles from './style.module.css'

interface TwoFactorAuthProps {
  visible: boolean
  onClose: () => void
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ visible, onClose }) => {
  const [current, setCurrent] = React.useState(0)
  const [secret, setSecret] = React.useState('')
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (visible) {
      enable2FA().then(({ secret }) => setSecret(secret))
    }
  }, [visible])

  const handleVerify = async (values: { code: string }) => {
    try {
      await verify2FA(values.code)
      message.success('二次验证已启用')
      onClose()
    } catch (error) {
      message.error('验证失败')
    }
  }

  const steps = [
    {
      title: '扫描二维码',
      content: (
        <div className={styles.qrStep}>
          <QRCode
            value={`otpauth://totp/TradingPlatform:${secret}?secret=${secret}&issuer=TradingPlatform`}
          />
          <p>请使用 Google Authenticator 扫描二维码</p>
        </div>
      ),
    },
    {
      title: '验证',
      content: (
        <Form form={form} onFinish={handleVerify}>
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input placeholder="请输入6位验证码" maxLength={6} />
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <Modal
      title="启用二次验证"
      open={visible}
      onCancel={onClose}
      onOk={() => {
        if (current < steps.length - 1) {
          setCurrent(current + 1)
        } else {
          form.submit()
        }
      }}
    >
      <Steps current={current} items={steps} />
      <div className={styles.content}>{steps[current].content}</div>
    </Modal>
  )
}

export default TwoFactorAuth 