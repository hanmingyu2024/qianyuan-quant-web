import React from 'react';
import { Card, Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatTime, formatNumber } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

interface Order {
  id: string;
  symbol: string;
  type: 'limit' | 'market';
  direction: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'pending' | 'filled' | 'canceled';
  createTime: string;
}

interface OrderMonitorProps {
  data: Order[];
}

const OrderMonitor: React.FC<OrderMonitorProps> = ({ data }) => {
  const { t } = useTranslation();

  const columns: ColumnsType<Order> = [
    {
      title: t('monitor.order.time'),
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => formatTime(time),
    },
    {
      title: t('monitor.order.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: t('monitor.order.type'),
      key: 'type',
      render: (_, record) => (
        <Space>
          <Tag color={record.direction === 'buy' ? 'green' : 'red'}>
            {record.direction === 'buy' ? t('common.buy') : t('common.sell')}
          </Tag>
          <Tag>
            {record.type === 'limit' ? t('common.limit') : t('common.market')}
          </Tag>
        </Space>
      ),
    },
    {
      title: t('monitor.order.price'),
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        record.type === 'market' ? t('common.marketPrice') : `$${formatNumber(price, 2)}`
      ),
    },
    {
      title: t('monitor.order.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: t('monitor.order.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { text: t('common.pending'), color: 'processing' },
          filled: { text: t('common.filled'), color: 'success' },
          canceled: { text: t('common.canceled'), color: 'default' },
        };
        const { text, color } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <Card 
      title={t('monitor.order.title')}
      style={{ marginBottom: 16 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default OrderMonitor; 