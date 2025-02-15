import React from 'react';
import { Card, Form, DatePicker, Select, InputNumber, Space, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface BacktestConfigProps {
  onSubmit: (config: BacktestConfig) => void;
  loading?: boolean;
}

interface BacktestConfig {
  startTime: string;
  endTime: string;
  symbol: string;
  timeframe: string;
  initialCapital: number;
  leverage: number;
  commission: number;
  slippage: number;
}

const BacktestConfig: React.FC<BacktestConfigProps> = ({
  onSubmit,
  loading,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  return (
    <Card title={t('strategy.backtest.config.title')}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          label={t('strategy.backtest.config.timeRange')}
          name="timeRange"
          rules={[{ required: true }]}
        >
          <RangePicker showTime />
        </Form.Item>

        <Form.Item
          label={t('strategy.backtest.config.symbol')}
          name="symbol"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="BTC/USDT">BTC/USDT</Option>
            <Option value="ETH/USDT">ETH/USDT</Option>
            <Option value="BNB/USDT">BNB/USDT</Option>
          </Select>
        </Form.Item>

        {/* 更多配置项... */}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {t('strategy.backtest.config.start')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BacktestConfig; 