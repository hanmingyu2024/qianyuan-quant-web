import React, { useState } from 'react';
import { Card, Form, InputNumber, Switch, Space, Button, Alert, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  SafetyCertificateOutlined,
  WarningOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { formatNumber, formatPercent, formatPrice } from '@/utils/formatter';
import type { TableColumnType } from 'antd/es/table';

const StyledCard = styled(Card)`
  .ant-card-head-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

interface RiskConfig {
  maxPositionSize: number;
  maxDrawdown: number;
  stopLoss: number;
  takeProfit: number;
  trailingStop: boolean;
  trailingStopDistance: number;
  marginCallLevel: number;
  enableHedging: boolean;
}

interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  risk: number;
}

interface RiskManagerProps {
  config: RiskConfig;
  positions: Position[];
  onConfigUpdate: (config: RiskConfig) => Promise<void>;
  onClosePosition: (symbol: string) => Promise<void>;
}

const RiskManager: React.FC<RiskManagerProps> = ({
  config,
  positions,
  onConfigUpdate,
  onClosePosition,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RiskConfig) => {
    try {
      setLoading(true);
      await onConfigUpdate(values);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumnType<Position>[] = [
    {
      title: t('risk.position.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: t('risk.position.size'),
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatNumber(size),
    },
    {
      title: t('risk.position.entryPrice'),
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      render: (price: number) => formatPrice(price),
    },
    {
      title: t('risk.position.currentPrice'),
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price: number) => formatPrice(price),
    },
    {
      title: t('risk.position.pnl'),
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl: number) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#f5222d' }}>
          {formatPrice(pnl)}
        </span>
      ),
    },
    {
      title: t('risk.position.risk'),
      dataIndex: 'risk',
      key: 'risk',
      render: (risk: number) => (
        <Tag color={
          risk > 80 ? 'error' :
          risk > 50 ? 'warning' :
          'success'
        }>
          {formatPercent(risk / 100)}
        </Tag>
      ),
    },
    {
      title: t('risk.position.actions'),
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          icon={<StopOutlined />}
          onClick={() => onClosePosition(record.symbol)}
        >
          {t('risk.position.close')}
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert
        message={t('risk.warning.title')}
        description={t('risk.warning.description')}
        type="warning"
        showIcon
      />

      <StyledCard
        title={
          <>
            <SafetyCertificateOutlined />
            {t('risk.settings.title')}
          </>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="maxPositionSize"
            label={t('risk.settings.maxPositionSize')}
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value!.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="maxDrawdown"
            label={t('risk.settings.maxDrawdown')}
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value!.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="stopLoss"
            label={t('risk.settings.stopLoss')}
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value!.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="takeProfit"
            label={t('risk.settings.takeProfit')}
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={1000}
              formatter={value => `${value}%`}
              parser={value => value!.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="trailingStop"
            label={t('risk.settings.trailingStop')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.trailingStop !== curr.trailingStop}
          >
            {({ getFieldValue }) => 
              getFieldValue('trailingStop') && (
                <Form.Item
                  name="trailingStopDistance"
                  label={t('risk.settings.trailingStopDistance')}
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    parser={value => value!.replace('%', '')}
                  />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('risk.settings.save')}
            </Button>
          </Form.Item>
        </Form>
      </StyledCard>

      <Card title={t('risk.positions.title')}>
        <Table
          columns={columns}
          dataSource={positions}
          rowKey="symbol"
          pagination={false}
        />
      </Card>
    </Space>
  );
};

export default RiskManager; 