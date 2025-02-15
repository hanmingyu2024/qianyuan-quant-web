import React from 'react';
import { Table, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface Position {
  symbol: string;
  direction: 'long' | 'short';
  amount: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

const PositionList: React.FC = () => {
  const positions = useSelector((state: RootState) => state.trading.positions);

  const columns: ColumnsType<Position> = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction) => (
        <Tag color={direction === 'long' ? 'green' : 'red'}>
          {direction === 'long' ? '多' : '空'}
        </Tag>
      ),
    },
    {
      title: '持仓数量',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '开仓均价',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
    },
    {
      title: '当前价格',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
    },
    {
      title: '未实现盈亏',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl, record) => (
        <span style={{ color: pnl >= 0 ? '#52c41a' : '#f5222d' }}>
          {pnl.toFixed(2)} ({record.pnlPercent.toFixed(2)}%)
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" danger>
          平仓
        </Button>
      ),
    },
  ];

  return <Table columns={columns} dataSource={positions} rowKey="symbol" />;
};

export default PositionList; 