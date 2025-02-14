import React from 'react'
import { Form, InputNumber, Switch, Card, Space, Button, Select, message } from 'antd'
import { useMarketStore } from '@/store/useMarketStore'
import { createAdvancedOrder } from '@/services/trading'
import styles from './style.module.css'

const { Option } = Select

interface AdvancedOrderProps {
  symbol: string
  side: 'buy' | 'sell'
}

interface AdvancedOrderForm {
  price: number
  amount: number
  stopPrice?: number
  takeProfit?: number
  stopLoss?: number
  type: 'limit' | 'market'
  timeInForce: 'GTC' | 'IOC' | 'FOK'
}

const AdvancedOrder: React.FC<AdvancedOrderProps> = ({ symbol, side }) => {
  const [form] = Form.useForm<AdvancedOrderForm>()
  const [useStopPrice, setUseStopPrice] = React.useState(false)
  const [useTakeProfit, setUseTakeProfit] = React.useState(false)
  const [useStopLoss, setUseStopLoss] = React.useState(false)
  const { marketData } = useMarketStore()
  const currentPrice = marketData[symbol]?.price || 0

  const handleSubmit = async (values: AdvancedOrderForm) => {
    try {
      await createAdvancedOrder({
        ...values,
        symbol,
        side,
        stopPrice: useStopPrice ? values.stopPrice : undefined,
        takeProfit: useTakeProfit ? values.takeProfit : undefined,
        stopLoss: useStopLoss ? values.stopLoss : undefined,
      })
      message.success('订单提交成功')
      form.resetFields()
    } catch (error) {
      message.error('订单提交失败')
    }
  }

  return (
    <Card title="高级交易" className={styles.card}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'limit',
          timeInForce: 'GTC',
          price: currentPrice,
        }}
      >
        <Form.Item label="订单类型" name="type">
          <Select>
            <Option value="limit">限价单</Option>
            <Option value="market">市价单</Option>
          </Select>
        </Form.Item>

        <Form.Item label="价格" name="price">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={8}
            placeholder="输入价格"
          />
        </Form.Item>

        <Form.Item label="数量" name="amount">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={8}
            placeholder="输入数量"
          />
        </Form.Item>

        <Space direction="vertical" className={styles.conditions}>
          <div className={styles.condition}>
            <Switch
              checked={useStopPrice}
              onChange={setUseStopPrice}
            />
            <span>触发价</span>
            {useStopPrice && (
              <Form.Item name="stopPrice" noStyle>
                <InputNumber
                  style={{ width: 200 }}
                  min={0}
                  precision={8}
                  placeholder="输入触发价"
                />
              </Form.Item>
            )}
          </div>

          <div className={styles.condition}>
            <Switch
              checked={useTakeProfit}
              onChange={setUseTakeProfit}
            />
            <span>止盈价</span>
            {useTakeProfit && (
              <Form.Item name="takeProfit" noStyle>
                <InputNumber
                  style={{ width: 200 }}
                  min={0}
                  precision={8}
                  placeholder="输入止盈价"
                />
              </Form.Item>
            )}
          </div>

          <div className={styles.condition}>
            <Switch
              checked={useStopLoss}
              onChange={setUseStopLoss}
            />
            <span>止损价</span>
            {useStopLoss && (
              <Form.Item name="stopLoss" noStyle>
                <InputNumber
                  style={{ width: 200 }}
                  min={0}
                  precision={8}
                  placeholder="输入止损价"
                />
              </Form.Item>
            )}
          </div>
        </Space>

        <Form.Item label="有效期" name="timeInForce">
          <Select>
            <Option value="GTC">一直有效</Option>
            <Option value="IOC">立即成交或取消</Option>
            <Option value="FOK">全部成交或取消</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            danger={side === 'sell'}
            block
          >
            {side === 'buy' ? '买入' : '卖出'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default AdvancedOrder 