import React from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Switch, Button, Card, Space } from 'antd';
import styled from 'styled-components';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface BacktestConfigProps {
  onSubmit: (values: any) => void;
  loading?: boolean;
  initialValues?: any;
}

const BacktestConfig: React.FC<BacktestConfigProps> = ({
  onSubmit,
  loading,
  initialValues,
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        initialCapital: 10000,
        leverage: 1,
        commission: 0.001,
        slippage: 0.001,
        ...initialValues,
      }}
      onFinish={onSubmit}
    >
      <StyledCard title="基本设置">
        <Form.Item
          name="timeRange"
          label="回测时间"
          rules={[{ required: true, message: '请选择回测时间范围' }]}
        >
          <RangePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="initialCapital"
          label="初始资金"
          rules={[{ required: true, message: '请输入初始资金' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            prefix="$"
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="leverage"
          label="杠杆倍数"
          rules={[{ required: true, message: '请输入杠杆倍数' }]}
        >
          <InputNumber
            min={1}
            max={10}
            style={{ width: '100%' }}
            suffix="x"
          />
        </Form.Item>
      </StyledCard>

      <StyledCard title="交易设置">
        <Form.Item
          name="commission"
          label="手续费率"
          rules={[{ required: true, message: '请输入手续费率' }]}
        >
          <InputNumber
            min={0}
            max={0.01}
            step={0.0001}
            style={{ width: '100%' }}
            formatter={(value) => `${(value || 0) * 100}%`}
            parser={(value) => (value ? parseFloat(value.replace('%', '')) / 100 : 0)}
          />
        </Form.Item>

        <Form.Item
          name="slippage"
          label="滑点率"
          rules={[{ required: true, message: '请输入滑点率' }]}
        >
          <InputNumber
            min={0}
            max={0.01}
            step={0.0001}
            style={{ width: '100%' }}
            formatter={(value) => `${(value || 0) * 100}%`}
            parser={(value) => (value ? parseFloat(value.replace('%', '')) / 100 : 0)}
          />
        </Form.Item>

        <Form.Item
          name="orderType"
          label="委托类型"
          rules={[{ required: true, message: '请选择委托类型' }]}
        >
          <Select>
            <Option value="market">市价委托</Option>
            <Option value="limit">限价委托</Option>
          </Select>
        </Form.Item>
      </StyledCard>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          开始回测
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BacktestConfig; 