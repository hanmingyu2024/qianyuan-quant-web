import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, message } from 'antd';
import { tradingService } from '../services/tradingService';

const { Option } = Select;

const TradingPanel = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    // 获取可交易的商品列表
    fetchSymbols();
  }, []);

  const fetchSymbols = async () => {
    try {
      const response = await tradingService.getSymbols();
      setSymbols(response.data);
    } catch (error) {
      message.error('获取交易品种失败');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await tradingService.submitOrder({
        symbol: values.symbol,
        type: values.orderType,
        price: values.price,
        quantity: values.quantity,
      });
      message.success('下单成功');
      form.resetFields();
    } catch (error) {
      message.error('下单失败');
    }
    setLoading(false);
  };

  return (
    <Card title="交易面板">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="symbol"
          label="交易品种"
          rules={[{ required: true }]}
        >
          <Select placeholder="选择交易品种">
            {symbols.map(symbol => (
              <Option key={symbol.code} value={symbol.code}>
                {symbol.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="orderType"
          label="订单类型"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="MARKET">市价单</Option>
            <Option value="LIMIT">限价单</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="价格"
          rules={[{ required: true }]}
        >
          <Input type="number" step="0.01" />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="数量"
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交订单
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TradingPanel; 