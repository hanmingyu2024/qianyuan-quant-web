import React, { useState } from 'react';
import { Card, Form, DatePicker, InputNumber, Select, Button, Space, Row, Col } from 'antd';
import { Strategy } from '../../store/slices/strategySlice';
import { strategyApi } from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface BacktestSettingsProps {
  strategy: Strategy;
  onStart?: () => void;
}

interface BacktestParams {
  startTime: number;
  endTime: number;
  initialCapital: number;
  commission: number;
  slippage: number;
  dataSource: string;
}

const BacktestSettings: React.FC<BacktestSettingsProps> = ({ strategy, onStart }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const [startTime, endTime] = values.dateRange;
      const params: BacktestParams = {
        startTime: startTime.valueOf(),
        endTime: endTime.valueOf(),
        initialCapital: values.initialCapital,
        commission: values.commission,
        slippage: values.slippage,
        dataSource: values.dataSource,
      };

      await strategyApi.startBacktest(strategy.id, params);
      onStart?.();
    } catch (error) {
      console.error('Failed to start backtest:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return '';
    return `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseCurrency = (value: string | undefined): number => {
    if (value === undefined) return 0;
    return parseFloat(value.replace(/\¥\s?|(,*)/g, ''));
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined) return '';
    return `${(value * 100).toFixed(2)}%`;
  };

  const parsePercentage = (value: string | undefined): number => {
    if (value === undefined) return 0;
    return parseFloat(value.replace('%', '')) / 100;
  };

  return (
    <Card title="回测设置">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          initialCapital: 1000000,
          commission: 0.0003,
          slippage: 0.0001,
          dataSource: 'real',
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="dateRange"
              label="回测区间"
              rules={[{ required: true, message: '请选择回测区间' }]}
            >
              <RangePicker
                showTime
                style={{ width: '100%' }}
                placeholder={['开始时间', '结束时间']}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="initialCapital"
              label="初始资金"
              rules={[{ required: true, message: '请输入初始资金' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                step={10000}
                formatter={formatCurrency}
                parser={parseCurrency}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dataSource"
              label="数据源"
              rules={[{ required: true, message: '请选择数据源' }]}
            >
              <Select>
                <Option value="real">真实数据</Option>
                <Option value="adjusted">前复权数据</Option>
                <Option value="simulated">模拟数据</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="commission"
              label="手续费率"
              rules={[{ required: true, message: '请输入手续费率' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={0.01}
                step={0.0001}
                precision={4}
                formatter={formatPercentage}
                parser={parsePercentage}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="slippage"
              label="滑点率"
              rules={[{ required: true, message: '请输入滑点率' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={0.01}
                step={0.0001}
                precision={4}
                formatter={formatPercentage}
                parser={parsePercentage}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              开始回测
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BacktestSettings; 