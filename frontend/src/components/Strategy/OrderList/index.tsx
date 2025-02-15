import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { formatTime, formatNumber } from '@/utils/formatter';

interface Order {
  id: string;
  symbol: string;
  type: 'limit' | 'market';
  direction: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'pending' | 'filled' | 'canceled' | 'rejected';
  createTime: string;
  updateTime: string;
  message?: string;
}

interface OrderListProps {
  data: Order[];
  loading?: boolean;
  onCancel?: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  data,
  loading,
  onCancel,
}) => {
  const columns: ColumnsType<Order> = [
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => formatTime(time),
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '类型',
      key: 'orderType',
      render: (_, record) => (
        <Space>
          <Tag color={record.direction === 'buy' ? 'green' : 'red'}>
            {record.direction === 'buy' ? '买入' : '卖出'}
          </Tag>
          <Tag>{record.type === 'limit' ? '限价' : '市价'}</Tag>
        </Space>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        record.type === 'market' ? '市价' : formatNumber(price, 2)
      ),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatNumber(amount, 4),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { text: '待成交', color: 'processing' },
          filled: { text: '已成交', color: 'success' },
          canceled: { text: '已撤销', color: 'default' },
          rejected: { text: '已拒绝', color: 'error' },
        };
        const { text, color } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'pending' && (
          <Button
            type="link"
            size="small"
            onClick={() => onCancel?.(record)}
          >
            撤单
          </Button>
        )
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showQuickJumper: true,
      }}
      scroll={{ x: true }}
    />
  );
};

export default OrderList; 