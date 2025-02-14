import React from 'react';
import { Form, Input, Button, Select, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

const OrderFormWrapper = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

interface OrderFormProps {
  type: 'limit' | 'market';
}

export const OrderForm: React.FC<OrderFormProps> = ({ type }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const currentPrice = useSelector((state: any) => state.market.currentPrice);

  const onFinish = (values: any) => {
    // 处理下单逻辑
    console.log('Order values:', values);
  };

  return (
    <OrderFormWrapper>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item label="价格" name="price">
          <InputNumber 
            style={{ width: '100%' }}
            precision={2}
            min={0}
            disabled={type === 'market'}
          />
        </Form.Item>
        <Form.Item label="数量" name="amount">
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {type === 'limit' ? '限价委托' : '市价委托'}
          </Button>
        </Form.Item>
      </Form>
    </OrderFormWrapper>
  );
}; 