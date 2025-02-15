import React from 'react';
import { Card, Table, Tag, Progress, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatNumber, formatPercent } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

interface Position {
  symbol: string;
  direction: 'long' | 'short';
  amount: number;
  value: number;
  pnl: number;
  pnlRate: number;
  risk: number;
}

interface PositionMonitorProps {
  data: Position[];
}

const PositionMonitor: React.FC<PositionMonitorProps> = ({ data }) => {
  const { t } = useTranslation();

  const columns: ColumnsType<Position> = [
    {
      title: t('monitor.position.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: t('monitor.position.direction'),
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={direction === 'long' ? 'green' : 'red'}>
          {direction === 'long' ? t('common.long') : t('common.short')}
        </Tag>
      ),
    },
    {
      title: t('monitor.position.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: t('monitor.position.value'),
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${formatNumber(value, 2)}`,
    },
    {
      title: t('monitor.position.pnl'),
      key: 'pnl',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: record.pnl >= 0 ? '#52c41a' : '#f5222d' }}>
            ${formatNumber(record.pnl, 2)}
          </span>
          <span style={{ color: record.pnlRate >= 0 ? '#52c41a' : '#f5222d' }}>
            {formatPercent(record.pnlRate)}
          </span>
        </Space>
      ),
    },
    {
      title: t('monitor.position.risk'),
      key: 'risk',
      render: (_, record) => (
        <Progress
          percent={record.risk * 100}
          size="small"
          status={
            record.risk >= 0.8 ? 'exception' :
            record.risk >= 0.5 ? 'active' : 'normal'
          }
          format={(percent) => `${formatNumber(percent!, 1)}%`}
        />
      ),
    },
  ];

  return (
    <Card 
      title={t('monitor.position.title')}
      style={{ marginBottom: 16 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="symbol"
        pagination={false}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default PositionMonitor; 