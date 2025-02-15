import * as React from 'react';
import { Form, InputNumber, Select, Button, Space } from 'antd';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const { Option } = Select;

const FormContainer = styled.div`
  .ant-form-item-label {
    padding-bottom: 4px;
  }
`;

const OrderForm: React.FC = () => {
  const [form] = Form.useForm();
  const currentPrice = useSelector((state: RootState) => state.market.currentPrice);

  const handleSubmit = (values: any) => {
    console.log('Order values:', values);
  };

  return (
    <FormContainer>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="type" label="交易类型" rules={[{ required: true }]}>
          <Select>
            <Option value="limit">限价委托</Option>
            <Option value="market">市价委托</Option>
          </Select>
        </Form.Item>

        <Form.Item name="direction" label="方向" rules={[{ required: true }]}>
          <Select>
            <Option value="buy">买入</Option>
            <Option value="sell">卖出</Option>
          </Select>
        </Form.Item>

        <Form.Item name="price" label="价格" rules={[{ required: true }]}>
          <InputNumber
            style={{ width: '100%' }}
            precision={2}
            min={0}
            placeholder={`当前价格: ${currentPrice}`}
          />
        </Form.Item>

        <Form.Item name="amount" label="数量" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button type="primary" htmlType="submit" style={{ width: '48%' }}>
            买入
          </Button>
          <Button danger htmlType="submit" style={{ width: '48%' }}>
            卖出
          </Button>
        </Space>
      </Form>
    </FormContainer>
  );
};

export default OrderForm; 