import React from 'react'
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd'
import { QrcodeOutlined } from '@ant-design/icons'
import { useUserStore } from '@/store/useUserStore'
import styles from './style.module.css'

const { Option } = Select

interface TransferModalProps {
  visible: boolean
  type: 'deposit' | 'withdraw'
  onClose: () => void
}

interface TransferForm {
  currency: string
  amount: number
  address?: string
}

const TransferModal: React.FC<TransferModalProps> = ({ visible, type, onClose }) => {
  const [form] = Form.useForm<TransferForm>()
  const { userInfo } = useUserStore()

  const handleSubmit = async (values: TransferForm) => {
    try {
      // TODO: 调用充值/提现API
      message.success(`${type === 'deposit' ? '充值' : '提现'}申请已提交`)
      form.resetFields()
      onClose()
    } catch (error) {
      message.error(`${type === 'deposit' ? '充值' : '提现'}失败`)
    }
  }

  return (
    <Modal
      title={type === 'deposit' ? '充值' : '提现'}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="币种"
          name="currency"
          rules={[{ required: true, message: '请选择币种' }]}
        >
          <Select>
            {Object.keys(userInfo?.balance || {}).map(currency => (
              <Option key={currency} value={currency}>{currency}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="数量"
          name="amount"
          rules={[{ required: true, message: '请输入数量' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={8}
          />
        </Form.Item>

        {type === 'deposit' ? (
          <Form.Item
            label="充值地址"
            shouldUpdate={(prev, curr) => prev?.currency !== curr?.currency}
          >
            {({ getFieldValue }) => {
              const currency = getFieldValue('currency')
              return currency ? (
                <div className={styles.addressBox}>
                  <Input.TextArea
                    value="0x1234567890abcdef..." // 从后端获取充值地址
                    readOnly
                    rows={2}
                  />
                  <Button icon={<QrcodeOutlined />}>
                    显示二维码
                  </Button>
                </div>
              ) : null
            }}
          </Form.Item>
        ) : (
          <Form.Item
            label="提现地址"
            name="address"
            rules={[{ required: true, message: '请输入提现地址' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            确认{type === 'deposit' ? '充值' : '提现'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TransferModal 