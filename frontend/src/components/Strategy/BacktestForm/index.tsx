import React from 'react';
import { Form, DatePicker, InputNumber, Button, Card, Space } from 'antd';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

interface BacktestFormProps {
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const BacktestForm: React.FC<BacktestFormProps> = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    const [startTime, endTime] = values.timeRange;
    const params = {
      ...values,
      startTime: startTime.valueOf(),
      endTime: endTime.valueOf(),
    };
    onSubmit(params);
  };

  return (
    <StyledCard title="回测参数">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          timeRange: [dayjs().subtract(30, 'days'), dayjs()],
          initialCapital: 10000,
        }}
      >
        <Form.Item
          name="timeRange"
          label="回测时间范围"
          rules={[{ required: true, message: '请选择回测时间范围' }]}
        >
          <RangePicker
            showTime
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="initialCapital"
          label="初始资金(USDT)"
          rules={[{ required: true, message: '请输入初始资金' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={1000}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            开始回测
          </Button>
        </Form.Item>
      </Form>
    </StyledCard>
  );
};

export default BacktestForm; 