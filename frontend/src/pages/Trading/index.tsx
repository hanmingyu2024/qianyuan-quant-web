import React, { useState } from 'react'
import { Card, Form, Select, Button, Radio, InputNumber, message, Tabs } from 'antd'
import OrderList from '@/components/Trading/OrderList'
import AdvancedOrder from '@/components/Trading/AdvancedOrder'
import { useMarketStore } from '@/store/useMarketStore'
import { createOrder } from '@/services/trading'
import styles from './style.module.css'

const { Option } = Select

interface TradingFormData {
  symbol: string
  type: 'limit' | 'market'
  price?: number
  amount: number
}

const Trading: React.FC = () => {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit')
  const [form] = Form.useForm<TradingFormData>()
  const { marketData, selectedSymbol, setSelectedSymbol } = useMarketStore()

  const handleSubmit = async (side: 'buy' | 'sell') => {
    try {
      const values = await form.validateFields()
      await createOrder({
        ...values,
        side,
      })
      message.success('订单提交成功')
      form.resetFields(['price', 'amount'])
    } catch (error) {
      message.error('订单提交失败')
    }
  }

  return (
    <div className={styles.container}>
      <Tabs
        defaultActiveKey="basic"
        items={[
          {
            key: 'basic',
            label: '基础交易',
            children: (
              <Card title="交易" className={styles.tradingCard}>
                <div className={styles.orderForm}>
                  <Form form={form} layout="vertical" initialValues={{ type: orderType }}>
                    <Form.Item label="交易对" name="symbol">
                      <Select
                        value={selectedSymbol}
                        onChange={setSelectedSymbol}
                      >
                        <Option value="BTC/USDT">BTC/USDT</Option>
                        <Option value="ETH/USDT">ETH/USDT</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="订单类型" name="type">
                      <Radio.Group 
                        value={orderType} 
                        onChange={e => setOrderType(e.target.value)}
                      >
                        <Radio.Button value="limit">限价单</Radio.Button>
                        <Radio.Button value="market">市价单</Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                    {orderType === 'limit' && (
                      <Form.Item
                        label="价格"
                        name="price"
                        rules={[{ required: true, message: '请输入价格' }]}
                      >
                        <InputNumber 
                          style={{ width: '100%' }}
                          placeholder="输入价格"
                          min={0}
                          precision={2}
                        />
                      </Form.Item>
                    )}

                    <Form.Item
                      label="数量"
                      name="amount"
                      rules={[{ required: true, message: '请输入数量' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="输入数量"
                        min={0}
                        precision={4}
                      />
                    </Form.Item>

                    <div className={styles.buttons}>
                      <Button
                        type="primary"
                        danger
                        className={styles.sellButton}
                        onClick={() => handleSubmit('sell')}
                      >
                        卖出
                      </Button>
                      <Button
                        type="primary"
                        className={styles.buyButton}
                        onClick={() => handleSubmit('buy')}
                      >
                        买入
                      </Button>
                    </div>
                  </Form>
                </div>
              </Card>
            ),
          },
          {
            key: 'advanced',
            label: '高级交易',
            children: (
              <AdvancedOrder
                symbol={selectedSymbol}
                side={orderType === 'buy' ? 'buy' : 'sell'}
              />
            ),
          },
        ]}
      />

      <Card title="当前订单" className={styles.ordersCard}>
        <OrderList />
      </Card>
    </div>
  )
}

export default Trading 