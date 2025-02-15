import React from 'react';
import { Table } from 'antd';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import dayjs from 'dayjs';

const Container = styled.div`
  .buy-row {
    color: #52c41a;
  }
  .sell-row {
    color: #f5222d;
  }
`;

interface Trade {
  id: string;
  time: number;
  price: number;
  amount: number;
  direction: 'buy' | 'sell';
}

const TradeHistory: React.FC = () => {
  const trades = useSelector((state: RootState) => state.market.trades);

  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: '40%',
      render: (time: number) => dayjs(time).format('HH:mm:ss'),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: '30%',
      render: (price: number) => price.toFixed(2),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      width: '30%',
      render: (amount: number) => amount.toFixed(4),
    },
  ];

  return (
    <Container>
      <Table
        columns={columns}
        dataSource={trades}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ y: 300 }}
        rowClassName={(record) => record.direction === 'buy' ? 'buy-row' : 'sell-row'}
      />
    </Container>
  );
};

export default TradeHistory; 